import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateContentHash, checkRecentDuplicate } from '@/lib/content-hash'
import { trackEventServer, AnalyticsEvents, AnalyticsCategories, AnalyticsActions } from '@/lib/analytics'
import { copyNestBlobToMemory, extractFilenameFromBlobUrl } from '@/lib/blob-copy'
import { getSystemUserId } from '@/lib/openGrove'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { branchId } = await params
    const body = await req.json()

    const { text, visibility, legacyFlag, mediaUrl, videoUrl, audioUrl, memoryCard, forceDuplicate, parentMemoryId, contributorEmail, contributorName } = body

    // Check if this is an Open Grove branch (allows anonymous contributions)
    const branchCheck = await prisma.branch.findFirst({
      where: { id: branchId },
      include: {
        person: {
          include: {
            memberships: {
              include: {
                grove: true,
              },
            },
          },
        },
      },
    })

    const isOpenGroveBranch = branchCheck?.person?.memberships?.some(m => m.grove?.isOpenGrove) || false

    // Determine user ID - authenticated user or system user for anonymous Open Grove
    let userId: string
    let isAnonymousContribution = false

    if (session?.user) {
      userId = (session.user as any).id
    } else if (isOpenGroveBranch) {
      // Anonymous contribution to Open Grove - require email
      if (!contributorEmail) {
        return NextResponse.json(
          { error: 'Email is required to contribute to Open Grove' },
          { status: 400 }
        )
      }
      userId = await getSystemUserId()
      isAnonymousContribution = true
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Check if user has access to this branch
    // For anonymous Open Grove contributions, we already verified above
    let branch
    if (isAnonymousContribution) {
      // Anonymous Open Grove - use the branch we already fetched
      branch = branchCheck
    } else {
      // Authenticated user - check permissions
      branch = await prisma.branch.findFirst({
        where: {
          id: branchId,
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId: userId,
                  approved: true,
                },
              },
            },
            {
              // Allow any authenticated user to add to Open Grove trees
              person: {
                discoveryEnabled: true,
              },
            },
          ],
        },
        include: {
          person: true, // Include person to check memory limits
        },
      })
    }

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      )
    }

    // Check memory limit for legacy trees
    if (branch.person?.isLegacy && branch.person?.memoryLimit !== null) {
      const currentCount = branch.person.memoryCount || 0
      const limit = branch.person.memoryLimit

      if (currentCount >= limit) {
        return NextResponse.json(
          {
            error: 'memory_limit_reached',
            message: `This legacy tree has reached its ${limit} memory limit. Adopt this tree into a Grove for unlimited memories.`,
            memoryCount: currentCount,
            memoryLimit: limit,
          },
          { status: 403 }
        )
      }

      // Check if approaching limit (at 90% or 50 memories, show adoption prompt)
      const warningThreshold = Math.max(50, Math.floor(limit * 0.9))
      if (currentCount >= warningThreshold && currentCount < limit) {
        // We'll return warning info with the successful response
        console.log(`⚠️ Memory limit warning: ${currentCount}/${limit} (${Math.round((currentCount/limit)*100)}%)`)
      }
    }

    // Generate content hash for duplicate detection
    const contentHash = generateContentHash(text, mediaUrl, audioUrl, videoUrl)

    // Check for recent duplicates (unless user explicitly forced)
    if (!forceDuplicate) {
      const { isDuplicate, existingEntry } = await checkRecentDuplicate(
        prisma,
        userId,
        branchId,
        contentHash,
        5 // 5 minute window
      )

      if (isDuplicate && existingEntry) {
        return NextResponse.json(
          {
            error: 'duplicate',
            message: 'You recently added a very similar memory. Was this intentional?',
            existingEntry: {
              id: existingEntry.id,
              text: existingEntry.text,
              createdAt: existingEntry.createdAt,
            },
          },
          { status: 409 }
        )
      }
    }

    // 🔒 CRITICAL FIX: Copy nest blobs to permanent storage
    // Detect if mediaUrl is from nest storage and copy it
    let finalMediaUrl = mediaUrl
    let finalVideoUrl = videoUrl

    if (mediaUrl && mediaUrl.includes('/nest/') && !mediaUrl.startsWith('data:')) {
      console.log(`📋 [NEST COPY] Detected nest photo, copying to permanent storage...`, { mediaUrl })

      // We need to create the entry first to get the ID for the destination path
      // So we'll do this after entry creation
      // For now, just log it
      console.log(`⚠️  [NEST COPY] Will copy after entry creation`)
    }

    if (videoUrl && videoUrl.includes('/nest/') && !videoUrl.startsWith('data:')) {
      console.log(`📋 [NEST COPY] Detected nest video, copying to permanent storage...`, { videoUrl })
      console.log(`⚠️  [NEST COPY] Will copy after entry creation`)
    }

    // Determine if entry needs approval (if user is not owner or anonymous)
    const isOwner = !isAnonymousContribution && branch.ownerId === userId
    // Anonymous contributions are auto-approved for Open Grove (public memorials)
    // Owner contributions are always approved
    const approved = isOwner || isAnonymousContribution

    const entry = await prisma.entry.create({
      data: {
        branchId,
        authorId: userId,
        text,
        visibility: isAnonymousContribution ? 'SHARED' : (visibility || 'PRIVATE'), // Anonymous always shared
        legacyFlag: legacyFlag || false,
        mediaUrl: finalMediaUrl || null,
        videoUrl: finalVideoUrl || null,
        audioUrl: audioUrl || null,
        memoryCard: memoryCard || null,
        approved,
        contentHash, // Store the hash
        status: 'ACTIVE', // Set initial status
        parentMemoryId: parentMemoryId || null, // For threaded replies
        contributorEmail: isAnonymousContribution ? contributorEmail : null,
        contributorName: isAnonymousContribution ? (contributorName || null) : null,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    })

    // 🔒 CRITICAL FIX: Now copy nest blobs to permanent storage
    if (mediaUrl && mediaUrl.includes('/nest/') && !mediaUrl.startsWith('data:')) {
      console.log(`📋 [NEST COPY] Copying nest photo to permanent storage for entry ${entry.id}`)

      const filename = extractFilenameFromBlobUrl(mediaUrl)
      const destinationPath = `memories/${entry.id}/${filename}`

      const copyResult = await copyNestBlobToMemory(mediaUrl, destinationPath, userId, entry.id)

      if (copyResult.success && copyResult.newUrl) {
        console.log(`✅ [NEST COPY] Successfully copied! Updating entry with new URL: ${copyResult.newUrl}`)

        // Update the entry with the new permanent URL
        await prisma.entry.update({
          where: { id: entry.id },
          data: { mediaUrl: copyResult.newUrl }
        })

        // Update the entry object to return the new URL
        entry.mediaUrl = copyResult.newUrl
      } else {
        console.error(`❌ [NEST COPY] Failed to copy nest photo! Entry will keep original URL.`, {
          error: copyResult.error
        })
        // Entry still has the nest URL - not ideal but at least it's saved
      }
    }

    if (videoUrl && videoUrl.includes('/nest/') && !videoUrl.startsWith('data:')) {
      console.log(`📋 [NEST COPY] Copying nest video to permanent storage for entry ${entry.id}`)

      const filename = extractFilenameFromBlobUrl(videoUrl)
      const destinationPath = `memories/${entry.id}/${filename}`

      const copyResult = await copyNestBlobToMemory(videoUrl, destinationPath, userId, entry.id)

      if (copyResult.success && copyResult.newUrl) {
        console.log(`✅ [NEST COPY] Successfully copied video! Updating entry with new URL: ${copyResult.newUrl}`)

        await prisma.entry.update({
          where: { id: entry.id },
          data: { videoUrl: copyResult.newUrl }
        })

        entry.videoUrl = copyResult.newUrl
      } else {
        console.error(`❌ [NEST COPY] Failed to copy nest video!`, {
          error: copyResult.error
        })
      }
    }

    // Increment memory count for legacy trees
    let memoryStatus = null
    if (branch.person?.isLegacy && branch.person?.memoryLimit !== null) {
      const updatedPerson = await prisma.person.update({
        where: { id: branch.person.id },
        data: { memoryCount: { increment: 1 } },
      })

      const newCount = updatedPerson.memoryCount
      const limit = branch.person.memoryLimit
      const percentFull = Math.round((newCount / limit) * 100)
      const warningThreshold = Math.max(50, Math.floor(limit * 0.9))
      const isNearLimit = newCount >= warningThreshold

      memoryStatus = {
        currentCount: newCount,
        limit: limit,
        percentFull: percentFull,
        showAdoptionPrompt: isNearLimit,
        warningLevel: newCount >= limit * 0.95 ? 'urgent' : isNearLimit ? 'warning' : 'normal',
        adoptionMessage: isNearLimit
          ? `Your loved one's light is growing bright 🌟\n\nYou've added ${newCount} memories (${percentFull}% full). Adopt this tree into a Grove for unlimited storage.`
          : null,
      }
    }

    // Create audit log for memory creation
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'CREATE',
        targetType: 'ENTRY',
        targetId: entry.id,
        metadata: JSON.stringify({
          branchId,
          visibility: entry.visibility,
          legacyFlag: entry.legacyFlag,
        }),
      },
    })

    // Track memory creation with detailed metadata
    const memoryType = audioUrl ? 'audio' : mediaUrl ? 'photo' : videoUrl ? 'video' : 'text'
    await trackEventServer(prisma, userId, {
      eventType: AnalyticsEvents.MEMORY_CREATED,
      category: AnalyticsCategories.MEMORIES,
      action: AnalyticsActions.CREATED,
      metadata: {
        memoryId: entry.id,
        branchId,
        memoryType,
        hasMedia: !!(mediaUrl || audioUrl || videoUrl),
        hasCard: !!memoryCard,
        isLegacyTree: branch.person?.isLegacy || false,
        visibility: entry.visibility,
        isOwner,
        needsApproval: !approved,
      },
    })

    return NextResponse.json({
      ...entry,
      memoryStatus,
    })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}

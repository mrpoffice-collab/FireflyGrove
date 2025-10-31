import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateContentHash, checkRecentDuplicate } from '@/lib/content-hash'

export async function POST(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const branchId = params.branchId
    const body = await req.json()

    const { text, visibility, legacyFlag, mediaUrl, videoUrl, audioUrl, memoryCard, forceDuplicate, parentMemoryId } = body

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Check if user has access to this branch
    const branch = await prisma.branch.findFirst({
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

    // Determine if entry needs approval (if user is not owner)
    const isOwner = branch.ownerId === userId
    const approved = isOwner

    const entry = await prisma.entry.create({
      data: {
        branchId,
        authorId: userId,
        text,
        visibility: visibility || 'PRIVATE',
        legacyFlag: legacyFlag || false,
        mediaUrl: mediaUrl || null,
        videoUrl: videoUrl || null,
        audioUrl: audioUrl || null,
        memoryCard: memoryCard || null,
        approved,
        contentHash, // Store the hash
        status: 'ACTIVE', // Set initial status
        parentMemoryId: parentMemoryId || null, // For threaded replies
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    })

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

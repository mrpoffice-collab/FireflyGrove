import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const branchId = formData.get('branchId') as string
    const text = formData.get('text') as string
    const imageFile = formData.get('image') as File

    if (!branchId || !imageFile) {
      return NextResponse.json({ error: 'Branch ID and image are required' }, { status: 400 })
    }

    // Verify user has access to this branch
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                approved: true,
              },
            },
          },
        ],
      },
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found or access denied' }, { status: 404 })
    }

    // Upload image to Vercel Blob
    const blob = await put(imageFile.name, imageFile, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Create entry in the database
    const entry = await prisma.entry.create({
      data: {
        branchId,
        authorId: user.id,
        text: text || 'Sound wave art created with Firefly Grove',
        mediaUrl: blob.url,
        visibility: 'PRIVATE',
        approved: true,
        status: 'ACTIVE',
      },
    })

    // Create memory link
    await prisma.memoryBranchLink.create({
      data: {
        memoryId: entry.id,
        branchId,
        role: 'origin',
        visibilityStatus: 'active',
      },
    })

    console.log(`[Save to Branch] Sound art saved to branch ${branchId}`)

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        branchId: entry.branchId,
        mediaUrl: entry.mediaUrl,
      },
    })
  } catch (error) {
    console.error('[Save to Branch] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save to branch' },
      { status: 500 }
    )
  }
}

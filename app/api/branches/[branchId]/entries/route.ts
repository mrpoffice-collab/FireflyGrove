import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { text, visibility, legacyFlag, mediaUrl, audioUrl } = body

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
        ],
      },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      )
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
        audioUrl: audioUrl || null,
        approved,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}

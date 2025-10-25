import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const branches = await prisma.branch.findMany({
      where: {
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
      include: {
        _count: {
          select: { entries: true },
        },
        tree: {
          include: {
            grove: {
              select: {
                id: true,
                name: true,
                userId: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(branches)
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { treeId, title, description } = body

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!treeId) {
      return NextResponse.json(
        { error: 'Tree ID is required' },
        { status: 400 }
      )
    }

    // Verify tree exists and user owns the grove
    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: {
        grove: true,
      },
    })

    if (!tree) {
      return NextResponse.json(
        { error: 'Tree not found' },
        { status: 404 }
      )
    }

    if (tree.grove.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have access to this tree' },
        { status: 403 }
      )
    }

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        treeId,
        ownerId: userId,
        title: title.trim(),
        description: description?.trim() || null,
        status: 'ACTIVE',
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'CREATE_BRANCH',
        targetType: 'BRANCH',
        targetId: branch.id,
        metadata: JSON.stringify({
          treeId,
          title: branch.title,
          description: branch.description,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      branch: {
        id: branch.id,
        title: branch.title,
        description: branch.description,
        status: branch.status,
        createdAt: branch.createdAt.toISOString(),
      },
      message: 'Branch created successfully',
    })
  } catch (error: any) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create branch' },
      { status: 500 }
    )
  }
}

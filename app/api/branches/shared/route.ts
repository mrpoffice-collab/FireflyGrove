import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/branches/shared
 *
 * Returns branches where the user is a member but not the owner
 * (i.e., branches they've been invited to from other groves)
 */
export async function GET(req: NextRequest) {
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

    // Get branches where user is an approved member but NOT the owner
    const sharedBranches = await prisma.branch.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
            approved: true,
          },
        },
        ownerId: {
          not: user.id, // NOT the owner
        },
        archived: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
        personStatus: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            grove: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        person: {
          select: {
            id: true,
            name: true,
            isLegacy: true,
          },
        },
        entries: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            status: 'ACTIVE',
          },
          select: {
            createdAt: true,
          },
        },
        _count: {
          select: {
            entries: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    })

    return NextResponse.json({
      sharedBranches,
    })
  } catch (error) {
    console.error('[Shared Branches] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared branches' },
      { status: 500 }
    )
  }
}

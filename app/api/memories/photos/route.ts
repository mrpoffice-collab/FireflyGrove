import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get all branches the user owns or is a member of
    const userBranches = await prisma.branch.findMany({
      where: {
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
        archived: false,
      },
      select: { id: true },
    })

    const branchIds = userBranches.map(b => b.id)

    // Fetch all entries with photos from these branches
    const photosEntries = await prisma.entry.findMany({
      where: {
        branchId: { in: branchIds },
        mediaUrl: { not: null },
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        mediaUrl: true,
        text: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to most recent 50 photos
    })

    return NextResponse.json({
      photos: photosEntries.map(entry => ({
        id: entry.id,
        url: entry.mediaUrl,
        caption: entry.text?.substring(0, 100) || '',
        branchTitle: entry.branch.title,
        createdAt: entry.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[Photos API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

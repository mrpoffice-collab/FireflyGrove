import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/video-collage/branches
 *
 * Returns user's branches with photo entries for video collage creation
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Find all branches where user is owner or approved member
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
        archived: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        person: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            deathDate: true,
          },
        },
        entries: {
          where: {
            status: 'ACTIVE',
            mediaUrl: {
              not: null, // Only entries with photos
            },
          },
          select: {
            id: true,
            mediaUrl: true,
            text: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Filter to only branches that have photos
    const branchesWithPhotos = branches
      .filter((branch) => branch.entries.length > 0)
      .map((branch) => ({
        id: branch.id,
        name: branch.name,
        description: branch.description,
        personName: branch.person?.name,
        birthDate: branch.person?.birthDate,
        deathDate: branch.person?.deathDate,
        photoCount: branch.entries.length,
        photos: branch.entries.map((entry) => ({
          id: entry.id,
          url: entry.mediaUrl,
          caption: entry.text,
          createdAt: entry.createdAt,
        })),
      }))

    return NextResponse.json(branchesWithPhotos)
  } catch (error) {
    console.error('Error fetching branches for video collage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}

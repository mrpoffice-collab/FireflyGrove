import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any)?.id

    // Fetch all branches owned by the user
    const branches = await prisma.branch.findMany({
      where: {
        ownerId: userId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        title: true,
        entries: {
          where: {
            OR: [
              { mediaUrl: { not: null } }, // Photo entries
              { audioUrl: { not: null } }, // Audio entries
            ],
            status: 'ACTIVE',
          },
          select: {
            id: true,
            mediaUrl: true,
            audioUrl: true,
            text: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // Flatten all photos and soundwaves from all branches
    const media = branches.flatMap((branch) =>
      branch.entries.map((entry) => {
        // If it has a photo, use the photo
        if (entry.mediaUrl) {
          return {
            id: entry.id,
            url: entry.mediaUrl,
            type: 'photo',
            caption: entry.text?.substring(0, 100) || '',
            branchId: branch.id,
            branchName: branch.title,
            createdAt: entry.createdAt,
          }
        }
        // If it has audio, use the soundwave image
        else if (entry.audioUrl) {
          return {
            id: entry.id,
            url: `/audio/${entry.id}-soundwave.png`,
            type: 'soundwave',
            caption: entry.text?.substring(0, 100) || '',
            branchId: branch.id,
            branchName: branch.title,
            createdAt: entry.createdAt,
          }
        }
        return null
      }).filter(Boolean)
    )

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching grove photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

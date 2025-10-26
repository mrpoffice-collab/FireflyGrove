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
            mediaUrl: { not: null },
            status: 'ACTIVE',
          },
          select: {
            id: true,
            mediaUrl: true,
            text: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // Flatten all photos from all branches
    const photos = branches.flatMap((branch) =>
      branch.entries
        .filter((entry) => entry.mediaUrl)
        .map((entry) => ({
          id: entry.id,
          url: entry.mediaUrl!,
          caption: entry.text?.substring(0, 100) || '',
          branchId: branch.id,
          branchName: branch.title,
          createdAt: entry.createdAt,
        }))
    )

    return NextResponse.json(photos)
  } catch (error) {
    console.error('Error fetching grove photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

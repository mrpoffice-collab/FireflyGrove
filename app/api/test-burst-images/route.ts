import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get branches
    const branches = await prisma.branch.findMany({
      where: {
        ownerId: user.id,
        status: 'ACTIVE',
        archived: false,
      },
      select: { id: true },
    })

    // Get entries with images
    const entries = await prisma.entry.findMany({
      where: {
        branchId: { in: branches.map((b) => b.id) },
        status: 'ACTIVE',
        mediaUrl: { not: null },
      },
      select: {
        id: true,
        text: true,
        mediaUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching test images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

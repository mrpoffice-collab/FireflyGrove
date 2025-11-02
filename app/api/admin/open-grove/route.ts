import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    let where: any = {
      type: 'memorial'
    }

    switch (filter) {
      case 'public':
        where.isPublic = true
        break
      case 'featured':
        where.isFeatured = true
        break
      // 'all' returns all memorials regardless of status
    }

    const memorials = await prisma.branch.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        isPublic: true,
        isFeatured: true,
        createdAt: true,
        _count: {
          select: {
            entries: true,
            members: true
          }
        },
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    })

    return NextResponse.json({ memorials })
  } catch (error) {
    console.error('Open Grove fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memorials' },
      { status: 500 }
    )
  }
}

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
      isLegacy: true,
      discoveryEnabled: true
    }

    switch (filter) {
      case 'public':
        where.discoveryEnabled = true
        break
      case 'featured':
        // Note: Person model doesn't have isFeatured, only SparkCollection does
        // For now, just show all public memorials
        where.discoveryEnabled = true
        break
      // 'all' returns all public memorials
    }

    const memorials = await prisma.person.findMany({
      where,
      select: {
        id: true,
        name: true,
        birthDate: true,
        deathDate: true,
        memoryCount: true,
        memoryLimit: true,
        discoveryEnabled: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        branches: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            title: true
          },
          take: 1
        }
      },
      orderBy: [
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

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    // Build where clause based on filter
    let where: any = {}

    switch (filter) {
      case 'beta':
        where.isBetaTester = true
        break
      case 'subscriber':
        where.subscriptionStatus = 'active'
        break
      case 'trial':
        where.grove = {
          planType: 'trial'
        }
        break
      case 'admin':
        where.isAdmin = true
        break
      // 'all' returns everyone
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        isBetaTester: true,
        isAdmin: true,
        subscriptionStatus: true,
        createdAt: true,
        _count: {
          select: {
            entries: true,
            ownedBranches: true
          }
        },
        grove: {
          select: {
            planType: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to 100 for performance
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('User management error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

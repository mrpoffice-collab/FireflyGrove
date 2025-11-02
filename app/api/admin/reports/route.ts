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
    const statusParam = searchParams.get('status') || 'pending'

    // Map frontend status values to database values
    const statusMap: { [key: string]: string } = {
      'pending': 'OPEN',
      'reviewed': 'ACTION_TAKEN',
      'dismissed': 'DISMISSED'
    }

    let where: any = {}
    if (statusParam !== 'all') {
      where.status = statusMap[statusParam] || 'OPEN'
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        memory: {
          select: {
            id: true,
            content: true,
            branch: {
              select: {
                title: true,
                isPublic: true
              }
            }
          }
        },
        reporter: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    // Transform the response to match frontend expectations
    const transformedReports = reports.map(report => ({
      id: report.id,
      reason: report.reason,
      description: report.notes,
      status: report.status === 'OPEN' ? 'pending' : report.status === 'ACTION_TAKEN' ? 'reviewed' : 'dismissed',
      createdAt: report.createdAt,
      entry: report.memory,
      reportedBy: report.reporter
    }))

    return NextResponse.json({ reports: transformedReports })
  } catch (error) {
    console.error('Reports fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

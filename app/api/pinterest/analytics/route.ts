import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pinterest, getAnalyticsDateRange } from '@/lib/pinterest'

export const dynamic = 'force-dynamic'

/**
 * GET /api/pinterest/analytics
 * Get Pinterest analytics for account or specific pin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = (session.user as any).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!pinterest.isConfigured()) {
      return NextResponse.json(
        { error: 'Pinterest API not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(req.url)
    const pinId = searchParams.get('pinId')
    const days = parseInt(searchParams.get('days') || '30')

    const { startDate, endDate } = getAnalyticsDateRange(days)

    let analytics

    if (pinId) {
      // Get analytics for a specific pin
      analytics = await pinterest.getPinAnalytics(pinId, startDate, endDate)
    } else {
      // Get account-level analytics
      analytics = await pinterest.getUserAnalytics(startDate, endDate)
    }

    return NextResponse.json({ analytics, startDate, endDate })

  } catch (error: any) {
    console.error('Error fetching Pinterest analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { facebook } from '@/lib/facebook'

export const dynamic = 'force-dynamic'

/**
 * GET /api/facebook/connect
 * Initiate Facebook OAuth flow
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!facebook.isConfigured()) {
      return NextResponse.json(
        { error: 'Facebook API not configured' },
        { status: 503 }
      )
    }

    const userId = (session.user as any).id

    // Generate state parameter with user ID for security
    const state = Buffer.from(
      JSON.stringify({
        userId,
        timestamp: Date.now(),
      })
    ).toString('base64')

    // Get Facebook OAuth authorization URL
    const authUrl = facebook.getAuthorizationUrl(state)

    // Redirect to Facebook OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error('Error initiating Facebook OAuth:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to connect to Facebook' },
      { status: 500 }
    )
  }
}

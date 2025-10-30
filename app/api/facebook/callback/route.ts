import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { facebook } from '@/lib/facebook'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/facebook/callback
 * Handle Facebook OAuth callback
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)

    // Check for errors from Facebook
    const error = searchParams.get('error')
    if (error) {
      const errorReason = searchParams.get('error_reason')
      const errorDescription = searchParams.get('error_description')
      console.error('Facebook OAuth error:', { error, errorReason, errorDescription })

      return NextResponse.redirect(
        new URL(`/settings/imports?error=${encodeURIComponent(error)}`, req.url)
      )
    }

    // Get authorization code and state
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings/imports?error=no_code', req.url)
      )
    }

    // Verify state parameter
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        if (stateData.userId !== userId) {
          return NextResponse.redirect(
            new URL('/settings/imports?error=invalid_state', req.url)
          )
        }
      } catch (err) {
        console.error('Error parsing state:', err)
      }
    }

    // Exchange code for access token
    const tokenResponse = await facebook.getAccessToken(code)

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedToken = await facebook.getLongLivedToken(tokenResponse.access_token)

    // Calculate expiration date
    const expiresAt = longLivedToken.expires_in
      ? new Date(Date.now() + longLivedToken.expires_in * 1000)
      : null

    // Get user's Facebook profile to verify
    const profile = await facebook.getUserProfile(longLivedToken.access_token)

    // Store token in database
    await prisma.facebookToken.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: longLivedToken.access_token,
        expiresAt,
        scope: 'user_photos,user_posts,public_profile,email',
      },
      update: {
        accessToken: longLivedToken.access_token,
        expiresAt,
        scope: 'user_photos,user_posts,public_profile,email',
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'FACEBOOK_CONNECTED',
        targetType: 'USER',
        targetId: userId,
        metadata: JSON.stringify({
          facebookUserId: profile.id,
          facebookName: profile.name,
        }),
      },
    })

    // Redirect to import page with success message
    return NextResponse.redirect(
      new URL('/settings/imports?connected=facebook', req.url)
    )
  } catch (error: any) {
    console.error('Error in Facebook OAuth callback:', error)
    return NextResponse.redirect(
      new URL(
        `/settings/imports?error=${encodeURIComponent(error.message || 'callback_failed')}`,
        req.url
      )
    )
  }
}

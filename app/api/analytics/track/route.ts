import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      eventType,
      category,
      action,
      metadata,
      sessionId,
      durationMs,
      isError = false,
      errorMessage,
      isSuccess = true,
      isAbandoned = false,
    } = body

    // Validate required fields
    if (!eventType || !category || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, category, action' },
        { status: 400 }
      )
    }

    // Get user agent from headers
    const userAgent = request.headers.get('user-agent')

    // Create analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: session?.user ? (session.user as any).id : null,
        eventType,
        category,
        action,
        metadata: metadata ? JSON.stringify(metadata) : null,
        sessionId,
        userAgent,
        durationMs,
        isError,
        errorMessage,
        isSuccess,
        isAbandoned,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    // Don't fail the request if analytics fails - fail silently
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

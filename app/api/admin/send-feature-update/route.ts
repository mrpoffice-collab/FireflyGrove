import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendFeatureUpdateEmail } from '@/lib/email'

/**
 * POST /api/admin/send-feature-update
 *
 * Send feature update emails to users
 * Admin only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { updates, targetAudience } = body

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      )
    }

    // Validate update structure
    for (const update of updates) {
      if (!update.emoji || !update.title || !update.description) {
        return NextResponse.json(
          { error: 'Each update must have emoji, title, and description' },
          { status: 400 }
        )
      }
    }

    // Determine which users to send to
    let whereClause: any = {
      status: 'ACTIVE', // Only active users
    }

    if (targetAudience === 'beta') {
      // Beta testers only
      whereClause.isBetaTester = true
    } else if (targetAudience === 'subscribed') {
      // Users with active subscriptions
      whereClause.subscriptionStatus = 'active'
    } else if (targetAudience === 'all') {
      // All active users (default)
      // No additional filters
    } else if (targetAudience === 'mvp') {
      // MVP users: beta testers OR users with at least 1 memory
      whereClause = {
        status: 'ACTIVE',
        OR: [
          { isBetaTester: true },
          {
            entries: {
              some: {
                status: 'ACTIVE',
              },
            },
          },
        ],
      }
    }

    // Fetch target users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No users found matching target audience' },
        { status: 400 }
      )
    }

    // Send emails (in production, consider using a job queue)
    const results = {
      total: users.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const recipient of users) {
      try {
        const result = await sendFeatureUpdateEmail(
          recipient.email,
          recipient.name,
          updates
        )

        if (result.success) {
          results.sent++
        } else {
          results.failed++
          results.errors.push(`${recipient.email}: ${result.error}`)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error: any) {
        results.failed++
        results.errors.push(`${recipient.email}: ${error.message}`)
      }
    }

    // Log the broadcast
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'SEND_FEATURE_UPDATE',
        targetType: 'EMAIL_BROADCAST',
        targetId: `audience:${targetAudience}`,
        metadata: JSON.stringify({
          targetAudience,
          totalRecipients: results.total,
          sent: results.sent,
          failed: results.failed,
          updates: updates.map(u => u.title),
        }),
      },
    })

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error sending feature updates:', error)
    return NextResponse.json(
      { error: 'Failed to send feature updates' },
      { status: 500 }
    )
  }
}

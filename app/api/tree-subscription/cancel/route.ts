import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { freezeTreeOnSubscriptionExpiry } from '@/lib/freeze'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export const dynamic = 'force-dynamic'

/**
 * POST /api/tree-subscription/cancel
 *
 * Cancel an Individual Tree subscription
 * Body: {
 *   membershipId: string (GroveTreeMembership ID)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { membershipId } = body

    // Validation
    if (!membershipId) {
      return NextResponse.json(
        { error: 'Membership ID is required' },
        { status: 400 }
      )
    }

    // Verify membership exists and user has access
    const membership = await prisma.groveTreeMembership.findUnique({
      where: { id: membershipId },
      include: {
        grove: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        person: {
          select: {
            name: true,
          },
        },
        subscription: true,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      )
    }

    // Verify user owns the Grove
    if (membership.grove.user.id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this subscription' },
        { status: 403 }
      )
    }

    // Check if subscription exists
    if (!membership.subscription) {
      return NextResponse.json(
        { error: 'No subscription found for this Tree' },
        { status: 404 }
      )
    }

    // Cancel in Stripe
    const stripeSubscriptionId = membership.subscription.stripeSubscriptionId

    if (stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError)
        // Continue anyway - update local status
      }
    }

    // Update subscription status
    await prisma.treeSubscription.update({
      where: { id: membership.subscription.id },
      data: {
        status: 'canceled',
      },
    })

    // Check if Tree should be frozen
    // (Only freeze if Grove is also inactive)
    if (membership.grove.status !== 'active') {
      await freezeTreeOnSubscriptionExpiry(membershipId)
    }

    return NextResponse.json({
      success: true,
      message: `${membership.person.name}'s Tree subscription has been canceled. Access will continue until the end of the billing period.`,
      canceledAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error canceling tree subscription:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

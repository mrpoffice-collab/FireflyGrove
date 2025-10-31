import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TREE_PLAN } from '@/lib/plans'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export const dynamic = 'force-dynamic'

/**
 * POST /api/tree-subscription/create
 *
 * Create a Stripe checkout session for Individual Tree subscription ($4.99/year)
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
    const userEmail = session.user.email!
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
                stripeCustomerId: true,
              },
            },
          },
        },
        person: {
          select: {
            id: true,
            name: true,
          },
        },
        subscription: {
          select: {
            id: true,
            status: true,
          },
        },
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
        { error: 'You do not have permission to subscribe to this Tree' },
        { status: 403 }
      )
    }

    // Check if already has an active subscription
    if (membership.subscription && membership.subscription.status === 'active') {
      return NextResponse.json(
        { error: 'This Tree already has an active subscription' },
        { status: 400 }
      )
    }

    // Check if Individual Tree price is configured
    if (!TREE_PLAN.stripePriceId) {
      return NextResponse.json(
        { error: 'Individual Tree subscription is not configured' },
        { status: 500 }
      )
    }

    // Get or create Stripe customer
    let stripeCustomerId = membership.grove.user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
        },
      })
      stripeCustomerId = customer.id

      // Save customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: TREE_PLAN.stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          membershipId,
          personId: membership.person.id,
          groveId: membership.grove.id,
          userId,
          type: 'individual_tree',
        },
      },
      metadata: {
        membershipId,
        personId: membership.person.id,
        personName: membership.person.name,
        groveId: membership.grove.id,
        userId,
        type: 'individual_tree',
      },
      success_url: `${process.env.NEXTAUTH_URL}/grove?tree_subscribed=true&person=${encodeURIComponent(membership.person.name)}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/grove?tree_subscription_canceled=true`,
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Error creating tree subscription checkout:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

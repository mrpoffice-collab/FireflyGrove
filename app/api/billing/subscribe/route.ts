import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { PLANS } from '@/lib/plans'

export const dynamic = 'force-dynamic'

/**
 * POST /api/billing/subscribe
 *
 * Create a Stripe Checkout session for subscribing or changing plans
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    const plan = PLANS[planId]

    if (!plan || planId === 'trial') {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: 'Plan is not configured for subscription' },
        { status: 400 }
      )
    }

    // Get user's grove
    const grove = await prisma.grove.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    })

    if (!grove) {
      return NextResponse.json({ error: 'Grove not found' }, { status: 404 })
    }

    // Create or get Stripe customer
    let customerId = grove.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: grove.user.email || undefined,
        metadata: {
          userId,
          groveId: grove.id,
        },
      })

      customerId = customer.id

      // Update grove with customer ID
      await prisma.grove.update({
        where: { id: grove.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: grove.stripeSubscriptionId ? 'subscription' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      metadata: {
        userId,
        groveId: grove.id,
        planId,
      },
      subscription_data: grove.stripeSubscriptionId
        ? undefined
        : {
            metadata: {
              userId,
              groveId: grove.id,
              planId,
            },
          },
    })

    return NextResponse.json({
      url: checkoutSession.url,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

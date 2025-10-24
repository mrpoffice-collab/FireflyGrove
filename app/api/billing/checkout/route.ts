import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { getPlanByPriceId } from '@/lib/plans'

export const dynamic = 'force-dynamic'

/**
 * POST /api/billing/checkout
 *
 * Create a Stripe Checkout session for Grove subscription
 * Body: { priceId: string }
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
    const { priceId } = await req.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Validate the price ID
    const plan = getPlanByPriceId(priceId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Get or create user's Grove
    let grove = await prisma.grove.findUnique({
      where: { userId },
    })

    if (!grove) {
      // Create a Grove for users who don't have one yet
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      // Beta testers get Family Grove (10 trees), others get Trial (1 tree)
      const planType = user?.isBetaTester ? 'family' : 'trial'
      const treeLimit = user?.isBetaTester ? 10 : 1

      grove = await prisma.grove.create({
        data: {
          userId,
          name: `${user?.name}'s Grove`,
          planType,
          treeLimit,
          treeCount: 0,
          status: 'active',
        },
      })

      if (user?.isBetaTester) {
        console.log(`[Beta] Created Family Grove for beta tester ${user.email}`)
      }
    }

    // Get or create Stripe customer
    let customerId = grove.stripeCustomerId

    if (!customerId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: {
          userId,
          groveId: grove.id,
        },
      })

      customerId = customer.id

      // Update Grove with customer ID
      await prisma.grove.update({
        where: { id: grove.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/grove?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      metadata: {
        userId,
        groveId: grove.id,
        planType: plan.id,
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
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

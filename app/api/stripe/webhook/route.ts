import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { isDemoMode } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({ received: true })
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object
      await prisma.user.update({
        where: {
          stripeCustomerId: subscription.customer as string,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
          status: subscription.status === 'active' ? 'ACTIVE' : 'LOCKED',
        },
      })
      break

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object
      await prisma.user.update({
        where: {
          stripeCustomerId: deletedSubscription.customer as string,
        },
        data: {
          subscriptionStatus: 'cancelled',
          status: 'LOCKED',
          graceEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day grace
        },
      })
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

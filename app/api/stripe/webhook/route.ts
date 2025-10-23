import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getPlanByPriceId } from '@/lib/plans'
import Stripe from 'stripe'
import { isDemoMode } from '@/lib/demo'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/webhook
 *
 * Handle Stripe webhook events for Grove subscriptions
 * Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
 */
export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({ received: true })
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }

  console.log(`[Stripe Webhook] Event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, groveId, planType } = session.metadata || {}

  if (!userId || !groveId) {
    console.error('[Stripe Webhook] Missing metadata in checkout session')
    return
  }

  const subscription = await stripe!.subscriptions.retrieve(
    session.subscription as string
  )

  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanByPriceId(priceId)

  if (!plan) {
    console.error(`[Stripe Webhook] Unknown price ID: ${priceId}`)
    return
  }

  // Update or create Grove
  await prisma.grove.upsert({
    where: { id: groveId },
    update: {
      planType: plan.id,
      treeLimit: plan.treeLimit,
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
    create: {
      id: groveId,
      ownerId: userId,
      name: 'My Grove',
      planType: plan.id,
      treeLimit: plan.treeLimit,
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`[Stripe Webhook] Grove ${groveId} subscribed to ${plan.name}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const grove = await prisma.grove.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!grove) {
    console.error(`[Stripe Webhook] Grove not found for subscription ${subscription.id}`)
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanByPriceId(priceId)

  if (!plan) {
    console.error(`[Stripe Webhook] Unknown price ID: ${priceId}`)
    return
  }

  // Map Stripe status to our status
  let status = 'active'
  if (subscription.status === 'past_due') {
    status = 'past_due'
  } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(subscription.status)) {
    status = 'canceled'
  }

  await prisma.grove.update({
    where: { id: grove.id },
    data: {
      planType: plan.id,
      treeLimit: plan.treeLimit,
      status,
      stripePriceId: priceId,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`[Stripe Webhook] Grove ${grove.id} updated: ${plan.name}, status: ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const grove = await prisma.grove.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!grove) {
    console.error(`[Stripe Webhook] Grove not found for subscription ${subscription.id}`)
    return
  }

  await prisma.grove.update({
    where: { id: grove.id },
    data: {
      status: 'canceled',
      subscriptionEndsAt: new Date(),
    },
  })

  console.log(`[Stripe Webhook] Grove ${grove.id} subscription canceled`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const grove = await prisma.grove.findUnique({
    where: { stripeCustomerId: invoice.customer as string },
  })

  if (!grove) {
    console.error(`[Stripe Webhook] Grove not found for customer ${invoice.customer}`)
    return
  }

  await prisma.grove.update({
    where: { id: grove.id },
    data: {
      status: 'past_due',
    },
  })

  console.log(`[Stripe Webhook] Grove ${grove.id} payment failed, status: past_due`)
}

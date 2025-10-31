import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getPlanByPriceId } from '@/lib/plans'
import { freezeGrove, unfreezeGrove, freezeTree, unfreezeTree } from '@/lib/freeze'
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
  const metadata = session.metadata || {}
  const subscriptionType = metadata.type || 'grove' // 'grove' or 'individual_tree'

  if (subscriptionType === 'individual_tree') {
    await handleIndividualTreeCheckout(session)
    return
  }

  // Handle Grove subscription
  const { userId, groveId } = metadata

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
      renewalDate: new Date(subscription.current_period_end * 1000),
    },
    create: {
      id: groveId,
      userId: userId,
      name: 'My Grove',
      planType: plan.id,
      treeLimit: plan.treeLimit,
      treeCount: 0,
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      renewalDate: new Date(subscription.current_period_end * 1000),
    },
  })

  // Unfreeze Grove and its trees
  await unfreezeGrove(groveId)

  console.log(`[Stripe Webhook] Grove ${groveId} subscribed to ${plan.name}`)
}

async function handleIndividualTreeCheckout(session: Stripe.Checkout.Session) {
  const { membershipId, personId, groveId, userId } = session.metadata || {}

  if (!membershipId || !userId) {
    console.error('[Stripe Webhook] Missing metadata for individual tree subscription')
    return
  }

  const subscription = await stripe!.subscriptions.retrieve(
    session.subscription as string
  )

  const priceId = subscription.items.data[0]?.price.id

  // Create TreeSubscription record
  await prisma.treeSubscription.create({
    data: {
      userId,
      membershipId,
      status: 'active',
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      renewalDate: new Date(subscription.current_period_end * 1000),
    },
  })

  // Unfreeze the tree
  await unfreezeTree(membershipId)

  console.log(`[Stripe Webhook] Individual Tree subscription created for membership ${membershipId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Try Grove subscription first
  const grove = await prisma.grove.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (grove) {
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
      status = 'frozen'
    }

    await prisma.grove.update({
      where: { id: grove.id },
      data: {
        planType: plan.id,
        treeLimit: plan.treeLimit,
        status,
        stripePriceId: priceId,
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
        renewalDate: new Date(subscription.current_period_end * 1000),
      },
    })

    // Handle freezing/unfreezing
    if (status === 'frozen') {
      await freezeGrove(grove.id)
    } else if (status === 'active' && grove.status === 'frozen') {
      await unfreezeGrove(grove.id)
    }

    console.log(`[Stripe Webhook] Grove ${grove.id} updated: ${plan.name}, status: ${status}`)
    return
  }

  // Try Individual Tree subscription
  const treeSubscription = await prisma.treeSubscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (treeSubscription) {
    // Map Stripe status
    let status = 'active'
    if (subscription.status === 'past_due') {
      status = 'past_due'
    } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(subscription.status)) {
      status = 'frozen'
    }

    await prisma.treeSubscription.update({
      where: { id: treeSubscription.id },
      data: {
        status,
        renewalDate: new Date(subscription.current_period_end * 1000),
      },
    })

    // Handle freezing/unfreezing
    if (status === 'frozen') {
      await freezeTree(treeSubscription.membershipId)
    } else if (status === 'active') {
      await unfreezeTree(treeSubscription.membershipId)
    }

    console.log(`[Stripe Webhook] Tree subscription ${treeSubscription.id} updated: status ${status}`)
    return
  }

  console.error(`[Stripe Webhook] No Grove or Tree subscription found for ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Try Grove subscription first
  const grove = await prisma.grove.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (grove) {
    await prisma.grove.update({
      where: { id: grove.id },
      data: {
        status: 'frozen',
        subscriptionEndsAt: new Date(),
      },
    })

    // Freeze Grove and dependent trees
    await freezeGrove(grove.id)

    console.log(`[Stripe Webhook] Grove ${grove.id} subscription canceled and frozen`)
    return
  }

  // Try Individual Tree subscription
  const treeSubscription = await prisma.treeSubscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (treeSubscription) {
    await prisma.treeSubscription.update({
      where: { id: treeSubscription.id },
      data: {
        status: 'canceled',
      },
    })

    // Check if tree should be frozen (only if Grove is also inactive)
    const membership = await prisma.groveTreeMembership.findUnique({
      where: { id: treeSubscription.membershipId },
      include: {
        grove: {
          select: {
            status: true,
          },
        },
      },
    })

    if (membership && membership.grove.status !== 'active') {
      await freezeTree(treeSubscription.membershipId)
    }

    console.log(`[Stripe Webhook] Tree subscription ${treeSubscription.id} canceled`)
    return
  }

  console.error(`[Stripe Webhook] No Grove or Tree subscription found for ${subscription.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const grove = await prisma.grove.findUnique({
    where: { stripeCustomerId: invoice.customer as string },
  })

  if (grove) {
    await prisma.grove.update({
      where: { id: grove.id },
      data: {
        status: 'past_due',
      },
    })

    console.log(`[Stripe Webhook] Grove ${grove.id} payment failed, status: past_due`)
    return
  }

  // Could also handle Individual Tree subscription payment failures here
  console.log(`[Stripe Webhook] Payment failed for customer ${invoice.customer}`)
}

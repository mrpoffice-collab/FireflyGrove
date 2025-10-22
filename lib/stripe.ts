import Stripe from 'stripe'
import { isDemoMode } from './demo'

// Initialize Stripe only if not in demo mode
export const stripe = isDemoMode()
  ? null
  : new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia',
    })

export async function createCheckoutSession(userId: string, email: string) {
  if (isDemoMode()) {
    return { url: '/grove?demo_checkout=true' }
  }

  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Firefly Grove Subscription',
            description: 'Preserve your memories forever',
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: 500, // $5.00
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/grove?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/grove?checkout=cancelled`,
    metadata: {
      userId,
    },
  })

  return { url: session.url }
}

export async function getSubscriptionStatus(customerId: string) {
  if (isDemoMode() || !stripe) {
    return { status: 'active', current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000 }
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  })

  if (subscriptions.data.length === 0) {
    return { status: 'inactive', current_period_end: null }
  }

  const subscription = subscriptions.data[0]
  return {
    status: subscription.status,
    current_period_end: subscription.current_period_end * 1000,
  }
}

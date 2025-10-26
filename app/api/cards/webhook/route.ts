import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId
        const deliveryType = session.metadata?.deliveryType

        if (!orderId) {
          console.error('No orderId in session metadata')
          break
        }

        // Update order status to paid
        await prisma.cardOrder.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            status: 'processing',
          },
        })

        // Create delivery record
        const delivery = await prisma.cardDelivery.create({
          data: {
            orderId,
            deliveryType: deliveryType || 'digital',
            status: 'pending',
          },
        })

        // Trigger delivery based on type
        if (deliveryType === 'digital') {
          // Queue digital delivery (Phase 5)
          await triggerDigitalDelivery(orderId, delivery.id)
        } else if (deliveryType === 'physical') {
          // Queue physical printing (Phase 6)
          await triggerPhysicalDelivery(orderId, delivery.id)
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await prisma.cardOrder.update({
            where: { id: orderId },
            data: {
              status: 'cancelled',
              paymentStatus: 'failed',
            },
          })
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Delivery trigger functions
async function triggerDigitalDelivery(orderId: string, deliveryId: string) {
  try {
    // Call the send-digital API endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cards/send-digital`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, deliveryId }),
    })

    if (!response.ok) {
      throw new Error('Failed to send digital card')
    }

    console.log(`Digital card sent for order ${orderId}`)
  } catch (error) {
    console.error(`Failed to trigger digital delivery for order ${orderId}:`, error)
  }
}

async function triggerPhysicalDelivery(orderId: string, deliveryId: string) {
  try {
    // Call the print API endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cards/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, deliveryId }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit print job')
    }

    console.log(`Physical card submitted to Lob for order ${orderId}`)
  } catch (error) {
    console.error(`Failed to trigger physical delivery for order ${orderId}:`, error)
  }
}

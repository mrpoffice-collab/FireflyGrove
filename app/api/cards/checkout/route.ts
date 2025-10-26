import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any)?.id
    const body = await request.json()

    const {
      templateId,
      sentimentId,
      deliveryType,
      customMessage,
      selectedPhotos,
      senderName,
      signature,
      recipientEmail,
      recipientName,
      recipientAddress,
    } = body

    // Validate required fields
    if (!templateId || !deliveryType || !customMessage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch template
    const template = await prisma.cardTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Check if user is a grove owner (has branches or entries)
    const userBranchCount = await prisma.branch.count({
      where: { ownerId: userId, status: 'ACTIVE' }
    })

    const isGroveOwner = userBranchCount > 0

    // Calculate price based on delivery type
    const amount = deliveryType === 'digital'
      ? template.digitalPrice
      : template.physicalPrice

    // If NOT a grove owner and price > 0, create Stripe checkout
    if (!isGroveOwner && amount > 0) {
      // Create pending order
      const order = await prisma.cardOrder.create({
        data: {
          userId,
          templateId,
          sentimentId: sentimentId || null,
          deliveryType,
          customMessage,
          selectedPhotos: selectedPhotos ? JSON.stringify(selectedPhotos) : null,
          senderName,
          signature,
          recipientEmail: deliveryType === 'digital' ? recipientEmail : null,
          recipientName: deliveryType === 'physical' ? recipientName : null,
          recipientAddress: deliveryType === 'physical' && recipientAddress
            ? JSON.stringify(recipientAddress)
            : null,
          status: 'pending_payment',
          paymentStatus: 'pending',
          totalAmount: amount,
        },
      })

      // Create Stripe checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${template.name} - ${deliveryType === 'digital' ? 'Digital' : 'Printed & Mailed'}`,
                description: customMessage.substring(0, 200),
                images: template.previewImage ? [template.previewImage] : [],
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/cards/success?order_id=${order.id}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/cards/create`,
        metadata: {
          orderId: order.id,
          userId: userId,
          deliveryType,
        },
      })

      // Store Stripe session ID
      await prisma.cardOrder.update({
        where: { id: order.id },
        data: { stripeSessionId: checkoutSession.id },
      })

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        orderId: order.id,
      })
    }

    // Grove owner or free card - create and deliver immediately
    const order = await prisma.cardOrder.create({
      data: {
        userId,
        templateId,
        sentimentId: sentimentId || null,
        deliveryType,
        customMessage,
        selectedPhotos: selectedPhotos ? JSON.stringify(selectedPhotos) : null,
        senderName,
        signature,
        recipientEmail: deliveryType === 'digital' ? recipientEmail : null,
        recipientName: deliveryType === 'physical' ? recipientName : null,
        recipientAddress: deliveryType === 'physical' && recipientAddress
          ? JSON.stringify(recipientAddress)
          : null,
        status: 'processing', // Complimentary - skip payment
        paymentStatus: 'paid', // Complimentary - no payment needed
        totalAmount: 0, // Free for grove owners
      },
    })

    // Create delivery record
    const delivery = await prisma.cardDelivery.create({
      data: {
        orderId: order.id,
        deliveryType: deliveryType,
        status: 'pending',
      },
    })

    // Trigger delivery immediately (complimentary)
    if (deliveryType === 'digital') {
      // Queue digital delivery
      try {
        console.log('🚀 Triggering digital card delivery...')
        const sendResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/cards/send-digital`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, deliveryId: delivery.id }),
        })

        if (!sendResponse.ok) {
          const errorData = await sendResponse.json()
          console.error('❌ Digital delivery failed:', errorData)
        } else {
          const successData = await sendResponse.json()
          console.log('✅ Digital delivery triggered:', successData)
        }
      } catch (err) {
        console.error('❌ Failed to trigger digital delivery:', err)
      }
    }

    // Return success - no Stripe checkout needed
    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Card created successfully!',
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

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

    // Calculate price based on delivery type
    const amount = deliveryType === 'digital'
      ? template.digitalPrice
      : template.physicalPrice

    // Create card order - complimentary for all members
    const order = await prisma.cardOrder.create({
      data: {
        userId,
        templateId,
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
        totalAmount: amount, // $0.00
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
      await fetch(`${process.env.NEXTAUTH_URL}/api/cards/send-digital`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, deliveryId: delivery.id }),
      }).catch(err => console.error('Failed to trigger digital delivery:', err))
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

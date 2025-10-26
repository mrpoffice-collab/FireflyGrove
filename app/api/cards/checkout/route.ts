import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
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

    // Create card order (pending payment)
    const order = await prisma.cardOrder.create({
      data: {
        userId,
        templateId,
        deliveryType,
        customMessage,
        selectedPhotos: selectedPhotos ? JSON.stringify(selectedPhotos) : null,
        senderName,
        recipientEmail: deliveryType === 'digital' ? recipientEmail : null,
        recipientName: deliveryType === 'physical' ? recipientName : null,
        recipientAddress: deliveryType === 'physical' && recipientAddress
          ? JSON.stringify(recipientAddress)
          : null,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: amount,
      },
    })

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100), // Convert to cents
            product_data: {
              name: `Greeting Card - ${template.name}`,
              description: `${deliveryType === 'digital' ? 'Digital' : 'Printed & Mailed'} greeting card`,
              images: template.previewImage ? [template.previewImage] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/cards/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cards/create`,
      client_reference_id: order.id,
      customer_email: session.user.email || undefined,
      metadata: {
        orderId: order.id,
        userId,
        deliveryType,
      },
    })

    // Update order with Stripe session ID
    await prisma.cardOrder.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: checkoutSession.id,
      },
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

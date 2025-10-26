import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { lobClient, generateCardHTML } from '@/lib/lob'

export async function POST(request: Request) {
  try {
    const { orderId, deliveryId } = await request.json()

    if (!orderId || !deliveryId) {
      return NextResponse.json(
        { error: 'Order ID and Delivery ID required' },
        { status: 400 }
      )
    }

    // Fetch order with template and delivery info
    const order = await prisma.cardOrder.findUnique({
      where: { id: orderId },
      include: {
        template: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (!order.recipientName || !order.recipientAddress) {
      return NextResponse.json(
        { error: 'Recipient address not found' },
        { status: 400 }
      )
    }

    // Parse recipient address
    const recipientAddress = JSON.parse(order.recipientAddress)

    // Verify address with Lob
    let verifiedAddress
    try {
      verifiedAddress = await lobClient.verifyAddress({
        name: order.recipientName,
        address_line1: recipientAddress.line1,
        address_line2: recipientAddress.line2,
        address_city: recipientAddress.city,
        address_state: recipientAddress.state,
        address_zip: recipientAddress.zip,
      })
    } catch (verifyError) {
      console.error('Address verification failed:', verifyError)

      // Update delivery with error
      await prisma.cardDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'failed',
          errorMessage: 'Address verification failed',
        },
      })

      return NextResponse.json(
        { error: 'Invalid mailing address' },
        { status: 400 }
      )
    }

    // Generate card HTML
    const photos = order.selectedPhotos ? JSON.parse(order.selectedPhotos) : []
    const { front, back } = generateCardHTML({
      templateHTML: order.template.htmlTemplate,
      templateCSS: order.template.cssStyles,
      customMessage: order.customMessage,
      selectedPhotos: photos,
      senderName: order.senderName || '',
      categoryIcon: order.template.category.icon,
    })

    // Create postcard with Lob
    try {
      const postcard = await lobClient.createPostcard({
        description: `Greeting Card - Order ${order.id.slice(0, 8)}`,
        to: verifiedAddress,
        from: {
          name: 'Firefly Grove',
          address_line1: '123 Memory Lane', // TODO: Replace with actual return address
          address_city: 'San Francisco',
          address_state: 'CA',
          address_zip: '94102',
          address_country: 'US',
        },
        front,
        back,
        size: '6x9',
        metadata: {
          orderId: order.id,
          userId: order.userId,
        },
      })

      // Update delivery record with Lob tracking info
      await prisma.cardDelivery.update({
        where: { id: deliveryId },
        data: {
          lobMailId: postcard.id,
          trackingUrl: postcard.url,
          expectedDelivery: postcard.expected_delivery_date
            ? new Date(postcard.expected_delivery_date)
            : null,
          status: 'sent',
        },
      })

      // Update order status
      await prisma.cardOrder.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          sentAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        lobMailId: postcard.id,
        trackingUrl: postcard.url,
        expectedDelivery: postcard.expected_delivery_date,
      })
    } catch (lobError: any) {
      console.error('Lob API error:', lobError)

      // Update delivery with error
      await prisma.cardDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'failed',
          errorMessage: lobError.message || 'Failed to submit print job',
          retryCount: { increment: 1 },
          lastRetryAt: new Date(),
        },
      })

      return NextResponse.json(
        { error: 'Failed to submit print job' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Physical printing error:', error)
    return NextResponse.json(
      { error: 'Failed to print physical card' },
      { status: 500 }
    )
  }
}

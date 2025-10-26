import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    // Fetch delivery and order info
    const delivery = await prisma.cardDelivery.findUnique({
      where: { viewCode: code },
      include: {
        order: {
          include: {
            template: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    // Fetch sentiment if it exists
    let sentiment = null
    if (delivery.order.sentimentId) {
      sentiment = await prisma.cardSentiment.findUnique({
        where: { id: delivery.order.sentimentId },
        select: {
          id: true,
          coverMessage: true,
          insideMessage: true,
        },
      })
    }

    // Track view (increment count and record first open)
    await prisma.cardDelivery.update({
      where: { id: delivery.id },
      data: {
        viewCount: { increment: 1 },
        openedAt: delivery.openedAt || new Date(),
        status: 'opened',
      },
    })

    // Return order with sentiment data
    return NextResponse.json({
      ...delivery.order,
      sentiment,
    })
  } catch (error) {
    console.error('Error fetching card:', error)
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    )
  }
}

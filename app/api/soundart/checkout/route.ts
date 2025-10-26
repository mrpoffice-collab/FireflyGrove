import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { trackEventServer, AnalyticsEvents, AnalyticsCategories, AnalyticsActions } from '@/lib/analytics'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const SOUNDART_PRICE = 2.99 // Price for non-grove owners

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    const body = await request.json()
    const { artworkData, title } = body

    // Check if user is a grove owner
    const userBranchCount = await prisma.branch.count({
      where: { ownerId: userId, status: 'ACTIVE' }
    })

    const isGroveOwner = userBranchCount > 0

    // Grove owners get free download - shouldn't reach here but just in case
    if (isGroveOwner) {
      // Track analytics: Soundwave download (complimentary)
      await trackEventServer(prisma, userId, {
        eventType: AnalyticsEvents.SOUNDWAVE_DOWNLOADED,
        category: AnalyticsCategories.SOUNDWAVE,
        action: AnalyticsActions.DOWNLOADED,
        metadata: {
          title: title || 'Untitled',
          isGroveOwner: true,
          isComplimentary: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Grove owners get complimentary downloads',
      })
    }

    // Create Stripe checkout session for non-grove owners
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sound Wave Art - High Resolution',
              description: title ? `"${title}" - Print-ready 2000x2000px soundwave artwork` : 'Print-ready 2000x2000px soundwave artwork',
            },
            unit_amount: Math.round(SOUNDART_PRICE * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/soundart/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/soundart`,
      metadata: {
        userId,
        title: title || 'Untitled',
        productType: 'soundwave_art',
      },
    })

    // Track analytics: Soundwave checkout started (non-grove owner)
    await trackEventServer(prisma, userId, {
      eventType: AnalyticsEvents.SOUNDWAVE_CHECKOUT_STARTED,
      category: AnalyticsCategories.SOUNDWAVE,
      action: AnalyticsActions.CHECKOUT,
      metadata: {
        title: title || 'Untitled',
        amount: SOUNDART_PRICE,
        isGroveOwner: false,
        sessionId: checkoutSession.id,
      },
    })

    // TODO: Store artwork data temporarily for retrieval after payment
    // For now, we'll just redirect to download page which will have them recreate it
    // In production, you'd want to:
    // 1. Upload artworkData to cloud storage
    // 2. Store reference in database with session ID
    // 3. Allow download after payment confirmation

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Soundart checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

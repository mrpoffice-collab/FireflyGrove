import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { TREE_PLAN } from '@/lib/plans'
import { resend, isResendConfigured, SENDER_EMAIL } from '@/lib/resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/tree-transfers/:token/accept
 *
 * Accept a tree transfer invitation
 * Body: { option: 'grove' | 'single' | 'new-grove' }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { token } = await params
    const { option } = await req.json()

    if (!option || !['grove', 'single', 'new-grove'].includes(option)) {
      return NextResponse.json(
        { error: 'Invalid option. Must be grove, single, or new-grove' },
        { status: 400 }
      )
    }

    // Find the transfer
    const transfer = await prisma.treeTransfer.findUnique({
      where: { token },
      include: {
        person: {
          include: {
            memberships: true,
          },
        },
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!transfer) {
      return NextResponse.json(
        { error: 'Transfer not found' },
        { status: 404 }
      )
    }

    // Check if transfer has expired
    if (new Date() > new Date(transfer.expiresAt)) {
      return NextResponse.json(
        { error: 'This transfer invitation has expired' },
        { status: 410 }
      )
    }

    // Check if transfer is not pending
    if (transfer.status !== 'pending') {
      return NextResponse.json(
        { error: `This transfer has already been ${transfer.status}` },
        { status: 400 }
      )
    }

    // Verify the recipient email matches the logged-in user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (user?.email.toLowerCase() !== transfer.recipientEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'This transfer was sent to a different email address' },
        { status: 403 }
      )
    }

    // Handle the three different acceptance options
    let destinationGroveId = ''
    let checkoutUrl: string | null = null

    if (option === 'grove') {
      // Option 1: Add to existing grove
      let grove = await prisma.grove.findUnique({
        where: { userId },
        include: {
          _count: {
            select: {
              memberships: {
                where: { status: 'active' },
              },
            },
          },
        },
      })

      if (!grove) {
        return NextResponse.json(
          { error: 'You do not have a grove. Please choose a different option.' },
          { status: 400 }
        )
      }

      // Check if grove has space
      const currentTreeCount = grove._count.memberships
      if (currentTreeCount >= grove.treeLimit) {
        return NextResponse.json(
          {
            error: 'Your grove has reached its tree limit. Please upgrade your plan or choose a different option.',
          },
          { status: 400 }
        )
      }

      destinationGroveId = grove.id

      // Create membership for the tree in the destination grove
      await prisma.groveTreeMembership.create({
        data: {
          groveId: destinationGroveId,
          personId: transfer.personId,
          isOriginal: false, // It's a transferred tree
          status: 'active',
        },
      })

      // Delete the old membership from sender's grove
      await prisma.groveTreeMembership.deleteMany({
        where: {
          personId: transfer.personId,
          grove: {
            userId: transfer.senderUserId,
          },
        },
      })

    } else if (option === 'single') {
      // Option 2: Subscribe to single tree
      // First, get or create user's grove (even for single tree, we need a grove)
      let grove = await prisma.grove.findUnique({
        where: { userId },
      })

      if (!grove) {
        grove = await prisma.grove.create({
          data: {
            userId,
            name: `${user?.name}'s Grove`,
            planType: 'trial',
            treeLimit: 1,
            treeCount: 0,
            status: 'active',
          },
        })
      }

      destinationGroveId = grove.id

      // Create membership for the tree
      const membership = await prisma.groveTreeMembership.create({
        data: {
          groveId: destinationGroveId,
          personId: transfer.personId,
          isOriginal: false,
          subscriptionOwnerId: userId,
          status: 'active',
        },
      })

      // Delete the old membership from sender's grove
      await prisma.groveTreeMembership.deleteMany({
        where: {
          personId: transfer.personId,
          grove: {
            userId: transfer.senderUserId,
          },
        },
      })

      // Create Stripe checkout session for single tree subscription
      if (!stripe) {
        return NextResponse.json(
          { error: 'Payment system not configured' },
          { status: 500 }
        )
      }

      if (!TREE_PLAN.stripePriceId) {
        return NextResponse.json(
          { error: 'Single tree pricing not configured' },
          { status: 500 }
        )
      }

      // Get or create Stripe customer
      let customerId = grove.stripeCustomerId

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email,
          metadata: {
            userId,
            groveId: grove.id,
          },
        })

        customerId = customer.id

        await prisma.grove.update({
          where: { id: grove.id },
          data: { stripeCustomerId: customerId },
        })
      }

      // Create checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: TREE_PLAN.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH_URL}/grove?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
        metadata: {
          userId,
          groveId: grove.id,
          membershipId: membership.id,
          transferId: transfer.id,
          subscriptionType: 'individual_tree',
        },
      })

      checkoutUrl = checkoutSession.url

    } else if (option === 'new-grove') {
      // Option 3: Create new grove
      let grove = await prisma.grove.findUnique({
        where: { userId },
      })

      if (grove) {
        return NextResponse.json(
          { error: 'You already have a grove. Please use "Add to My Grove" option.' },
          { status: 400 }
        )
      }

      // Determine plan type based on user status
      const planType = user?.isBetaTester ? 'family' : 'trial'
      const treeLimit = user?.isBetaTester ? 10 : 1

      grove = await prisma.grove.create({
        data: {
          userId,
          name: `${user?.name}'s Grove`,
          planType,
          treeLimit,
          treeCount: 0,
          status: 'active',
        },
      })

      destinationGroveId = grove.id

      // Create membership for the tree
      await prisma.groveTreeMembership.create({
        data: {
          groveId: destinationGroveId,
          personId: transfer.personId,
          isOriginal: false,
          status: 'active',
        },
      })

      // Delete the old membership from sender's grove
      await prisma.groveTreeMembership.deleteMany({
        where: {
          personId: transfer.personId,
          grove: {
            userId: transfer.senderUserId,
          },
        },
      })

      console.log(`[Tree Transfer] Created new grove for user ${user?.email}`)
    }

    // Update transfer status
    await prisma.treeTransfer.update({
      where: { id: transfer.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedBy: userId,
        destinationGroveId,
      },
    })

    console.log(
      `[Tree Transfer] Transfer accepted by ${user?.email} - Tree: ${transfer.person.name}, Option: ${option}`
    )

    // Send email notification to sender
    if (isResendConfigured()) {
      try {
        const optionText = option === 'grove'
          ? 'added to their existing grove'
          : option === 'single'
          ? 'subscribed as a single tree'
          : 'created a new grove'

        await resend.emails.send({
          from: SENDER_EMAIL,
          to: transfer.sender.email,
          subject: `${user?.name || user?.email} accepted your tree transfer 🌳`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Tree Transfer Accepted</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                  <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 300;">Firefly Grove</h1>
                  <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Tree Transfer Confirmation</p>
                </div>

                <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
                  <h2 style="color: #333; margin-top: 0;">Transfer Accepted! 🎉</h2>

                  <p><strong>${user?.name || user?.email}</strong> has accepted your tree transfer for <strong>${transfer.person.name}</strong>.</p>

                  <div style="background: white; padding: 15px; border-left: 3px solid #ffd700; margin: 20px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      <strong>Tree:</strong> ${transfer.person.name}<br>
                      <strong>New Owner:</strong> ${user?.email}<br>
                      <strong>Option Selected:</strong> ${optionText}
                    </p>
                  </div>

                  <p style="color: #666; font-size: 14px;">The tree has been successfully transferred and ${user?.name || user?.email} is now responsible for preserving these memories.</p>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="color: #999; font-size: 12px; margin: 5px 0;">
                    <a href="https://fireflygrove.app" style="color: #ffd700; text-decoration: none;">fireflygrove.app</a>
                  </p>
                </div>
              </body>
            </html>
          `,
        })

        console.log(`[Tree Transfer] Acceptance notification sent to sender`)
      } catch (emailError) {
        console.error('[Tree Transfer] Failed to send acceptance notification:', emailError)
        // Don't fail the transfer if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tree transfer accepted successfully',
      checkoutUrl,
      destinationGroveId,
    })
  } catch (error: any) {
    console.error('[Tree Transfer] Error accepting transfer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to accept tree transfer' },
      { status: 500 }
    )
  }
}

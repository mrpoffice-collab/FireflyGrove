import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resend, isResendConfigured, SENDER_EMAIL } from '@/lib/resend'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * POST /api/trees/:treeId/transfer-invite
 *
 * Send a tree transfer invitation to another user via email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const personId = params.treeId

    const body = await req.json()
    const { recipientEmail, message } = body

    if (!recipientEmail || !recipientEmail.trim()) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Prevent self-transfer
    const normalizedRecipient = recipientEmail.toLowerCase().trim()
    const userEmail = session.user.email?.toLowerCase().trim()
    if (normalizedRecipient === userEmail) {
      return NextResponse.json(
        { error: 'You cannot transfer a tree to yourself' },
        { status: 400 }
      )
    }

    // Verify the person/tree exists and user has access
    const person = await prisma.person.findFirst({
      where: {
        id: personId,
        memberships: {
          some: {
            grove: {
              userId,
            },
          },
        },
      },
      include: {
        memberships: {
          where: {
            grove: {
              userId,
            },
          },
          include: {
            grove: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Tree not found or you do not have permission to transfer it' },
        { status: 404 }
      )
    }

    // Check if there's already a pending transfer for this tree
    const existingTransfer = await prisma.treeTransfer.findFirst({
      where: {
        personId,
        status: 'pending',
      },
    })

    if (existingTransfer) {
      return NextResponse.json(
        { error: 'There is already a pending transfer for this tree' },
        { status: 400 }
      )
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Generate unique token for the acceptance link
    const token = crypto.randomBytes(32).toString('hex')

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create the tree transfer record
    const transfer = await prisma.treeTransfer.create({
      data: {
        personId,
        senderUserId: userId,
        recipientEmail: recipientEmail.toLowerCase(),
        message: message?.trim() || null,
        token,
        expiresAt,
        status: 'pending',
      },
    })

    // Send the email invitation
    const acceptUrl = `${process.env.NEXTAUTH_URL}/accept-tree-transfer/${token}`
    const senderName = session.user.name || 'Someone'
    const groveName = person.memberships[0]?.grove.name || 'their grove'

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: recipientEmail,
        subject: `${senderName} wants to transfer a tree to you 🌳`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Tree Transfer Invitation</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 300;">Firefly Grove</h1>
                <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Tree Transfer Invitation</p>
              </div>

              <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
                <h2 style="color: #333; margin-top: 0;">You've Received a Tree! 🌳</h2>

                <p><strong>${senderName}</strong> from <em>${groveName}</em> wants to transfer the tree for <strong>${person.name}</strong> to you.</p>

                ${message ? `
                  <div style="background: white; padding: 15px; border-left: 3px solid #ffd700; margin: 20px 0;">
                    <p style="margin: 0; color: #666; font-style: italic;">"${message}"</p>
                  </div>
                ` : ''}

                <h3 style="color: #333; margin-top: 25px;">What is this?</h3>
                <p>Someone is giving you ownership of a family tree on Firefly Grove! This tree contains memories, photos, and stories about ${person.name}.</p>

                <h3 style="color: #333; margin-top: 25px;">Your Options</h3>
                <p>When you accept, you can choose to:</p>
                <ul style="color: #555;">
                  <li><strong>Add to Your Grove</strong> - If you have a Firefly Grove account</li>
                  <li><strong>Subscribe to Single Tree</strong> - Just $4.99/year for this one tree</li>
                  <li><strong>Start a New Grove</strong> - Create a full grove (10 trees included)</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${acceptUrl}" style="background: #ffd700; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
                    Accept Tree Transfer
                  </a>
                </div>

                <p style="color: #999; font-size: 13px;">This invitation expires in 30 days.</p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 5px 0;">
                  If you didn't expect this, you can safely ignore this email.
                </p>
                <p style="color: #999; font-size: 12px; margin: 5px 0;">
                  <a href="https://fireflygrove.app" style="color: #ffd700; text-decoration: none;">fireflygrove.app</a>
                </p>
              </div>
            </body>
          </html>
        `,
      })

      console.log(`[Tree Transfer] Invitation sent to ${recipientEmail} for tree: ${person.name}`)

      return NextResponse.json({
        success: true,
        message: `Tree transfer invitation sent to ${recipientEmail}`,
        transferId: transfer.id,
      })

    } catch (emailError: any) {
      // Delete the transfer record if email fails
      await prisma.treeTransfer.delete({
        where: { id: transfer.id },
      })

      console.error('[Tree Transfer] Failed to send email:', emailError)
      return NextResponse.json(
        { error: `Failed to send email: ${emailError.message}` },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[Tree Transfer] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send tree transfer invitation' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resend, isResendConfigured, SENDER_EMAIL } from '@/lib/resend'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/send-beta-invite
 *
 * Send beta testing invite email to a user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Allow admins and beta testers to send invites
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, isBetaTester: true, name: true },
    })

    if (!user?.isAdmin && !user?.isBetaTester) {
      return NextResponse.json(
        { error: 'Beta tester or admin access required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, name, message } = body

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const inviteeName = name?.trim() || 'there'
    const senderName = session.user.name || 'The Firefly Grove team'
    const customMessage = message?.trim() || ''

    try {
      // Send the email
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: `You're invited to beta test Firefly Grove 🌟`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Beta Invite</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 300;">Firefly Grove</h1>
                <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Beta Testing Invitation</p>
              </div>

              <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
                <h2 style="color: #333; margin-top: 0;">You're Invited! 🎉</h2>

                <p>Hi ${inviteeName},</p>

                <p>${senderName} has invited you to beta test <strong>Firefly Grove</strong> - a digital platform for preserving family memories and stories.</p>

                ${customMessage ? `
                  <div style="background: white; padding: 15px; border-left: 3px solid #ffd700; margin: 20px 0;">
                    <p style="margin: 0; color: #666; font-style: italic;">"${customMessage}"</p>
                  </div>
                ` : ''}

                <h3 style="color: #333; margin-top: 25px;">What is Firefly Grove?</h3>
                <p>A beautiful place to:</p>
                <ul style="color: #555;">
                  <li><strong>Organize memories</strong> by creating Trees and Branches for family members</li>
                  <li><strong>Preserve stories</strong> with text, photos, and audio recordings</li>
                  <li><strong>Honor loved ones</strong> with memorial pages</li>
                  <li><strong>Collaborate</strong> with family members</li>
                  <li><strong>Plan for legacy</strong> with privacy controls</li>
                </ul>

                <h3 style="color: #333; margin-top: 25px;">How to Get Started</h3>
                <ol style="color: #555;">
                  <li>Click the button below to visit Firefly Grove</li>
                  <li>Sign up for a free account</li>
                  <li>Explore and test the features</li>
                  <li>Report any bugs or suggestions using the "🐛 Report an Issue" link in the app</li>
                </ol>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://fireflygrove.app" style="background: #ffd700; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
                    Start Testing Firefly Grove
                  </a>
                </div>

                <h3 style="color: #333; margin-top: 25px;">What We Need</h3>
                <p style="color: #555;">Your honest feedback! Try:</p>
                <ul style="color: #555; margin-bottom: 20px;">
                  <li>Creating a family tree</li>
                  <li>Adding branches for family members</li>
                  <li>Uploading a photo memory</li>
                  <li>Recording an audio memory</li>
                  <li>Creating a memorial for a loved one</li>
                  <li>Exploring the Open Grove</li>
                </ul>

                <h3 style="color: #333; margin-top: 25px;">Reporting Issues</h3>
                <p style="color: #555;">Found a bug or have a suggestion?</p>
                <ul style="color: #555;">
                  <li><strong>In the app:</strong> Click your name → "🐛 Report an Issue"</li>
                  <li><strong>Via email:</strong> Reply to this message</li>
                </ul>

                <div style="background: #fffbea; border: 1px solid #ffd700; border-radius: 5px; padding: 15px; margin-top: 25px;">
                  <p style="margin: 0; color: #666; font-size: 14px;">
                    <strong>Beta Perks:</strong> Family Grove plan (10 trees) free during beta, direct input on features, early access to new capabilities, and our deep gratitude for helping build something meaningful.
                  </p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 5px 0;">
                  This is a beta testing invitation
                </p>
                <p style="color: #999; font-size: 12px; margin: 5px 0;">
                  <a href="https://fireflygrove.app" style="color: #ffd700; text-decoration: none;">fireflygrove.app</a>
                </p>
              </div>
            </body>
          </html>
        `,
      })

      // Save the invite to the database
      await prisma.betaInvite.upsert({
        where: { email: email.toLowerCase() },
        update: {
          name: inviteeName !== 'there' ? inviteeName : null,
          message: customMessage || null,
          sentBy: (session.user as any).id,
          updatedAt: new Date(),
        },
        create: {
          email: email.toLowerCase(),
          name: inviteeName !== 'there' ? inviteeName : null,
          message: customMessage || null,
          sentBy: (session.user as any).id,
        },
      })

      console.log(`[Beta Invite] Sent to ${email} and saved to database`)

      return NextResponse.json({
        success: true,
        message: `Beta invite sent to ${email}`,
      })

    } catch (emailError: any) {
      console.error('[Beta Invite] Failed to send email:', emailError)
      return NextResponse.json(
        { error: `Failed to send email: ${emailError.message}` },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[Beta Invite] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send beta invite' },
      { status: 500 }
    )
  }
}

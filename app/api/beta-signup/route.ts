import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isDemoMode } from '@/lib/demo'
import { resend, isResendConfigured, SENDER_EMAIL } from '@/lib/resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/beta-signup
 *
 * Instant beta tester signup - no invite required
 * Used by the Facebook post landing page for immediate access
 */
export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: 'Registration is disabled in demo mode' },
      { status: 403 }
    )
  }

  try {
    const { email, password, name } = await req.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered. Please log in instead.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with automatic beta tester status
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        status: 'ACTIVE',
        isBetaTester: true, // Automatically grant beta tester access
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBetaTester: true,
      },
    })

    // Auto-create Grove for new beta tester
    await prisma.grove.create({
      data: {
        userId: user.id,
        name: `${name.trim()}'s Grove`,
        planType: 'family', // Beta testers get family plan
        treeLimit: 10,
        status: 'active',
      },
    })

    // Track in BetaInvite table (source: Facebook post)
    try {
      await prisma.betaInvite.upsert({
        where: { email: email.toLowerCase() },
        update: {
          name: name.trim(),
          message: 'Signed up via Facebook post',
          sentBy: null, // Self-signup
          updatedAt: new Date(),
        },
        create: {
          email: email.toLowerCase(),
          name: name.trim(),
          message: 'Signed up via Facebook post',
          sentBy: null, // Self-signup
        },
      })
    } catch (inviteError) {
      console.error('[Beta Signup] Failed to track invite:', inviteError)
      // Non-critical, continue
    }

    // Send welcome email
    if (isResendConfigured()) {
      try {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: email.toLowerCase(),
          subject: 'Welcome to Firefly Grove 🌿',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Firefly Grove</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

                {/* Header */}
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 15px;">🌿</div>
                  <h1 style="color: #ffd700; margin: 0 0 10px 0; font-size: 32px; font-weight: 300;">Welcome to Firefly Grove</h1>
                  <p style="color: #cccccc; margin: 0; font-size: 16px; font-style: italic;">Where memories take root and light never fades</p>
                </div>

                {/* Personal Message */}
                <div style="background: #ffffff; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                  <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">Hi ${name.trim()},</p>

                  <p style="font-size: 16px; color: #555; margin: 0 0 15px 0; line-height: 1.7;">
                    Thank you for stepping into my grove. This place means the world to me—it's where I've planted trees for the people I love, and where their stories glow like tiny fireflies in the dark.
                  </p>

                  <p style="font-size: 16px; color: #555; margin: 0 0 15px 0; line-height: 1.7;">
                    Now it's your turn. Plant a tree for someone who matters. Add a memory—maybe a photo, a voice recording, or just words. Watch it glow.
                  </p>

                  <p style="font-size: 16px; color: #555; margin: 0 0 15px 0; line-height: 1.7;">
                    This is a safe place. Private. Gentle. And always alive with the light of what we remember.
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://fireflygrove.app/grove" style="background: #ffd700; color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Plant Your First Tree
                    </a>
                  </div>
                </div>

                {/* What You Can Do */}
                <div style="background: #fff4d4; padding: 25px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ffd700;">
                  <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">What you can do in your grove:</h3>
                  <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li><strong>Plant trees</strong> for people you love (past or present)</li>
                    <li><strong>Add memories</strong> with text, photos, and voice recordings</li>
                    <li><strong>Create branches</strong> for different chapters of their life</li>
                    <li><strong>Invite others</strong> to collaborate on shared memories</li>
                    <li><strong>Honor loved ones</strong> with beautiful memorial pages</li>
                  </ul>
                </div>

                {/* Beta Perks */}
                <div style="background: #f9f9f9; padding: 25px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #9ca986;">
                  <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Your beta testing perks:</h3>
                  <ul style="color: #555; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                    <li>Family Grove plan (10 trees) completely free during beta</li>
                    <li>Direct access to me for feedback and suggestions</li>
                    <li>Help shape how this grows</li>
                    <li>Founding member recognition</li>
                  </ul>
                  <p style="color: #666; margin: 15px 0 0 0; font-size: 13px; font-style: italic;">
                    Found a bug or have an idea? Click your name in the top right → "🐛 Report an Issue"
                  </p>
                </div>

                {/* Personal Closing */}
                <div style="background: #ffffff; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
                  <p style="color: #555; margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; font-style: italic;">
                    "This might be one of the most meaningful things I've ever made—right up there with being a mom, a nana, and a foster mom. Because every story deserves a light—even if it shines twice."
                  </p>
                  <p style="color: #666; margin: 0; font-size: 14px; text-align: right;">
                    — Meschelle 💫
                  </p>
                </div>

                {/* Footer */}
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="color: #999; font-size: 12px; margin: 5px 0;">
                    Firefly Grove - Where memories glow forever
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 5px 0;">
                    <a href="https://fireflygrove.app" style="color: #ffd700; text-decoration: none;">fireflygrove.app</a>
                  </p>
                </div>
              </body>
            </html>
          `,
        })
        console.log(`[Beta Signup] Welcome email sent to ${email}`)
      } catch (emailError) {
        console.error('[Beta Signup] Failed to send welcome email:', emailError)
        // Non-critical, continue
      }
    }

    console.log(`[Beta Signup] New beta tester signed up: ${email}`)

    return NextResponse.json({
      success: true,
      user,
      message: 'Welcome to Firefly Grove! Your beta tester account has been created.',
    })
  } catch (error: any) {
    console.error('Beta signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}

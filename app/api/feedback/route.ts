import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resend, isResendConfigured, SENDER_EMAIL } from '@/lib/resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/feedback
 *
 * Submit user feedback and send via email
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const { page, description, severity } = body

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    const feedbackData = {
      page: page || 'Unknown',
      description: description.trim(),
      severity: severity || 'minor',
      userId: (session?.user as any)?.id || 'Anonymous',
      userEmail: session?.user?.email || 'Not logged in',
      userName: session?.user?.name || 'Anonymous User',
      timestamp: new Date().toISOString(),
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev',
    }

    // Log to console (backup)
    console.log('[Feedback Submitted]', feedbackData)

    // Send email if Resend is configured
    if (isResendConfigured()) {
      const feedbackEmail = process.env.FEEDBACK_EMAIL || process.env.EMAIL_FROM || 'feedback@fireflygrove.app'

      const severityColors: Record<string, string> = {
        minor: '#3b82f6',
        moderate: '#f59e0b',
        critical: '#ef4444',
        'data-loss': '#dc2626',
      }

      const severityLabels: Record<string, string> = {
        minor: 'Minor Issue',
        moderate: 'Moderate Issue',
        critical: 'Critical Issue',
        'data-loss': 'Data Loss',
      }

      try {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: feedbackEmail,
          subject: `[Firefly Grove Beta] ${severityLabels[severity] || 'Feedback'} - ${page}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Beta Feedback</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                  <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 300;">Firefly Grove</h1>
                  <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Beta Feedback Report</p>
                </div>

                <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
                  <div style="background: ${severityColors[severity]}; color: white; padding: 10px 15px; border-radius: 5px; margin-bottom: 20px; font-weight: 600;">
                    ${severityLabels[severity] || 'Feedback'}
                  </div>

                  <h2 style="color: #333; margin-top: 0;">Feedback Details</h2>

                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 8px 0; color: #666; font-weight: 600;">User:</td>
                      <td style="padding: 8px 0;">${feedbackData.userName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 8px 0; color: #666; font-weight: 600;">Email:</td>
                      <td style="padding: 8px 0;">${feedbackData.userEmail}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 8px 0; color: #666; font-weight: 600;">User ID:</td>
                      <td style="padding: 8px 0;"><code style="background: #eee; padding: 2px 6px; border-radius: 3px;">${feedbackData.userId}</code></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 8px 0; color: #666; font-weight: 600;">Page:</td>
                      <td style="padding: 8px 0;">${feedbackData.page}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 8px 0; color: #666; font-weight: 600;">Time:</td>
                      <td style="padding: 8px 0;">${new Date(feedbackData.timestamp).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: 600;">Build:</td>
                      <td style="padding: 8px 0;">${feedbackData.buildVersion}</td>
                    </tr>
                  </table>

                  <h3 style="color: #333; margin-top: 20px;">Description:</h3>
                  <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; white-space: pre-wrap;">
${feedbackData.description}
                  </div>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="color: #999; font-size: 12px; margin: 5px 0;">
                    Firefly Grove Beta Testing
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 5px 0;">
                    <a href="https://fireflygrove.app" style="color: #ffd700; text-decoration: none;">fireflygrove.app</a>
                  </p>
                </div>
              </body>
            </html>
          `,
        })

        console.log('[Feedback] Email sent successfully')
      } catch (emailError: any) {
        console.error('[Feedback] Failed to send email:', emailError)
        // Don't fail the request if email fails - feedback is logged
      }
    } else {
      console.log('[Feedback] Resend not configured - feedback logged to console only')
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback received. Thank you!'
    })

  } catch (error: any) {
    console.error('[Feedback] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

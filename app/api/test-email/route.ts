import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resend, SENDER_EMAIL, SENDER_NAME } from '@/lib/resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/test-email
 *
 * Send a test email using Resend
 * Body: {
 *   to: string (email address)
 *   subject?: string (optional)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to, subject } = await req.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error: 'Resend API key not configured',
          details: 'Please add RESEND_API_KEY to your environment variables'
        },
        { status: 500 }
      )
    }

    // Send test email
    const { data, error } = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [to],
      subject: subject || 'Test Email from Firefly Grove',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                background: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .firefly {
                font-size: 48px;
                margin-bottom: 10px;
              }
              h1 {
                color: #ffd966;
                font-size: 28px;
                font-weight: 300;
                margin: 0;
              }
              .tagline {
                color: #8892a6;
                font-size: 14px;
                margin-top: 10px;
              }
              .content {
                color: #555;
                font-size: 16px;
                margin: 30px 0;
              }
              .success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #8892a6;
                font-size: 12px;
              }
              .button {
                display: inline-block;
                background: #ffd966;
                color: #0a0e14;
                padding: 12px 30px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="firefly">✦</div>
                <h1>Firefly Grove</h1>
                <p class="tagline">Where memories take root and stories keep growing</p>
              </div>

              <div class="content">
                <p>Hello,</p>

                <div class="success">
                  <strong>✓ Email System Test Successful!</strong><br>
                  Your Firefly Grove email system is working correctly.
                </div>

                <p>This is a test email to verify that Resend is properly configured and able to send emails from your Firefly Grove application.</p>

                <p><strong>Test Details:</strong></p>
                <ul>
                  <li>Sent from: ${SENDER_EMAIL}</li>
                  <li>Sent to: ${to}</li>
                  <li>Sent at: ${new Date().toLocaleString()}</li>
                </ul>

                <p style="text-align: center;">
                  <a href="https://fireflygrove.app" class="button">Visit Firefly Grove</a>
                </p>
              </div>

              <div class="footer">
                <p>© ${new Date().getFullYear()} Firefly Grove<br>
                Where memories take root and stories keep growing</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Firefly Grove - Test Email

This is a test email to verify that Resend is properly configured.

Test Details:
- Sent from: ${SENDER_EMAIL}
- Sent to: ${to}
- Sent at: ${new Date().toLocaleString()}

Visit Firefly Grove: https://fireflygrove.app
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: data?.id,
      to,
    })
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to send test email',
      },
      { status: 500 }
    )
  }
}

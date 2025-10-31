import { resend, isResendConfigured, SENDER_EMAIL } from '../lib/resend.js'

async function sendTestBetaInvite() {
  const recipientEmail = 'mrpoffice@gmail.com'
  const recipientName = 'Meschelle'
  const senderName = 'The Firefly Grove Team'
  const customMessage = 'Testing the beta invite email system!'

  if (!isResendConfigured()) {
    console.error('❌ Resend is not configured')
    process.exit(1)
  }

  try {
    console.log(`📧 Sending test beta invite to ${recipientEmail}...`)

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipientEmail,
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

              <p>Hi ${recipientName},</p>

              <p>${senderName} has invited you to beta test <strong>Firefly Grove</strong> - a digital platform for preserving family memories and stories.</p>

              <div style="background: white; padding: 15px; border-left: 3px solid #ffd700; margin: 20px 0;">
                <p style="margin: 0; color: #666; font-style: italic;">"${customMessage}"</p>
              </div>

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
                  <strong>Beta Perks:</strong> Family Grove plan (10 trees) for free during beta, priority support, direct input on features, and founding member recognition!
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

    if (error) {
      console.error('❌ Failed to send email:', error)
      process.exit(1)
    }

    console.log('✅ Test beta invite email sent successfully!')
    console.log('Email ID:', data?.id)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

sendTestBetaInvite()

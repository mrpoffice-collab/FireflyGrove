import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendMemberInviteEmail(
  recipientEmail: string,
  recipientName: string,
  branchTitle: string,
  inviterName: string,
  branchUrl: string,
  isNewUser: boolean = false,
  personalMessage?: string
) {
  if (!resend) {
    console.log('Resend not configured - email not sent')
    return { success: false, error: 'Email service not configured' }
  }

  const fromEmail = process.env.EMAIL_FROM || 'noreply@fireflygrove.app'
  const buttonText = isNewUser ? 'Create Account & Join' : 'View Branch'
  const instructions = isNewUser
    ? "You'll need to create a free account to start collaborating."
    : "You can log in and start collaborating right away."

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `${inviterName} invited you to collaborate on "${branchTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Branch Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 300;">Firefly Grove</h1>
              <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Preserve the memories that glow brightest</p>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
              <h2 style="color: #333; margin-top: 0;">You've Been Invited!</h2>

              <p>Hi ${recipientName || 'there'},</p>

              <p><strong>${inviterName}</strong> has invited you to collaborate on the branch <strong>"${branchTitle}"</strong> in Firefly Grove.</p>

              ${personalMessage ? `
              <div style="background: #fff4d4; border-left: 4px solid #ffd700; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <div style="color: #333; font-size: 14px; font-style: italic; line-height: 1.6;">
                  "${personalMessage}"
                </div>
                <div style="color: #999; font-size: 12px; margin-top: 8px; text-align: right;">
                  — ${inviterName}
                </div>
              </div>
              ` : ''}

              <p style="color: #666; font-size: 14px; margin-bottom: 20px;">${instructions}</p>

              <p>As a member, you'll be able to:</p>
              <ul style="color: #555;">
                <li>View shared memories in this branch</li>
                <li>Add your own stories, photos, and voice recordings</li>
                <li>Contribute to preserving precious moments together</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${branchUrl}" style="background: #ffd700; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
                  ${buttonText}
                </a>
              </div>

              <p style="color: #999; font-size: 12px; text-align: center;">This invitation expires in 7 days</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                Firefly Grove - Preserve your memories forever
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
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendHeirNotificationEmail(
  heirEmail: string,
  branchTitle: string,
  ownerName: string,
  downloadUrl: string
) {
  if (!resend) {
    console.log('Resend not configured - email not sent')
    return { success: false, error: 'Email service not configured' }
  }

  const fromEmail = process.env.EMAIL_FROM || 'noreply@fireflygrove.app'

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: heirEmail,
      subject: `Legacy memories from ${ownerName} are now available`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Legacy Release</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 300;">Firefly Grove</h1>
              <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">A gift from the past</p>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
              <h2 style="color: #333; margin-top: 0;">Legacy Memories Released</h2>

              <p>Dear friend,</p>

              <p><strong>${ownerName}</strong> has left you a collection of memories from the branch <strong>"${branchTitle}"</strong>.</p>

              <p style="color: #555; font-style: italic;">These are special memories they wanted to share with you, preserved with care for this moment.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${downloadUrl}" style="background: #ffd700; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
                  Access Memories
                </a>
              </div>

              <p style="color: #666; font-size: 14px;">This link will allow you to download and view all the legacy memories that have been released to you.</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                Firefly Grove - Memories that last forever
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
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

interface FeatureUpdate {
  emoji: string
  title: string
  description: string
}

export async function sendFeatureUpdateEmail(
  recipientEmail: string,
  recipientName: string,
  updates: FeatureUpdate[]
) {
  if (!resend) {
    console.log('Resend not configured - email not sent')
    return { success: false, error: 'Email service not configured' }
  }

  const fromEmail = process.env.EMAIL_FROM || 'noreply@fireflygrove.app'

  const featuresHtml = updates.map(update => `
    <div style="margin-bottom: 24px; padding: 20px; background: #ffffff; border-radius: 8px; border-left: 4px solid #ffd700;">
      <div style="font-size: 32px; margin-bottom: 8px;">${update.emoji}</div>
      <h3 style="color: #333; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${update.title}</h3>
      <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">${update.description}</p>
    </div>
  `).join('')

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `✨ New features lighting up your Grove`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Feature Updates</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

            {/* Header */}
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
              <h1 style="color: #ffd700; margin: 0 0 10px 0; font-size: 32px; font-weight: 300;">✨ Firefly Grove</h1>
              <p style="color: #cccccc; margin: 0; font-size: 16px;">Your memories are glowing brighter</p>
            </div>

            {/* Greeting */}
            <div style="background: #ffffff; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">Hi ${recipientName || 'friend'},</p>
              <p style="font-size: 15px; color: #555; margin: 0; line-height: 1.7;">
                We've been busy making Firefly Grove even better for preserving your precious memories.
                Here's what's new in your grove:
              </p>
            </div>

            {/* Features */}
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              ${featuresHtml}
            </div>

            {/* Call to Action */}
            <div style="background: linear-gradient(135deg, #fff4d4 0%, #fffaeb 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; border: 2px solid #ffd700;">
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0; font-weight: 500;">
                Ready to try these new features?
              </p>
              <a href="https://fireflygrove.app/grove" style="background: #ffd700; color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Visit Your Grove
              </a>
            </div>

            {/* Personal Touch */}
            <div style="background: #ffffff; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #9ca986;">
              <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.7; font-style: italic;">
                "Every firefly in your grove represents a moment worth remembering. These new features
                help those moments shine even brighter, connecting hearts across time and distance."
              </p>
              <p style="color: #999; margin: 15px 0 0 0; font-size: 13px; text-align: right;">
                — The Firefly Grove Team 🌟
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
              <p style="color: #ccc; font-size: 11px; margin: 15px 0 5px 0;">
                You're receiving this because you're part of our MVP community
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

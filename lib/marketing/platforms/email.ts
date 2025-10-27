/**
 * Email Newsletter Sender
 * Sends newsletters via Resend API (can swap for SendGrid, Mailchimp, etc.)
 */

interface NewsletterEmail {
  subject: string
  content: string // Plain text or HTML
  recipientListId?: string // Optional: Resend audience ID
}

interface EmailResponse {
  success: boolean
  emailId?: string
  error?: string
}

/**
 * Send newsletter email
 * Requires: RESEND_API_KEY, NEWSLETTER_FROM_EMAIL, NEWSLETTER_AUDIENCE_ID in .env
 */
export async function sendNewsletter(email: NewsletterEmail): Promise<EmailResponse> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || 'newsletter@fireflygrove.app'
  const audienceId = process.env.NEWSLETTER_AUDIENCE_ID

  if (!apiKey) {
    console.error('❌ Resend API key not configured')
    return {
      success: false,
      error: 'Email service not configured. Add RESEND_API_KEY to .env',
    }
  }

  if (!audienceId) {
    console.error('❌ Newsletter audience not configured')
    return {
      success: false,
      error: 'Newsletter audience not configured. Add NEWSLETTER_AUDIENCE_ID to .env',
    }
  }

  try {
    // Send broadcast email to audience via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [audienceId], // Resend audience ID
        subject: email.subject,
        text: email.content,
        // Optional: HTML version
        // html: convertMarkdownToHtml(email.content),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Resend API error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send newsletter',
      }
    }

    const data = await response.json()
    console.log(`✅ Newsletter sent: ${data.id}`)

    return {
      success: true,
      emailId: data.id,
    }
  } catch (error) {
    console.error('❌ Error sending newsletter:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Alternative: Send to individual email addresses
 * Useful for testing before setting up audience
 */
export async function sendNewsletterToEmails(
  email: NewsletterEmail,
  recipients: string[]
): Promise<EmailResponse> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || 'newsletter@fireflygrove.app'

  if (!apiKey) {
    return {
      success: false,
      error: 'Email service not configured. Add RESEND_API_KEY to .env',
    }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject: email.subject,
        text: email.content,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    const data = await response.json()
    return {
      success: true,
      emailId: data.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

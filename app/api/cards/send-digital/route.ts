import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { orderId, deliveryId } = await request.json()

    console.log('📧 Starting digital card delivery:', { orderId, deliveryId })

    if (!orderId || !deliveryId) {
      console.error('❌ Missing orderId or deliveryId')
      return NextResponse.json(
        { error: 'Order ID and Delivery ID required' },
        { status: 400 }
      )
    }

    // Fetch order with template and delivery info
    const order = await prisma.cardOrder.findUnique({
      where: { id: orderId },
      include: {
        template: {
          include: {
            category: true,
          },
        },
      },
    })

    console.log('📦 Order fetched:', {
      orderId: order?.id,
      recipientEmail: order?.recipientEmail,
      senderName: order?.senderName,
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (!order.recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email not found' },
        { status: 400 }
      )
    }

    // Generate unique view code
    const viewCode = generateViewCode()
    const viewUrl = `${process.env.NEXTAUTH_URL}/cards/view/${viewCode}`

    // Update delivery record with view code and URL
    await prisma.cardDelivery.update({
      where: { id: deliveryId },
      data: {
        viewCode,
        viewUrl,
        status: 'sent',
      },
    })

    // Send email with Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Firefly Grove <onboarding@resend.dev>'
    console.log('📤 Sending email from:', fromEmail, 'to:', order.recipientEmail)

    try {
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: order.recipientEmail,
        subject: `You have a card from ${order.senderName || 'someone special'}`,
        html: generateEmailHTML({
          senderName: order.senderName || 'Someone special',
          viewUrl,
          categoryName: order.template.category.name,
          categoryIcon: order.template.category.icon,
        }),
      })

      console.log('✅ Email sent successfully:', emailResult)

      // Update delivery status
      await prisma.cardDelivery.update({
        where: { id: deliveryId },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      })

      // Update order status
      await prisma.cardOrder.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          sentAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        viewUrl,
      })
    } catch (emailError: any) {
      console.error('❌ Failed to send email:', {
        error: emailError,
        message: emailError?.message,
        statusCode: emailError?.statusCode,
        response: emailError?.response?.body,
      })

      // Update delivery with error
      await prisma.cardDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'failed',
          errorMessage: emailError?.message || 'Failed to send email',
          retryCount: { increment: 1 },
          lastRetryAt: new Date(),
        },
      })

      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: emailError?.message,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Digital delivery error:', error)
    return NextResponse.json(
      { error: 'Failed to send digital card' },
      { status: 500 }
    )
  }
}

function generateViewCode(): string {
  // Generate a random 12-character code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generateEmailHTML(params: {
  senderName: string
  viewUrl: string
  categoryName: string
  categoryIcon: string
}): string {
  const { senderName, viewUrl, categoryName, categoryIcon } = params

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You have a greeting card</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0E14;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0E14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #151B24; border-radius: 12px; overflow: hidden; border: 1px solid #2A3340;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1A2332 0%, #0F1419 100%);">
              <div style="font-size: 48px; margin-bottom: 16px;">${categoryIcon}</div>
              <h1 style="margin: 0; color: #FFD966; font-size: 28px; font-weight: 300; line-height: 1.2;">
                You have a greeting card
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <p style="margin: 0 0 24px; color: #E8EDF2; font-size: 18px; line-height: 1.6;">
                <strong>${senderName}</strong> sent you a heartfelt ${categoryName.toLowerCase()} card.
              </p>

              <!-- Card Preview Placeholder -->
              <div style="margin: 0 0 32px; padding: 60px 40px; background: linear-gradient(135deg, #1A2332 0%, #0F1419 100%); border-radius: 8px; border: 1px solid #2A3340;">
                <div style="font-size: 64px; margin-bottom: 16px;">💌</div>
                <p style="margin: 0; color: #9BA8B8; font-size: 14px;">
                  Click below to view your card
                </p>
              </div>

              <!-- CTA Button -->
              <a href="${viewUrl}" style="display: inline-block; padding: 16px 48px; background-color: #FFD966; color: #0A0E14; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 217, 102, 0.3);">
                View Your Card
              </a>

              <p style="margin: 24px 0 0; color: #9BA8B8; font-size: 12px;">
                Or copy this link: <br>
                <span style="color: #FFD966; word-break: break-all;">${viewUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0F1419; border-top: 1px solid #2A3340; text-align: center;">
              <p style="margin: 0 0 8px; color: #FFD966; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span style="font-size: 16px;">✦</span>
                Sent with Firefly Grove
              </p>
              <p style="margin: 0; color: #6B7A8F; font-size: 11px;">
                A place to preserve and share what matters most
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

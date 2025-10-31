import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndExpireTrustee } from '@/lib/trustee'
import { resend, isResendConfigured, SENDER_EMAIL } from '@/lib/resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/legacy-tree/:personId/transfer
 *
 * Transfer ownership of a legacy tree to another user
 * Body: { newOwnerEmail: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { personId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const personId = params.personId
    const body = await req.json()
    const { newOwnerEmail } = body

    if (!newOwnerEmail || !newOwnerEmail.trim()) {
      return NextResponse.json(
        { error: 'New owner email is required' },
        { status: 400 }
      )
    }

    // Find the person and verify permissions
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        trustee: {
          select: { id: true, email: true, name: true },
        },
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Legacy tree not found' },
        { status: 404 }
      )
    }

    if (!person.isLegacy) {
      return NextResponse.json(
        { error: 'This is not a legacy tree' },
        { status: 400 }
      )
    }

    // Check and expire trustee if needed
    await checkAndExpireTrustee(personId)

    // Re-fetch person to get updated trustee status
    const currentPerson = await prisma.person.findUnique({
      where: { id: personId },
      select: {
        trusteeId: true,
        ownerId: true,
      },
    })

    // Only trustee (if not expired) or owner can transfer ownership
    if (currentPerson && currentPerson.trusteeId !== userId && currentPerson.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the trustee or owner can transfer ownership' },
        { status: 403 }
      )
    }

    // Find the new owner by email
    const newOwner = await prisma.user.findUnique({
      where: { email: newOwnerEmail.trim().toLowerCase() },
    })

    if (!newOwner) {
      return NextResponse.json(
        { error: 'User with that email not found. They must have a Firefly Grove account.' },
        { status: 404 }
      )
    }

    // Don't transfer to self
    if (newOwner.id === person.ownerId) {
      return NextResponse.json(
        { error: 'This person is already the owner' },
        { status: 400 }
      )
    }

    // Update ownership
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        ownerId: newOwner.id,
        moderatorId: newOwner.id, // New owner also becomes moderator
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'TRANSFER',
        targetType: 'PERSON',
        targetId: personId,
        metadata: JSON.stringify({
          previousOwnerId: person.ownerId,
          newOwnerId: newOwner.id,
          newOwnerEmail: newOwner.email,
          transferredBy: userId === person.trusteeId ? 'trustee' : 'owner',
        }),
      },
    })

    // Send email notifications
    if (isResendConfigured()) {
      try {
        const transferrerName = session.user.name || session.user.email
        const transferredBy = userId === person.trusteeId ? 'trustee' : 'owner'

        // Email to new owner
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: newOwner.email,
          subject: `You've received ownership of ${person.name}'s legacy tree 🌳`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Legacy Tree Ownership Transfer</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                  <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 300;">Firefly Grove</h1>
                  <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Legacy Tree Ownership Transfer</p>
                </div>

                <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
                  <h2 style="color: #333; margin-top: 0;">You Are Now the Owner 🌳</h2>

                  <p><strong>${transferrerName}</strong> (${transferredBy}) has transferred ownership of <strong>${person.name}'s</strong> legacy tree to you.</p>

                  <div style="background: white; padding: 20px; border-left: 4px solid #ffd700; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">What This Means</h3>
                    <p style="margin: 0; color: #555;">
                      You are now responsible for preserving and managing this legacy tree. You can:
                    </p>
                    <ul style="color: #555; margin-top: 10px;">
                      <li>View and manage all memories</li>
                      <li>Add new memories (subject to plan limits)</li>
                      <li>Transfer ownership to someone else</li>
                      <li>Download the complete tree archive</li>
                    </ul>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/grove" style="background: #ffd700; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
                      View Your Grove
                    </a>
                  </div>
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

        // Email to previous owner
        if (person.owner?.email) {
          await resend.emails.send({
            from: SENDER_EMAIL,
            to: person.owner.email,
            subject: `Ownership of ${person.name}'s legacy tree has been transferred`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Legacy Tree Ownership Transfer Confirmation</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                    <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 300;">Firefly Grove</h1>
                    <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Transfer Confirmation</p>
                  </div>

                  <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #333; margin-top: 0;">Transfer Completed</h2>

                    <p>Ownership of <strong>${person.name}'s</strong> legacy tree has been transferred to <strong>${newOwner.name || newOwner.email}</strong>.</p>

                    <div style="background: white; padding: 15px; border-left: 3px solid #999; margin: 20px 0;">
                      <p style="margin: 0; color: #666; font-size: 14px;">
                        <strong>New Owner:</strong> ${newOwner.email}<br>
                        <strong>Transferred By:</strong> ${transferrerName} (${transferredBy})
                      </p>
                    </div>

                    <p style="color: #666; font-size: 14px;">You no longer have ownership responsibilities for this tree, but you may still have access depending on your role.</p>
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
        }

        console.log(`[Legacy Transfer] Emails sent for tree: ${person.name}`)
      } catch (emailError) {
        console.error('[Legacy Transfer] Failed to send email notifications:', emailError)
        // Don't fail the transfer if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ownership transferred to ${newOwner.name || newOwner.email}`,
      newOwner: {
        id: newOwner.id,
        name: newOwner.name,
        email: newOwner.email,
      },
    })
  } catch (error: any) {
    console.error('Error transferring ownership:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transfer ownership' },
      { status: 500 }
    )
  }
}

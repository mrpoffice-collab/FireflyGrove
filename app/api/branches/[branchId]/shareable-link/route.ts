import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * POST /api/branches/:branchId/shareable-link
 *
 * Creates a shareable invitation link that can be used by anyone
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const branchId = params.branchId
    const { message } = await req.json().catch(() => ({}))

    // Verify ownership
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      )
    }

    // Check if a shareable link already exists
    const existingShareableInvite = await prisma.invite.findFirst({
      where: {
        branchId,
        email: 'shareable@link',
        status: 'PENDING',
      },
    })

    if (existingShareableInvite) {
      // Return existing shareable link
      const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${existingShareableInvite.token}`
      return NextResponse.json({
        success: true,
        invite: {
          id: existingShareableInvite.id,
          token: existingShareableInvite.token,
          url: inviteUrl,
          expiresAt: existingShareableInvite.expiresAt,
          branchTitle: branch.title,
          inviterName: branch.owner.name,
        }
      })
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')

    // Create shareable invite (expires in 30 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const invite = await prisma.invite.create({
      data: {
        inviterId: userId,
        email: 'shareable@link', // Special email to indicate shareable link
        branchId,
        token,
        message,
        status: 'PENDING',
        expiresAt,
      },
    })

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        token: invite.token,
        url: inviteUrl,
        expiresAt: invite.expiresAt,
        branchTitle: branch.title,
        inviterName: branch.owner.name,
      }
    })
  } catch (error: any) {
    console.error('Error creating shareable link:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create shareable link' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/branches/:branchId/shareable-link
 *
 * Deletes the shareable invitation link
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const branchId = params.branchId

    // Verify ownership
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        ownerId: userId,
      },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the shareable link
    await prisma.invite.deleteMany({
      where: {
        branchId,
        email: 'shareable@link',
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting shareable link:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete shareable link' },
      { status: 500 }
    )
  }
}

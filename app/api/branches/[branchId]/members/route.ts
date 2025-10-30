import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMemberInviteEmail } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

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
    const { email, message } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

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

    // Get branch details first
    const branchWithOwner = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!branchWithOwner) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Find the user to invite
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    })

    if (invitedUser) {
      // User exists - add them directly as a member
      const existingMember = await prisma.branchMember.findUnique({
        where: {
          branchId_userId: {
            branchId,
            userId: invitedUser.id,
          },
        },
      })

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this branch' },
          { status: 400 }
        )
      }

      // Create branch member
      const member = await prisma.branchMember.create({
        data: {
          branchId,
          userId: invitedUser.id,
          role: 'GUEST',
          approved: true,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      // Send notification email
      const branchUrl = `${process.env.NEXTAUTH_URL}/branch/${branchId}`
      await sendMemberInviteEmail(
        invitedUser.email,
        invitedUser.name,
        branchWithOwner.title,
        branchWithOwner.owner.name,
        branchUrl,
        false, // Existing user
        message // Personal message from inviter
      )

      return NextResponse.json({ success: true, type: 'member', member })
    } else {
      // User doesn't exist - create an invite with token

      // Check if invite already exists
      const existingInvite = await prisma.invite.findFirst({
        where: {
          branchId,
          email,
          status: 'PENDING',
        },
      })

      if (existingInvite) {
        return NextResponse.json(
          { error: 'An invitation has already been sent to this email' },
          { status: 400 }
        )
      }

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex')

      // Create invite (expires in 7 days)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const invite = await prisma.invite.create({
        data: {
          inviterId: userId,
          email,
          branchId,
          token,
          message,
          status: 'PENDING',
          expiresAt,
        },
      })

      // Send invitation email with signup link
      const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`
      await sendMemberInviteEmail(
        email,
        email.split('@')[0], // Use email prefix as temp name
        branchWithOwner.title,
        branchWithOwner.owner.name,
        inviteUrl,
        true, // New user - needs to sign up
        message // Personal message from inviter
      )

      return NextResponse.json({
        success: true,
        type: 'invite',
        invite: {
          email,
          expiresAt,
        }
      })
    }
  } catch (error: any) {
    console.error('Error inviting member:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to invite member' },
      { status: 500 }
    )
  }
}

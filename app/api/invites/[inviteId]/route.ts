import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  try {
    // inviteId can be either a token or an ID
    const inviteId = params.inviteId

    // Try to find by token first (for invite page), then by ID
    let invite = await prisma.invite.findUnique({
      where: { token: inviteId },
      include: {
        inviter: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      )
    }

    // Check if expired
    const expired = invite.status !== 'PENDING' || new Date() > invite.expiresAt
    const isShareableLink = invite.email === 'shareable@link'

    return NextResponse.json({
      branchTitle: invite.branch.title,
      inviterName: invite.inviter.name,
      email: isShareableLink ? null : invite.email,
      message: invite.message,
      expired,
      isShareableLink,
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    )
  }
}

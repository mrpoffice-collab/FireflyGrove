import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    const invite = await prisma.invite.findUnique({
      where: { token },
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

    return NextResponse.json({
      branchTitle: invite.branch.title,
      inviterName: invite.inviter.name,
      email: invite.email,
      expired,
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    )
  }
}

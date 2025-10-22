import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { email } = await req.json()

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

    // Find the user to invite
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!invitedUser) {
      return NextResponse.json(
        { error: 'User not found. They need to create an account first.' },
        { status: 404 }
      )
    }

    // Check if already a member
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
        approved: true, // Auto-approve for now
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

    return NextResponse.json(member)
  } catch (error: any) {
    console.error('Error inviting member:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to invite member' },
      { status: 500 }
    )
  }
}

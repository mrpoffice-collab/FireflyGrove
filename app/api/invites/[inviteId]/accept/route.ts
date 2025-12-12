import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params
    const token = inviteId // This is actually a token, not an ID
    const { name, password, email } = await req.json()

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invitation' },
        { status: 404 }
      )
    }

    // Check if expired
    if (invite.status !== 'PENDING' || new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      )
    }

    // Determine the email to use
    const isShareableLink = invite.email === 'shareable@link'
    let userEmail = invite.email

    if (isShareableLink) {
      // For shareable links, user must provide their email
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }
      userEmail = email
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in instead.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and add to branch in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: userEmail,
          password: hashedPassword,
          name,
          status: 'ACTIVE',
        },
      })

      // Add to branch
      await tx.branchMember.create({
        data: {
          branchId: invite.branchId,
          userId: user.id,
          role: 'GUEST',
          approved: true,
        },
      })

      // Mark invite as accepted
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      })

      return user
    })

    return NextResponse.json({
      success: true,
      branchId: invite.branchId,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
      },
    })
  } catch (error: any) {
    console.error('Error accepting invite:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, isAdmin: true }
    })

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Update user's password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword }
    })

    // Log the action
    await prisma.audit.create({
      data: {
        actorId: adminUser.id,
        action: 'password_reset',
        targetType: 'user',
        targetId: targetUser.id,
        metadata: JSON.stringify({
          userEmail: targetUser.email,
          userName: targetUser.name
        })
      }
    })

    // In production, you'd send an email with the temp password
    // For now, return it in the response
    return NextResponse.json({
      success: true,
      tempPassword,
      message: `Temporary password generated for ${targetUser.email}`
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

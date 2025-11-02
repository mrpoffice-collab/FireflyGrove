import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      select: { id: true, email: true, name: true, status: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.status !== 'LOCKED') {
      return NextResponse.json({ error: 'User account is not locked' }, { status: 400 })
    }

    // Unlock the account
    await prisma.user.update({
      where: { id: params.id },
      data: { status: 'ACTIVE' }
    })

    // Log the action
    await prisma.audit.create({
      data: {
        actorId: adminUser.id,
        action: 'account_unlock',
        targetType: 'user',
        targetId: targetUser.id,
        metadata: JSON.stringify({
          userEmail: targetUser.email,
          userName: targetUser.name,
          previousStatus: targetUser.status
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: `Account unlocked for ${targetUser.email}`
    })
  } catch (error) {
    console.error('Account unlock error:', error)
    return NextResponse.json(
      { error: 'Failed to unlock account' },
      { status: 500 }
    )
  }
}

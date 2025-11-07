import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Count unique collaborators the user has invited across their branches
    const collaboratorCount = await prisma.branchInvite.count({
      where: {
        branch: {
          ownerId: user.id,
        },
        status: {
          in: ['pending', 'accepted'],
        },
      },
      distinct: ['inviteeEmail'],
    })

    return NextResponse.json({ count: collaboratorCount })
  } catch (error) {
    console.error('Error counting collaborators:', error)
    return NextResponse.json(
      { error: 'Failed to count collaborators' },
      { status: 500 }
    )
  }
}

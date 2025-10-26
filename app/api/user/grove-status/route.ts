import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any)?.id

    // Check if user has any branches
    const branchCount = await prisma.branch.count({
      where: {
        ownerId: userId,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      isGroveOwner: branchCount > 0,
      branchCount
    })
  } catch (error) {
    console.error('Error checking grove status:', error)
    return NextResponse.json(
      { error: 'Failed to check grove status' },
      { status: 500 }
    )
  }
}

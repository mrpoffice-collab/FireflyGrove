import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'

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

    // Count heirs across all branches the user owns
    const heirCount = await prisma.heir.count({
      where: {
        branch: {
          ownerId: user.id,
        },
      },
    })

    return NextResponse.json({ count: heirCount })
  } catch (error) {
    console.error('Error counting heirs:', error)
    return NextResponse.json(
      { error: 'Failed to count heirs' },
      { status: 500 }
    )
  }
}

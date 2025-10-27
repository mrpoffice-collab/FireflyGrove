import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/marketing/briefs/[id]
 * Get a content brief by topic score ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get brief by topic score ID
    const brief = await prisma.contentBrief.findUnique({
      where: { topicScoreId: params.id },
      include: {
        topicScore: true,
      },
    })

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }

    return NextResponse.json({ brief })
  } catch (error) {
    console.error('Error fetching brief:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brief' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pinterest } from '@/lib/pinterest'

export const dynamic = 'force-dynamic'

/**
 * GET /api/pinterest/boards
 * Get all Pinterest boards for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = (session.user as any).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!pinterest.isConfigured()) {
      return NextResponse.json(
        { error: 'Pinterest API not configured' },
        { status: 503 }
      )
    }

    const boards = await pinterest.getBoards()

    return NextResponse.json({ boards })
  } catch (error: any) {
    console.error('Error fetching Pinterest boards:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch boards' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pinterest/boards
 * Create a new Pinterest board
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = (session.user as any).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!pinterest.isConfigured()) {
      return NextResponse.json(
        { error: 'Pinterest API not configured' },
        { status: 503 }
      )
    }

    const { name, description, privacy } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Board name is required' }, { status: 400 })
    }

    const board = await pinterest.createBoard({
      name,
      description: description || `${name} - Shared from Firefly Grove`,
      privacy: privacy || 'PUBLIC',
    })

    return NextResponse.json({ board })
  } catch (error: any) {
    console.error('Error creating Pinterest board:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create board' },
      { status: 500 }
    )
  }
}

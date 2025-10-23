import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/grove/rename
 *
 * Rename the user's Grove
 * Body: { name: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { name } = await req.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Grove name is required' },
        { status: 400 }
      )
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Grove name must be 100 characters or less' },
        { status: 400 }
      )
    }

    // Find user's Grove
    const grove = await prisma.grove.findUnique({
      where: { userId },
    })

    if (!grove) {
      return NextResponse.json({ error: 'Grove not found' }, { status: 404 })
    }

    // Update Grove name
    const updatedGrove = await prisma.grove.update({
      where: { id: grove.id },
      data: {
        name: name.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      grove: updatedGrove,
    })
  } catch (error: any) {
    console.error('Error renaming grove:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to rename grove' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/branches/:branchId/preferences
 *
 * Get branch preferences for memory association controls
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { branchId } = await params

    // Verify user owns this branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        preferences: true,
      },
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    if (branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'You do not own this branch' },
        { status: 403 }
      )
    }

    // Return existing preferences or defaults
    const prefs = branch.preferences || {
      canBeTagged: true,
      requiresTagApproval: false,
      visibleInCrossShares: true,
    }

    return NextResponse.json(prefs)
  } catch (error: any) {
    console.error('Error fetching branch preferences:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/branches/:branchId/preferences
 *
 * Update branch preferences for memory association controls
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { branchId } = await params
    const body = await req.json()

    const { canBeTagged, requiresTagApproval, visibleInCrossShares } = body

    // Verify user owns this branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    if (branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'You do not own this branch' },
        { status: 403 }
      )
    }

    // Upsert preferences
    const preferences = await prisma.branchPreferences.upsert({
      where: { branchId },
      create: {
        branchId,
        canBeTagged: canBeTagged ?? true,
        requiresTagApproval: requiresTagApproval ?? false,
        visibleInCrossShares: visibleInCrossShares ?? true,
      },
      update: {
        ...(canBeTagged !== undefined && { canBeTagged }),
        ...(requiresTagApproval !== undefined && { requiresTagApproval }),
        ...(visibleInCrossShares !== undefined && { visibleInCrossShares }),
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'UPDATE_BRANCH_PREFERENCES',
        targetType: 'BRANCH',
        targetId: branchId,
        metadata: JSON.stringify({
          canBeTagged: preferences.canBeTagged,
          requiresTagApproval: preferences.requiresTagApproval,
          visibleInCrossShares: preferences.visibleInCrossShares,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error: any) {
    console.error('Error updating branch preferences:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

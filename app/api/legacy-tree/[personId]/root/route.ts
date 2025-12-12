import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/legacy-tree/[personId]/root
 *
 * Root (link) a legacy tree to a private grove
 * Creates a link without moving the tree from Open Grove
 * The tree remains in Open Grove but is also accessible from the private grove
 *
 * Body: {
 *   groveId: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { personId } = await params
    const { groveId } = await req.json()

    if (!groveId) {
      return NextResponse.json(
        { error: 'Grove ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns the target grove
    const grove = await prisma.grove.findUnique({
      where: { id: groveId },
    })

    if (!grove) {
      return NextResponse.json(
        { error: 'Grove not found' },
        { status: 404 }
      )
    }

    if (grove.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only root trees to your own grove' },
        { status: 403 }
      )
    }

    if (grove.isOpenGrove) {
      return NextResponse.json(
        { error: 'Cannot root trees to Open Grove (use adopt instead)' },
        { status: 400 }
      )
    }

    // Verify user has permission to root this tree (must be owner, moderator, or trustee)
    const person = await prisma.person.findUnique({
      where: { id: personId },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Legacy tree not found' },
        { status: 404 }
      )
    }

    const hasPermission =
      person.ownerId === userId ||
      person.moderatorId === userId ||
      person.trusteeId === userId

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to root this tree' },
        { status: 403 }
      )
    }

    // Check if tree is already rooted to this grove
    const existingLink = await prisma.groveTreeMembership.findFirst({
      where: {
        groveId,
        personId,
      },
    })

    if (existingLink) {
      return NextResponse.json(
        { error: 'This tree is already linked to your grove' },
        { status: 400 }
      )
    }

    // NOTE: Rooted trees do NOT use tree slots, so no capacity check needed
    // They are links to legacy trees that remain in Open Grove

    // Create the link (root) - tree stays in Open Grove AND links to private grove
    const membership = await prisma.groveTreeMembership.create({
      data: {
        groveId,
        personId,
        isOriginal: false, // Not original location - it's a link
        status: 'active',
        adoptionType: 'rooted', // This is a root (link), not an adoption (move)
      },
    })

    // NOTE: Do NOT increment tree count - rooted trees don't use slots

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'ROOT',
        targetType: 'PERSON',
        targetId: personId,
        metadata: JSON.stringify({
          groveId,
          groveName: grove.name,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      membership,
      message: 'Legacy tree rooted to your grove successfully',
    })
  } catch (error: any) {
    console.error('Error rooting legacy tree:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to root legacy tree' },
      { status: 500 }
    )
  }
}

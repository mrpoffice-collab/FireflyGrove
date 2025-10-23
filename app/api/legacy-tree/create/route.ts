import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpenGroveId } from '@/lib/openGrove'

export const dynamic = 'force-dynamic'

/**
 * POST /api/legacy-tree/create
 *
 * Create a new legacy tree
 * Body: {
 *   name: string
 *   birthDate?: string (ISO date)
 *   deathDate: string (ISO date, required)
 *   groveId?: string (optional - defaults to Open Grove)
 *   discoveryEnabled?: boolean (default true)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { name, birthDate, deathDate, groveId, discoveryEnabled = true } = body

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!birthDate) {
      return NextResponse.json(
        { error: 'Birth date is required for legacy trees' },
        { status: 400 }
      )
    }

    if (!deathDate) {
      return NextResponse.json(
        { error: 'Death date is required for legacy trees' },
        { status: 400 }
      )
    }

    // Parse dates
    const birthDateObj = new Date(birthDate)
    const deathDateObj = new Date(deathDate)

    if (isNaN(birthDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birth date' },
        { status: 400 }
      )
    }

    if (isNaN(deathDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid death date' },
        { status: 400 }
      )
    }

    // Death date must be in the past
    if (deathDateObj > new Date()) {
      return NextResponse.json(
        { error: 'Death date must be in the past' },
        { status: 400 }
      )
    }

    // Determine which grove to use
    let targetGroveId = groveId
    let isOpenGroveTree = false

    if (!targetGroveId) {
      // Default to Open Grove
      targetGroveId = await getOpenGroveId()
      isOpenGroveTree = true
    } else {
      // Verify user owns the grove
      const grove = await prisma.grove.findUnique({
        where: { id: targetGroveId },
      })

      if (!grove) {
        return NextResponse.json(
          { error: 'Grove not found' },
          { status: 404 }
        )
      }

      if (grove.userId !== userId && !grove.isOpenGrove) {
        return NextResponse.json(
          { error: 'You can only create trees in your own grove or the Open Grove' },
          { status: 403 }
        )
      }

      isOpenGroveTree = grove.isOpenGrove
    }

    // Calculate trustee expiration (60 days from now)
    const trusteeExpiresAt = new Date()
    trusteeExpiresAt.setDate(trusteeExpiresAt.getDate() + 60)

    // Create the Person (legacy tree)
    const person = await prisma.person.create({
      data: {
        name: name.trim(),
        birthDate: birthDateObj,
        deathDate: deathDateObj,
        isLegacy: true,
        trusteeId: userId, // Creator is initial trustee
        ownerId: userId, // Also initial owner (can transfer later)
        moderatorId: userId, // Also initial moderator
        trusteeExpiresAt,
        discoveryEnabled,
        memoryLimit: isOpenGroveTree ? 100 : null, // 100 for Open Grove, unlimited for private
        memoryCount: 0,
      },
    })

    // Create membership linking person to grove
    const membership = await prisma.groveTreeMembership.create({
      data: {
        groveId: targetGroveId,
        personId: person.id,
        isOriginal: true, // This is where the tree was planted
        status: 'active',
        adoptionType: 'adopted', // Initially adopted into the grove
      },
    })

    // If in a user's grove (not Open Grove), increment tree count
    if (!isOpenGroveTree) {
      await prisma.grove.update({
        where: { id: targetGroveId },
        data: { treeCount: { increment: 1 } },
      })
    }

    return NextResponse.json({
      success: true,
      person,
      membership,
      message: isOpenGroveTree
        ? 'Legacy tree created in Open Grove'
        : 'Legacy tree created in your grove',
    })
  } catch (error: any) {
    console.error('Error creating legacy tree:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create legacy tree' },
      { status: 500 }
    )
  }
}

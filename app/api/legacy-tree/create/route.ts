import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpenGroveId, getSystemUserId } from '@/lib/openGrove'

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
 *   trusteeEmail?: string (required for Open Grove if not authenticated)
 *   trusteeName?: string (optional name for Open Grove trustee)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { name, birthDate, deathDate, groveId, discoveryEnabled = true, trusteeEmail, trusteeName } = body

    // Determine if this is an Open Grove request (no groveId or null groveId)
    const isOpenGroveRequest = !groveId

    // For Open Grove: authentication is optional, but email is required
    // For private groves: authentication is required
    let userId: string | null = session?.user ? (session.user as any).id : null

    if (!isOpenGroveRequest && !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (isOpenGroveRequest && !userId && !trusteeEmail) {
      return NextResponse.json(
        { error: 'Email is required to create a memorial in Open Grove' },
        { status: 400 }
      )
    }

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
    // For authenticated users: set trusteeId/ownerId/moderatorId
    // For unauthenticated Open Grove: store email/name instead
    const person = await prisma.person.create({
      data: {
        name: name.trim(),
        birthDate: birthDateObj,
        deathDate: deathDateObj,
        isLegacy: true,
        trusteeId: userId || null, // Creator is initial trustee (if authenticated)
        ownerId: userId || null, // Also initial owner (can transfer later)
        moderatorId: userId || null, // Also initial moderator
        trusteeEmail: !userId ? trusteeEmail : null, // Store email for unauthenticated creators
        trusteeName: !userId ? (trusteeName || null) : null, // Store name for unauthenticated creators
        trusteeExpiresAt,
        discoveryEnabled,
        memoryLimit: isOpenGroveTree ? 100 : null, // 100 for Open Grove, unlimited for private
        memoryCount: 0,
      },
    })

    // Find the tree associated with this grove (or create one for Open Grove)
    let tree = await prisma.tree.findFirst({
      where: { groveId: targetGroveId },
    })

    if (!tree) {
      // Create a tree for this grove if it doesn't exist
      tree = await prisma.tree.create({
        data: {
          groveId: targetGroveId,
          name: isOpenGroveTree ? 'Open Grove Memorials' : 'Family Tree',
          status: 'ACTIVE',
        },
      })
    }

    // Create a branch for this person
    // For unauthenticated Open Grove memorials, use system user as branch owner
    const branchOwnerId = userId || await getSystemUserId()
    const branch = await prisma.branch.create({
      data: {
        treeId: tree.id,
        title: name.trim(),
        personStatus: 'legacy',
        ownerId: branchOwnerId,
        personId: person.id,
        status: 'ACTIVE',
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
      branch,
      tree,
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

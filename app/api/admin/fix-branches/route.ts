import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/fix-branches
 *
 * Admin-only endpoint to create missing branches for Open Grove memorials
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🔧 Admin fix-branches triggered by:', session.user.email)

    const openGrove = await prisma.grove.findFirst({
      where: { isOpenGrove: true },
    })

    if (!openGrove) {
      return NextResponse.json({ error: 'Open Grove not found' }, { status: 404 })
    }

    // Find or create the Open Grove tree
    let openGroveTree = await prisma.tree.findFirst({
      where: { groveId: openGrove.id },
    })

    if (!openGroveTree) {
      openGroveTree = await prisma.tree.create({
        data: {
          groveId: openGrove.id,
          name: 'Open Grove Memorials',
          status: 'ACTIVE',
        },
      })
    }

    // Get system user for orphaned memorials
    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@fireflygrove.com' },
    })

    if (!systemUser) {
      return NextResponse.json({ error: 'System user not found' }, { status: 404 })
    }

    const memorials = await prisma.person.findMany({
      where: {
        isLegacy: true,
        discoveryEnabled: true,
        memberships: {
          some: {
            groveId: openGrove.id,
            status: 'active',
          },
        },
      },
      include: {
        branches: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    })

    let created = 0
    let skipped = 0
    const results = []

    for (const memorial of memorials) {
      if (memorial.branches.length === 0) {
        const ownerId = memorial.ownerId || memorial.trusteeId || systemUser.id

        const branch = await prisma.branch.create({
          data: {
            treeId: openGroveTree.id,
            title: memorial.name,
            personStatus: 'legacy',
            ownerId: ownerId,
            personId: memorial.id,
            status: 'ACTIVE',
          },
        })

        results.push({
          memorial: memorial.name,
          branchId: branch.id,
          status: 'created',
        })
        created++
      } else {
        results.push({
          memorial: memorial.name,
          branchId: memorial.branches[0].id,
          status: 'skipped',
        })
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: memorials.length,
        created,
        skipped,
      },
      results,
    })
  } catch (error: any) {
    console.error('Error fixing branches:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fix branches' },
      { status: 500 }
    )
  }
}

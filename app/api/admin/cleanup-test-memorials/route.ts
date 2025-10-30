import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/cleanup-test-memorials
 * Clean up test memorial branches from Open Grove (Aunt Martha, etc.)
 * Admin only
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = (session.user as any).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get system user
    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@fireflygrove.com' },
      select: { id: true, name: true },
    })

    if (!systemUser) {
      return NextResponse.json({
        error: 'System user not found',
        message: 'No cleanup needed - system user does not exist'
      }, { status: 404 })
    }

    // Find all memorial-type branches owned by system user
    const testMemorials = await prisma.branch.findMany({
      where: {
        ownerId: systemUser.id,
        type: 'memorial',
      },
      include: {
        person: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
    })

    if (testMemorials.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No test memorial branches found',
        deleted: 0,
      })
    }

    // Delete each memorial branch
    const deleted: string[] = []
    for (const branch of testMemorials) {
      await prisma.branch.delete({
        where: { id: branch.id },
      })
      deleted.push(branch.title)
    }

    // Delete orphaned persons created by system
    const orphanedPersons = await prisma.person.deleteMany({
      where: {
        userId: systemUser.id,
        branches: {
          none: {}, // No branches reference this person
        },
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: (session.user as any).id,
        action: 'CLEANUP_TEST_MEMORIALS',
        targetType: 'BRANCH',
        targetId: systemUser.id,
        metadata: JSON.stringify({
          deletedBranches: deleted,
          deletedCount: deleted.length,
          orphanedPersons: orphanedPersons.count,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deleted.length} test memorial branches`,
      deleted,
      orphanedPersonsDeleted: orphanedPersons.count,
    })
  } catch (error: any) {
    console.error('Error cleaning up test memorials:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup test memorials' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/entries/:entryId/report
 *
 * Report a memory for moderation
 * Any authenticated user can report a memory
 * Reasons: HARASSMENT, PRIVATE_INFO, SPAM, OTHER
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    const { reason, notes } = body

    // Validate reason
    const validReasons = ['HARASSMENT', 'PRIVATE_INFO', 'SPAM', 'OTHER']
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason. Must be one of: HARASSMENT, PRIVATE_INFO, SPAM, OTHER' },
        { status: 400 }
      )
    }

    // Find the entry
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      )
    }

    // Check if user has already reported this entry
    const existingReport = await prisma.report.findFirst({
      where: {
        memoryId: entryId,
        reporterId: userId,
        status: 'OPEN',
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this memory' },
        { status: 400 }
      )
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        memoryId: entryId,
        reporterId: userId,
        reason,
        notes: notes || null,
        status: 'OPEN',
      },
      include: {
        memory: {
          select: {
            text: true,
            author: {
              select: {
                name: true,
              },
            },
            branch: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'REPORT',
        targetType: 'ENTRY',
        targetId: entryId,
        metadata: JSON.stringify({
          reason,
          notes: notes || '',
          reportId: report.id,
          branchId: entry.branchId,
          authorId: entry.authorId,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Report submitted. Our moderation team will review it shortly.',
      report: {
        id: report.id,
        reason: report.reason,
        createdAt: report.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit report' },
      { status: 500 }
    )
  }
}

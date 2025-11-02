import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: { memory: true }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    switch (action) {
      case 'dismiss':
        // Mark report as dismissed but keep memory visible
        await prisma.report.update({
          where: { id: params.id },
          data: { status: 'DISMISSED' }
        })
        break

      case 'hide':
        // Hide memory from public view and mark report as action taken
        await prisma.$transaction([
          prisma.report.update({
            where: { id: params.id },
            data: {
              status: 'ACTION_TAKEN',
              actionBy: user.id,
              actionNotes: 'Memory hidden from public view',
              closedAt: new Date()
            }
          }),
          prisma.entry.update({
            where: { id: report.memoryId },
            data: { visibility: 'private' }
          })
        ])
        break

      case 'approve':
        // Delete the memory and mark report as action taken
        await prisma.$transaction([
          prisma.report.update({
            where: { id: params.id },
            data: {
              status: 'ACTION_TAKEN',
              actionBy: user.id,
              actionNotes: 'Memory deleted',
              closedAt: new Date()
            }
          }),
          prisma.entry.delete({
            where: { id: report.memoryId }
          })
        ])
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log the moderation action
    await prisma.audit.create({
      data: {
        actorId: user.id,
        action: `report_${action}`,
        targetType: 'report',
        targetId: report.id,
        metadata: JSON.stringify({
          reportId: report.id,
          memoryId: report.memoryId,
          reason: report.reason
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Report action error:', error)
    return NextResponse.json(
      { error: 'Failed to process report action' },
      { status: 500 }
    )
  }
}

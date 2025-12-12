import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tree-transfers/:token
 *
 * Fetch tree transfer details by token
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find the transfer by token
    const transfer = await prisma.treeTransfer.findUnique({
      where: { token },
      include: {
        person: {
          select: {
            id: true,
            name: true,
          },
        },
        sender: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!transfer) {
      return NextResponse.json(
        { error: 'Transfer not found' },
        { status: 404 }
      )
    }

    // Check if transfer has expired
    if (new Date() > new Date(transfer.expiresAt)) {
      return NextResponse.json(
        { error: 'This transfer invitation has expired' },
        { status: 410 }
      )
    }

    // Check if transfer is not pending
    if (transfer.status !== 'pending') {
      return NextResponse.json(
        { error: `This transfer has already been ${transfer.status}` },
        { status: 400 }
      )
    }

    // Get grove name for the tree
    const membership = await prisma.groveTreeMembership.findFirst({
      where: { personId: transfer.personId },
      include: {
        grove: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: transfer.id,
      personName: transfer.person.name,
      senderName: transfer.sender.name || 'Someone',
      groveName: membership?.grove.name || 'their grove',
      message: transfer.message,
      recipientEmail: transfer.recipientEmail,
      expiresAt: transfer.expiresAt,
      status: transfer.status,
    })
  } catch (error: any) {
    console.error('[Tree Transfer] Error fetching transfer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transfer details' },
      { status: 500 }
    )
  }
}

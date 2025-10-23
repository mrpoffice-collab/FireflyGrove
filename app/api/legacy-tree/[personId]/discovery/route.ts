import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/legacy-tree/:personId/discovery
 *
 * Toggle discovery for a legacy tree
 * Body: { discoveryEnabled: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { personId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const personId = params.personId
    const body = await req.json()
    const { discoveryEnabled } = body

    if (typeof discoveryEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'discoveryEnabled must be a boolean' },
        { status: 400 }
      )
    }

    // Find the person and verify permissions
    const person = await prisma.person.findUnique({
      where: { id: personId },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Legacy tree not found' },
        { status: 404 }
      )
    }

    if (!person.isLegacy) {
      return NextResponse.json(
        { error: 'This is not a legacy tree' },
        { status: 400 }
      )
    }

    // Only trustee, owner, or moderator can change discovery settings
    if (
      person.trusteeId !== userId &&
      person.ownerId !== userId &&
      person.moderatorId !== userId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this legacy tree' },
        { status: 403 }
      )
    }

    // Update discovery setting
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: { discoveryEnabled },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'UPDATE',
        targetType: 'PERSON',
        targetId: personId,
        metadata: JSON.stringify({
          field: 'discoveryEnabled',
          oldValue: person.discoveryEnabled,
          newValue: discoveryEnabled,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      discoveryEnabled: updatedPerson.discoveryEnabled,
    })
  } catch (error: any) {
    console.error('Error updating discovery:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update discovery setting' },
      { status: 500 }
    )
  }
}

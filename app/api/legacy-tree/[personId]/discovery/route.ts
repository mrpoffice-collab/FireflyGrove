import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndExpireTrustee } from '@/lib/trustee'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/legacy-tree/:personId/discovery
 *
 * Toggle discovery for a legacy tree
 * Body: { discoveryEnabled: boolean }
 */
export async function PATCH(
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

    // Check and expire trustee if needed
    await checkAndExpireTrustee(personId)

    // Re-fetch person to get updated trustee status
    const updatedPerson = await prisma.person.findUnique({
      where: { id: personId },
      select: {
        trusteeId: true,
        ownerId: true,
        moderatorId: true,
        discoveryEnabled: true,
      },
    })

    if (!updatedPerson) {
      return NextResponse.json(
        { error: 'Legacy tree not found' },
        { status: 404 }
      )
    }

    // Only trustee (if not expired), owner, or moderator can change discovery settings
    if (
      updatedPerson.trusteeId !== userId &&
      updatedPerson.ownerId !== userId &&
      updatedPerson.moderatorId !== userId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this legacy tree' },
        { status: 403 }
      )
    }

    // Update discovery setting
    const finalPerson = await prisma.person.update({
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
          oldValue: updatedPerson.discoveryEnabled,
          newValue: discoveryEnabled,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      discoveryEnabled: finalPerson.discoveryEnabled,
    })
  } catch (error: any) {
    console.error('Error updating discovery:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update discovery setting' },
      { status: 500 }
    )
  }
}

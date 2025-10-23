import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndExpireTrustee } from '@/lib/trustee'

export const dynamic = 'force-dynamic'

/**
 * POST /api/legacy-tree/:personId/transfer
 *
 * Transfer ownership of a legacy tree to another user
 * Body: { newOwnerEmail: string }
 */
export async function POST(
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
    const { newOwnerEmail } = body

    if (!newOwnerEmail || !newOwnerEmail.trim()) {
      return NextResponse.json(
        { error: 'New owner email is required' },
        { status: 400 }
      )
    }

    // Find the person and verify permissions
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        trustee: {
          select: { id: true, email: true, name: true },
        },
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
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
    const currentPerson = await prisma.person.findUnique({
      where: { id: personId },
      select: {
        trusteeId: true,
        ownerId: true,
      },
    })

    // Only trustee (if not expired) or owner can transfer ownership
    if (currentPerson && currentPerson.trusteeId !== userId && currentPerson.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the trustee or owner can transfer ownership' },
        { status: 403 }
      )
    }

    // Find the new owner by email
    const newOwner = await prisma.user.findUnique({
      where: { email: newOwnerEmail.trim().toLowerCase() },
    })

    if (!newOwner) {
      return NextResponse.json(
        { error: 'User with that email not found. They must have a Firefly Grove account.' },
        { status: 404 }
      )
    }

    // Don't transfer to self
    if (newOwner.id === person.ownerId) {
      return NextResponse.json(
        { error: 'This person is already the owner' },
        { status: 400 }
      )
    }

    // Update ownership
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        ownerId: newOwner.id,
        moderatorId: newOwner.id, // New owner also becomes moderator
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'TRANSFER',
        targetType: 'PERSON',
        targetId: personId,
        metadata: JSON.stringify({
          previousOwnerId: person.ownerId,
          newOwnerId: newOwner.id,
          newOwnerEmail: newOwner.email,
          transferredBy: userId === person.trusteeId ? 'trustee' : 'owner',
        }),
      },
    })

    // TODO: Send email notification to new owner
    // TODO: Send confirmation email to previous owner

    return NextResponse.json({
      success: true,
      message: `Ownership transferred to ${newOwner.name || newOwner.email}`,
      newOwner: {
        id: newOwner.id,
        name: newOwner.name,
        email: newOwner.email,
      },
    })
  } catch (error: any) {
    console.error('Error transferring ownership:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transfer ownership' },
      { status: 500 }
    )
  }
}

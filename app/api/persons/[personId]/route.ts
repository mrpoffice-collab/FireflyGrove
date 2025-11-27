import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/persons/[personId]
 * Delete a person/memorial
 * Only the owner, trustee, or admin can delete
 */
export async function DELETE(
  request: Request,
  { params }: { params: { personId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const isAdmin = (session.user as any).isAdmin

    const person = await prisma.person.findUnique({
      where: { id: params.personId },
      include: {
        branches: {
          include: {
            entries: true,
          },
        },
        memberships: true,
      }
    })

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    // Check permission: must be owner, trustee, or admin
    const isOwner = person.ownerId === userId
    const isTrustee = person.trusteeId === userId
    const canDelete = isOwner || isTrustee || isAdmin

    if (!canDelete) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check if there are any memories (entries)
    const hasMemories = person.branches.some(branch => branch.entries.length > 0)
    if (hasMemories) {
      return NextResponse.json(
        { error: 'Cannot delete memorial with memories. Please delete all memories first.' },
        { status: 400 }
      )
    }

    // Delete related records first (due to foreign key constraints)
    // Delete branches
    await prisma.branch.deleteMany({
      where: { personId: params.personId }
    })

    // Delete grove memberships
    await prisma.groveTreeMembership.deleteMany({
      where: { personId: params.personId }
    })

    // Delete any memories associated with this person (safety check)
    await prisma.memory.deleteMany({
      where: { personId: params.personId }
    })

    // Delete the person
    await prisma.person.delete({
      where: { id: params.personId }
    })

    // Log the action
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'person_delete',
        targetType: 'person',
        targetId: params.personId,
        metadata: JSON.stringify({
          personId: params.personId,
          personName: person.name,
        })
      }
    })

    return NextResponse.json({ success: true, message: `"${person.name}" has been deleted` })
  } catch (error: any) {
    console.error('Person delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete person' },
      { status: 500 }
    )
  }
}

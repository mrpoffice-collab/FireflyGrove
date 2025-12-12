import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/persons/:personId/update
 *
 * Update Person (legacy tree) information
 * Body: { name?: string, birthDate?: string, deathDate?: string }
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
    const { name, birthDate, deathDate } = body

    // Get the person
    const person = await prisma.person.findUnique({
      where: { id: personId },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Verify user has permission (must be owner, moderator, or trustee)
    const hasPermission =
      person.ownerId === userId ||
      person.moderatorId === userId ||
      person.trusteeId === userId

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this legacy tree' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (name !== undefined && name.trim()) {
      updateData.name = name.trim()
    }

    if (birthDate !== undefined) {
      updateData.birthDate = birthDate ? new Date(birthDate) : null
    }

    if (deathDate !== undefined) {
      updateData.deathDate = deathDate ? new Date(deathDate) : null
    }

    // Update the person
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: updateData,
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'PERSON_UPDATED',
        targetType: 'PERSON',
        targetId: personId,
        metadata: JSON.stringify({
          changes: updateData,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      person: {
        id: updatedPerson.id,
        name: updatedPerson.name,
        birthDate: updatedPerson.birthDate?.toISOString() || null,
        deathDate: updatedPerson.deathDate?.toISOString() || null,
      },
    })
  } catch (error: any) {
    console.error('Error updating person:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update legacy tree information' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/branches/:branchId/legacy
 *
 * Set branch to legacy mode with optional proof
 * Unlimited legacy trees allowed - emphasizes meaningful memories over empty placeholders
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const branchId = params.branchId
    const body = await req.json()

    const { birthDate, deathDate, proofUrl, affirmation, updateDatesOnly } = body

    // Find the branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Check if user is the owner
    if (branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the branch owner can set legacy status' },
        { status: 403 }
      )
    }

    // If just updating dates for existing legacy branch, skip verification requirements
    if (updateDatesOnly && branch.personStatus === 'legacy') {
      // Validate death date if provided
      if (deathDate) {
        const deathDateObj = new Date(deathDate)
        const birthDateObj = birthDate ? new Date(birthDate) : null

        // Validate dates
        if (birthDateObj && deathDateObj < birthDateObj) {
          return NextResponse.json(
            { error: 'Death date cannot be before birth date' },
            { status: 400 }
          )
        }

        if (deathDateObj > new Date()) {
          return NextResponse.json(
            { error: 'Death date cannot be in the future' },
            { status: 400 }
          )
        }
      }

      // Update just the dates
      const updatedBranch = await prisma.branch.update({
        where: { id: branchId },
        data: {
          birthDate: birthDate ? new Date(birthDate) : null,
          deathDate: deathDate ? new Date(deathDate) : null,
        },
      })

      // Create audit log
      await prisma.audit.create({
        data: {
          actorId: userId,
          action: 'BRANCH_DATES_UPDATED',
          targetType: 'BRANCH',
          targetId: branchId,
          metadata: JSON.stringify({
            birthDate: birthDate || null,
            deathDate: deathDate || null,
            updatedAt: new Date().toISOString(),
          }),
        },
      })

      return NextResponse.json({
        success: true,
        branch: updatedBranch,
        message: 'Dates updated successfully',
      })
    }

    // Require either affirmation or proof (light-touch verification) for new legacy branches
    if (!affirmation && !proofUrl) {
      return NextResponse.json(
        {
          error:
            'Please affirm or provide proof that this person has passed',
        },
        { status: 400 }
      )
    }

    // Validate death date if provided
    if (deathDate) {
      const deathDateObj = new Date(deathDate)
      const birthDateObj = birthDate ? new Date(birthDate) : null

      // Validate dates
      if (birthDateObj && deathDateObj < birthDateObj) {
        return NextResponse.json(
          { error: 'Death date cannot be before birth date' },
          { status: 400 }
        )
      }

      if (deathDateObj > new Date()) {
        return NextResponse.json(
          { error: 'Death date cannot be in the future' },
          { status: 400 }
        )
      }
    }

    // Update branch to legacy status
    const updatedBranch = await prisma.branch.update({
      where: { id: branchId },
      data: {
        type: 'legacy',
        personStatus: 'legacy', // Keep for backward compatibility
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        legacyEnteredAt: new Date(),
        legacyMarkedBy: userId,
        legacyProofUrl: proofUrl || null, // Private, not displayed publicly
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'BRANCH_MARKED_LEGACY',
        targetType: 'BRANCH',
        targetId: branchId,
        metadata: JSON.stringify({
          birthDate: birthDate || null,
          deathDate: deathDate || null,
          legacyEnteredAt: new Date().toISOString(),
          hasProof: !!proofUrl,
          affirmation: affirmation || null,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      branch: updatedBranch,
      message: 'Branch entered legacy mode',
      prompt: 'Add a memory to light this legacy',
    })
  } catch (error: any) {
    console.error('Error setting legacy status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set legacy status' },
      { status: 500 }
    )
  }
}

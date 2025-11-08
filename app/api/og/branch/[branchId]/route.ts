import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/og/branch/[branchId]
 *
 * Public endpoint for fetching minimal branch data needed for OG image generation.
 * No authentication required - only returns data that would be visible in meta tags anyway.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: {
        title: true,
        description: true,
        person: {
          select: {
            name: true,
            birthDate: true,
            deathDate: true,
            memoryCount: true,
          },
        },
      },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      title: branch.title,
      description: branch.description,
      person: branch.person,
      memoryCount: branch.person?.memoryCount || 0,
    })
  } catch (error) {
    console.error('Error fetching branch for OG:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branch data' },
      { status: 500 }
    )
  }
}

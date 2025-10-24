import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBranchPreferences } from '@/lib/association'

export async function GET(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { branchId } = params

    // Get the current branch to find its grove
    const currentBranch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        tree: {
          select: {
            groveId: true,
          },
        },
        person: {
          select: {
            memberships: {
              select: {
                groveId: true,
              },
            },
          },
        },
      },
    })

    if (!currentBranch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Determine the groveId
    let groveId: string | null = null
    if (currentBranch.tree?.groveId) {
      groveId = currentBranch.tree.groveId
    } else if (currentBranch.person?.memberships?.[0]?.groveId) {
      groveId = currentBranch.person.memberships[0].groveId
    }

    if (!groveId) {
      // No grove found, return empty array
      return NextResponse.json([])
    }

    // Get all branches in the same grove (excluding current branch)
    const branches = await prisma.branch.findMany({
      where: {
        id: { not: branchId },
        archived: false,
        OR: [
          {
            tree: {
              groveId,
            },
          },
          {
            person: {
              memberships: {
                some: {
                  groveId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
      },
    })

    // Get preferences for each branch
    const branchesWithPrefs = await Promise.all(
      branches.map(async (branch) => {
        const prefs = await getBranchPreferences(branch.id)
        return {
          id: branch.id,
          title: branch.title,
          requiresApproval: prefs.requiresTagApproval,
          canBeTagged: prefs.canBeTagged,
        }
      })
    )

    return NextResponse.json(branchesWithPrefs)
  } catch (error) {
    console.error('Error fetching shareable branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shareable branches' },
      { status: 500 }
    )
  }
}

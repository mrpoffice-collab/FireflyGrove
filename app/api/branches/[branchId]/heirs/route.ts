import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addHeir } from '@/lib/legacy'
import { prisma } from '@/lib/prisma'

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
    const branchId = params.branchId

    // Verify ownership
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        ownerId: userId,
      },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      )
    }

    const heirs = await prisma.heir.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(heirs)
  } catch (error) {
    console.error('Error fetching heirs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heirs' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const { heirEmail, releaseCondition, releaseDate } = body

    if (!heirEmail || !releaseCondition) {
      return NextResponse.json(
        { error: 'heirEmail and releaseCondition are required' },
        { status: 400 }
      )
    }

    const heir = await addHeir(
      branchId,
      userId,
      heirEmail,
      releaseCondition,
      releaseDate ? new Date(releaseDate) : undefined
    )

    return NextResponse.json(heir)
  } catch (error: any) {
    console.error('Error adding heir:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add heir' },
      { status: 500 }
    )
  }
}

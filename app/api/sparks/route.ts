import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/sparks - Get sparks from user's active collections
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Get user's active collection IDs
    const activeCollections = await prisma.userSparkCollection.findMany({
      where: {
        userId,
        isActive: true
      },
      select: { collectionId: true },
    })

    const activeCollectionIds = activeCollections.map((ac) => ac.collectionId)

    if (activeCollectionIds.length === 0) {
      return NextResponse.json([])
    }

    // Build where clause
    const where: any = {
      isActive: true,
      collectionId: { in: activeCollectionIds },
    }

    if (category) {
      where.category = category
    }

    // Get sparks from active collections
    const sparks = await prisma.spark.findMany({
      where,
      orderBy: [
        { collection: { name: 'asc' } }, // Group by collection
        { order: 'asc' }, // Preserve file order within collection
      ],
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(sparks)
  } catch (error) {
    console.error('Error fetching sparks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sparks' },
      { status: 500 }
    )
  }
}

// POST /api/sparks - Create new spark
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, category, isGlobal } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt text is required' },
        { status: 400 }
      )
    }

    // Check if user is admin for global sparks
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    const canCreateGlobal = user?.isAdmin && isGlobal

    const spark = await prisma.spark.create({
      data: {
        userId: userId,
        text: text.trim(),
        category: category || null,
        isGlobal: canCreateGlobal || false,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(spark, { status: 201 })
  } catch (error) {
    console.error('Error creating spark:', error)
    return NextResponse.json(
      { error: 'Failed to create spark' },
      { status: 500 }
    )
  }
}

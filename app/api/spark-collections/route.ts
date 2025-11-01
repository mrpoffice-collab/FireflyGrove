import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/spark-collections - Get user's collections + featured collections
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's own collections
    const userCollections = await prisma.sparkCollection.findMany({
      where: { userId },
      include: {
        userActivations: {
          where: { userId },
          select: { isActive: true },
        },
        _count: {
          select: { sparks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get featured/global collections
    const featuredCollections = await prisma.sparkCollection.findMany({
      where: {
        OR: [
          { isFeatured: true },
          { isGlobal: true },
        ],
      },
      include: {
        userActivations: {
          where: { userId },
          select: { isActive: true },
        },
        _count: {
          select: { sparks: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Transform to include isActive flag
    const transformCollections = (collections: any[]) =>
      collections.map((col) => ({
        id: col.id,
        name: col.name,
        description: col.description,
        icon: col.icon,
        promptCount: col._count.sparks,
        isFeatured: col.isFeatured,
        isGlobal: col.isGlobal,
        isSharedWithGrove: col.isSharedWithGrove || false,
        createdAt: col.createdAt,
        isActive: col.userActivations.length > 0 ? col.userActivations[0].isActive : false,
      }))

    return NextResponse.json({
      userCollections: transformCollections(userCollections),
      featuredCollections: transformCollections(featuredCollections),
    })
  } catch (error) {
    console.error('Error fetching spark collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

// POST /api/spark-collections - Create new collection manually
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      )
    }

    // Create the collection
    const collection = await prisma.sparkCollection.create({
      data: {
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || null,
        promptCount: 0,
        isFeatured: false,
        isGlobal: false,
      },
    })

    // Auto-activate for the user
    await prisma.userSparkCollection.create({
      data: {
        userId,
        collectionId: collection.id,
        isActive: true,
      },
    })

    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error('Error creating spark collection:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}

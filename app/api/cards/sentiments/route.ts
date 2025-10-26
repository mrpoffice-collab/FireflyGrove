import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Fetch all active sentiments for this category
    const sentiments = await prisma.cardSentiment.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        id: true,
        coverMessage: true,
        insideMessage: true,
        tags: true,
      },
    })

    return NextResponse.json({ sentiments })
  } catch (error) {
    console.error('Error fetching sentiments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiments' },
      { status: 500 }
    )
  }
}

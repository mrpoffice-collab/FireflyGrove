import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get optional category filter from query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const prompts = await prisma.audioPrompt.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
      ],
    })

    // Get unique categories for filtering
    const categories = await prisma.audioPrompt.groupBy({
      by: ['category'],
      where: { isActive: true },
      orderBy: { category: 'asc' },
    })

    return NextResponse.json({
      prompts,
      categories: categories.map((c) => c.category),
    })
  } catch (error) {
    console.error('Error fetching audio prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

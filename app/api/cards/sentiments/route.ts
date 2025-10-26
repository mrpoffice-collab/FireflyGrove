import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

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

    // Read sentiments from CSV file
    const csvPath = path.join(process.cwd(), 'config', 'card-sentiments.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Get category name from categoryId (lookup from database)
    const category = await prisma.cardCategory.findUnique({
      where: { id: categoryId },
      select: { name: true },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Map database category names to CSV category names
    const categoryMapping: Record<string, string> = {
      'Sympathy & Condolence': 'In the Quiet of Loss',
      'Birthday': 'Another Year of Light',
      'Christmas & Holiday': 'Season of Warmth',
      'Thank You': 'Gratitude in Bloom',
      'Thinking of You': 'Under the Same Sky',
      'Anniversary': 'Love, Still Growing',
      'New Baby': 'New Light in the Grove',
      'Graduation': 'Stepping Into the Light',
      'Encouragement & Healing': 'Encouragement & Healing',
      'Friendship & Connection': 'Friendship & Connection',
      'Pet Remembrance': 'Pet Remembrance',
      'Just Because': 'Just Because',
    }

    const csvCategoryName = categoryMapping[category.name]

    if (!csvCategoryName) {
      return NextResponse.json({ sentiments: [] })
    }

    // Filter sentiments by exact CSV Category match
    const sentiments = records
      .filter((record: any) => {
        return record.Category === csvCategoryName
      })
      .map((record: any, index: number) => ({
        id: `csv-${categoryId}-${index}`,
        coverMessage: record.Front || record.Category,
        insideMessage: record.Inside || '',
        tags: record.Tags || '',
      }))

    return NextResponse.json({ sentiments })
  } catch (error) {
    console.error('Error fetching sentiments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiments' },
      { status: 500 }
    )
  }
}

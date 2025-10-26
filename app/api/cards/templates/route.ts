import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const templates = await prisma.cardTemplate.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        previewImage: true,
        digitalPrice: true,
        physicalPrice: true,
        maxPhotos: true,
        htmlTemplate: true,
        cssStyles: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching card templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const articles = await prisma.knowledgeArticle.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        category: true,
        tags: true,
        timeToRead: true,
        difficulty: true,
        featured: true,
        isNew: true,
        viewCount: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Knowledge articles fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

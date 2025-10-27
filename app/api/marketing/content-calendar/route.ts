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

    // Fetch all content calendar items
    const calendarItems = await prisma.contentCalendar.findMany({
      orderBy: { scheduledFor: 'asc' }
    })

    // Fetch related posts
    const postIds = calendarItems.filter(item => item.postId).map(item => item.postId as string)
    const posts = await prisma.marketingPost.findMany({
      where: { id: { in: postIds } },
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
        views: true,
        signups: true
      }
    })

    // Merge posts into calendar items
    const calendar = calendarItems.map(item => ({
      ...item,
      post: item.postId ? posts.find(p => p.id === item.postId) : null
    }))

    return NextResponse.json({ calendar })
  } catch (error) {
    console.error('Error fetching content calendar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content calendar' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    await prisma.contentCalendar.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar item:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar item' },
      { status: 500 }
    )
  }
}

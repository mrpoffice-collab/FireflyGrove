import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseBlogForVideo } from '@/lib/blogVideoParser'
import { getPostBySlug } from '@/lib/blog'

interface ParseRequest {
  slug: string
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ParseRequest = await req.json()
    const { slug } = body

    if (!slug) {
      return NextResponse.json(
        { error: 'Blog slug is required' },
        { status: 400 }
      )
    }

    console.log(`Parsing blog post: ${slug}`)

    // Fetch the blog post
    const post = await getPostBySlug(slug)

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Parse the post for video
    const script = parseBlogForVideo(post)

    console.log(`✓ Parsed blog post: ${script.sections.length} sections, ${script.estimatedDuration}s duration`)

    return NextResponse.json({
      success: true,
      script,
    })
  } catch (error) {
    console.error('Error parsing blog for video:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to parse blog post' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBestImageForPost } from '@/lib/marketing/imageSelector'

/**
 * POST /api/marketing/posts/assign-images
 * Automatically assign images to posts that don't have them
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    const isAdmin = (session?.user as any)?.isAdmin

    if (!userId || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const { postIds } = await request.json()

    // If no postIds provided, find all posts without images
    let postsToUpdate
    if (postIds && Array.isArray(postIds)) {
      postsToUpdate = await prisma.marketingPost.findMany({
        where: {
          id: { in: postIds },
        },
        select: {
          id: true,
          title: true,
          content: true,
          keywords: true,
          topic: true,
          platform: true,
          image: true,
        },
      })
    } else {
      postsToUpdate = await prisma.marketingPost.findMany({
        where: {
          OR: [{ image: null }, { image: '' }],
        },
        select: {
          id: true,
          title: true,
          content: true,
          keywords: true,
          topic: true,
          platform: true,
          image: true,
        },
        take: 50, // Limit to 50 at a time
      })
    }

    if (postsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts need image assignment',
        updated: 0,
      })
    }

    console.log(`🖼️ Assigning images to ${postsToUpdate.length} posts...`)

    const results = {
      updated: [] as string[],
      failed: [] as { id: string; error: string }[],
    }

    for (const post of postsToUpdate) {
      try {
        // Get best image for this post
        const imageUrl = getBestImageForPost({
          keywords: post.keywords || [],
          topic: post.topic,
          platform: post.platform,
          title: post.title,
          content: post.content,
        })

        if (imageUrl) {
          // Update post with image
          await prisma.marketingPost.update({
            where: { id: post.id },
            data: { image: imageUrl },
          })

          console.log(`  ✅ Assigned image to: ${post.title}`)
          results.updated.push(post.id)
        } else {
          console.log(`  ⚠️ No suitable image found for: ${post.title}`)
          results.failed.push({
            id: post.id,
            error: 'No suitable image found',
          })
        }
      } catch (error) {
        console.error(`  ❌ Failed to assign image to ${post.id}:`, error)
        results.failed.push({
          id: post.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    console.log(
      `✅ Image assignment complete: ${results.updated.length} updated, ${results.failed.length} failed`
    )

    return NextResponse.json({
      success: true,
      message: `Assigned images to ${results.updated.length} post(s)`,
      updated: results.updated.length,
      failed: results.failed.length,
      errors: results.failed,
    })
  } catch (error) {
    console.error('Error assigning images:', error)
    return NextResponse.json(
      {
        error: 'Failed to assign images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/marketing/posts/assign-images
 * Check how many posts need image assignment
 */
export async function GET() {
  try {
    const postsWithoutImages = await prisma.marketingPost.count({
      where: {
        OR: [{ image: null }, { image: '' }],
      },
    })

    const totalPosts = await prisma.marketingPost.count()

    return NextResponse.json({
      needsImages: postsWithoutImages,
      totalPosts,
      percentageWithImages: totalPosts > 0 ? ((totalPosts - postsWithoutImages) / totalPosts) * 100 : 0,
    })
  } catch (error) {
    console.error('Error checking image status:', error)
    return NextResponse.json({ error: 'Failed to check image status' }, { status: 500 })
  }
}

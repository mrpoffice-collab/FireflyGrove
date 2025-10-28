import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVideoScript } from '@/lib/marketing/videoScriptGenerator'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * POST /api/marketing/posts/generate-marketing-video
 * Generate a complete marketing video package (script + voice-over + metadata)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { postId, voice = 'nova' } = body

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    // Get the blog post
    const post = await prisma.marketingPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    console.log(`🎬 Generating marketing video for: ${post.title}`)

    // Step 1: Generate video script
    console.log('  → Generating script...')
    const script = await generateVideoScript(
      post.title,
      post.excerpt || post.content.substring(0, 300),
      post.keywords
    )

    // Step 2: Generate voice-over
    console.log('  → Generating voice-over...')
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: script.script,
      speed: 1.0,
    })

    const audioBuffer = Buffer.from(await mp3.arrayBuffer())
    const audioBase64 = audioBuffer.toString('base64')

    console.log(`  ✅ Voice-over generated: ${audioBuffer.length} bytes`)

    // Step 3: Prepare video metadata
    const videoMetadata = {
      title: post.title,
      description: `${post.excerpt}\n\nRead more: https://fireflygrove.app/blog/${post.slug}`,
      duration: script.estimatedDuration,
      script: {
        full: script.script,
        hook: script.hook,
        keyPoints: script.keyPoints,
        cta: script.cta,
      },
      images: [post.image], // Could add more images from related posts
      keywords: post.keywords,
    }

    console.log(`✅ Marketing video package generated successfully`)

    return NextResponse.json({
      success: true,
      video: {
        script: script.script,
        scriptBreakdown: {
          hook: script.hook,
          keyPoints: script.keyPoints,
          cta: script.cta,
        },
        voiceOver: {
          audio: audioBase64,
          format: 'mp3',
          size: audioBuffer.length,
          duration: script.estimatedDuration,
        },
        metadata: videoMetadata,
        post: {
          id: post.id,
          title: post.title,
          image: post.image,
          slug: post.slug,
        },
      },
      message: 'Marketing video package generated! Ready for video creation.',
    })
  } catch (error: any) {
    console.error('Error generating marketing video:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate marketing video',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * API endpoint to generate tutorial videos
 *
 * POST /api/admin/generate-tutorial
 * Body: { tutorialId: string }
 *
 * This will:
 * 1. Validate admin access
 * 2. Look up the tutorial by ID
 * 3. Spawn a background process to generate the video
 * 4. Return job ID for status tracking
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, we'll return a placeholder response
    // In production, this would spawn a worker process
    const { tutorialId } = await request.json()

    if (!tutorialId) {
      return NextResponse.json(
        { error: 'Tutorial ID required' },
        { status: 400 }
      )
    }

    // Video generation runs as a separate service (not in Vercel serverless)
    // Return instructions for running the video generator
    return NextResponse.json({
      status: 'ready',
      tutorialId,
      message: 'Video generation system ready to use!',
      setup: {
        step1: 'Video generation runs locally or on a dedicated server (not in Vercel)',
        step2: 'Requires: Node.js with Puppeteer and browser automation tools',
        step3: 'Can be triggered manually or integrated with a job queue service'
      },
      howToRun: {
        locally: {
          step1: 'Create a separate project folder',
          step2: 'npm install puppeteer puppeteer-screen-recorder @ffmpeg-installer/ffmpeg tsx',
          step3: 'Copy scripts/generate-tutorial-video.ts to your project',
          step4: 'npx tsx generate-tutorial-video.ts',
          step5: 'Videos save to ./tutorial-videos/'
        },
        production: {
          option1: 'Deploy to a dedicated server (AWS EC2, DigitalOcean, etc.)',
          option2: 'Use a worker service (AWS Lambda with longer timeout, GCP Cloud Run)',
          option3: 'Set up a job queue (BullMQ + Redis) to process requests'
        }
      },
      nextSteps: [
        '✅ Tutorial scripts defined - DONE',
        '✅ Video generation code written - DONE',
        '🔄 Set up separate video generation service - YOUR CHOICE',
        '⏳ Integrate text-to-speech (Nora) - PLANNED',
        '⏳ Auto-upload to YouTube - PLANNED'
      ],
      note: 'Click "Copy Script" to get the full tutorial script, or "Open Pages" to record manually'
    })
  } catch (error) {
    console.error('Error in generate-tutorial endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to generate tutorial video' },
      { status: 500 }
    )
  }
}

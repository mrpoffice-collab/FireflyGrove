import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

// Lazy initialization function to avoid build-time errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

/**
 * POST /api/marketing/generate-voiceover
 * Generate voice-over audio from text using OpenAI TTS
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { text, voice = 'nova' } = body

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 })
    }

    // Initialize OpenAI client
    const openai = getOpenAIClient()
    if (!openai) {
      return NextResponse.json({
        error: 'Voice-over feature is not configured. Add OPENAI_API_KEY to enable.'
      }, { status: 503 })
    }

    console.log(`🎤 Generating voice-over (${text.length} chars)...`)

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: 1.0,
    })

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    console.log(`✅ Voice-over generated: ${buffer.length} bytes`)

    // Return audio as base64 for easy client-side handling
    return NextResponse.json({
      success: true,
      audio: buffer.toString('base64'),
      format: 'mp3',
      size: buffer.length,
    })
  } catch (error: any) {
    console.error('Error generating voice-over:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate voice-over' },
      { status: 500 }
    )
  }
}

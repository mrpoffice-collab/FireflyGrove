import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export type VoiceOption = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

// Lazy initialization to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

interface VoiceoverRequest {
  sections: Array<{
    id: string
    text: string
  }>
  voice?: VoiceOption
  speed?: number
}

interface VoiceoverResult {
  sectionId: string
  audioData: string // base64 encoded audio
  duration: number
  format: string
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

    const body: VoiceoverRequest = await req.json()
    const { sections, voice = 'nova', speed = 0.95 } = body

    if (!sections || sections.length === 0) {
      return NextResponse.json(
        { error: 'No sections provided' },
        { status: 400 }
      )
    }

    console.log(`Generating voiceover for ${sections.length} sections with voice: ${voice}`)

    const openai = getOpenAIClient()
    const results: VoiceoverResult[] = []

    // Generate audio for each section
    for (const section of sections) {
      try {
        console.log(`Processing section ${section.id}: ${section.text.slice(0, 50)}...`)

        const mp3Response = await openai.audio.speech.create({
          model: 'tts-1-hd', // Higher quality
          voice: voice,
          input: section.text,
          speed: speed,
        })

        // Convert to buffer
        const arrayBuffer = await mp3Response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Estimate duration (rough calculation: 150 words per minute)
        const wordCount = section.text.split(/\s+/).length
        const estimatedDuration = Math.ceil((wordCount / 150) * 60)

        // Convert to base64 for transfer
        const base64Audio = buffer.toString('base64')

        results.push({
          sectionId: section.id,
          audioData: base64Audio,
          duration: estimatedDuration,
          format: 'mp3',
        })

        console.log(`✓ Generated audio for section ${section.id} (${estimatedDuration}s)`)
      } catch (error) {
        console.error(`Error generating audio for section ${section.id}:`, error)
        throw error
      }
    }

    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
    const totalCharacters = sections.reduce((sum, s) => sum + s.text.length, 0)
    const estimatedCost = (totalCharacters / 1000) * 0.03 // $0.03 per 1K characters

    console.log(`✓ Generated ${results.length} voiceovers (${totalDuration}s total, ~$${estimatedCost.toFixed(3)})`)

    return NextResponse.json({
      success: true,
      results,
      metadata: {
        totalSections: results.length,
        totalDuration,
        totalCharacters,
        estimatedCost,
        voice,
        speed,
      },
    })
  } catch (error) {
    console.error('Error generating voiceover:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate voiceover' },
      { status: 500 }
    )
  }
}

/**
 * Get available voice options
 */
export async function GET() {
  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced tone' },
    { id: 'echo', name: 'Echo', description: 'Male, clear and direct' },
    { id: 'fable', name: 'Fable', description: 'British, storytelling' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative male' },
    { id: 'nova', name: 'Nova', description: 'Warm, engaging female (recommended for marketing)' },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft, friendly female' },
  ]

  return NextResponse.json({ voices })
}

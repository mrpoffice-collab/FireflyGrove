import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/audio-playback/[entryId]
 *
 * Permanent audio playback endpoint for QR codes in memory books
 * This URL never expires (unlike signed Blob URLs)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params

    // Fetch entry with audio
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        audioUrl: true,
        status: true,
        text: true,
        author: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            title: true,
            person: {
              select: {
                isLegacy: true,
                discoveryEnabled: true,
              },
            },
          },
        },
      },
    })

    if (!entry) {
      return new NextResponse('Audio not found', { status: 404 })
    }

    if (entry.status !== 'ACTIVE') {
      return new NextResponse('This audio memory is no longer available', { status: 410 })
    }

    if (!entry.audioUrl) {
      return new NextResponse('No audio attached to this memory', { status: 404 })
    }

    // Check if this is a public legacy tree (accessible to anyone via QR code)
    const isPublicLegacy = entry.branch.person?.isLegacy && entry.branch.person?.discoveryEnabled

    if (!isPublicLegacy) {
      // For private memories, could add auth check here
      // For now, allow access if they have the QR code link
      // (This assumes QR codes are only in physical books owned by family)
    }

    // Fetch the audio file from Vercel Blob (or wherever it's stored)
    const audioResponse = await fetch(entry.audioUrl)

    if (!audioResponse.ok) {
      console.error(`Failed to fetch audio: ${audioResponse.statusText}`)
      return new NextResponse('Audio file not accessible', { status: 500 })
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg'

    // Return audio with proper headers
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="memory-audio-${entryId}.mp3"`,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'X-Memory-Author': entry.author.name,
        'X-Memory-Branch': entry.branch.title,
      },
    })
  } catch (error: any) {
    console.error('[Audio Playback] Error:', error)
    return new NextResponse('Failed to load audio', { status: 500 })
  }
}

/**
 * HEAD /api/audio-playback/[entryId]
 *
 * Check if audio exists (for QR code validation)
 */
export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { audioUrl: true, status: true },
    })

    if (!entry || entry.status !== 'ACTIVE' || !entry.audioUrl) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Fetch sound art by unique code
    const soundArt = await prisma.soundArt.findUnique({
      where: {
        uniqueCode: code.toUpperCase(),
        deletedAt: null, // Only show non-deleted items
      },
      select: {
        id: true,
        uniqueCode: true,
        audioUrl: true,
        audioFilename: true,
        audioDuration: true,
        waveformData: true,
        title: true,
        primaryColor: true,
        backgroundColor: true,
        waveformStyle: true,
        playCount: true,
        createdAt: true,
      },
    })

    if (!soundArt) {
      return NextResponse.json({ error: 'Sound art not found' }, { status: 404 })
    }

    return NextResponse.json({
      soundArt: {
        ...soundArt,
        createdAt: soundArt.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[SoundArt Fetch] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sound art' },
      { status: 500 }
    )
  }
}

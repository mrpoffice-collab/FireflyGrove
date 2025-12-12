import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Find the sound art first
    const existingSoundArt = await prisma.soundArt.findFirst({
      where: {
        uniqueCode: code.toUpperCase(),
        deletedAt: null,
      },
      select: {
        id: true,
      },
    })

    if (!existingSoundArt) {
      return NextResponse.json({ error: 'Sound art not found' }, { status: 404 })
    }

    // Increment play count and update last played timestamp
    const soundArt = await prisma.soundArt.update({
      where: {
        id: existingSoundArt.id,
      },
      data: {
        playCount: {
          increment: 1,
        },
        lastPlayedAt: new Date(),
      },
      select: {
        id: true,
        playCount: true,
      },
    })

    console.log(`[SoundArt Play] Sound art ${soundArt.id} played (count: ${soundArt.playCount})`)

    return NextResponse.json({
      success: true,
      playCount: soundArt.playCount,
    })
  } catch (error) {
    console.error('[SoundArt Play] Error:', error)
    return NextResponse.json(
      { error: 'Failed to track play' },
      { status: 500 }
    )
  }
}

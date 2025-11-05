import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { safeBlobUpload } from '@/lib/blob-upload-safe'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed audio MIME types
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', // MP3
  'audio/wav', // WAV
  'audio/x-wav', // WAV alternative
  'audio/wave', // WAV alternative
  'audio/mp4', // M4A
  'audio/x-m4a', // M4A alternative
  'audio/ogg', // OGG
  'audio/webm', // WEBM
]

export async function POST(req: NextRequest) {
  try {
    // Get session (optional - users can create without login)
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null

    // Parse form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const waveformDataStr = formData.get('waveformData') as string | null
    const title = formData.get('title') as string | null
    const uniqueCode = formData.get('uniqueCode') as string | null
    const primaryColor = (formData.get('primaryColor') as string) || '#FFD966'
    const backgroundColor = (formData.get('backgroundColor') as string) || '#0A0E14'
    const waveformStyle = (formData.get('waveformStyle') as string) || 'bars'
    const stylePreset = (formData.get('stylePreset') as string) || 'modern'
    const audioDuration = parseFloat((formData.get('audioDuration') as string) || '0')

    // Validate required fields
    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    if (!waveformDataStr) {
      return NextResponse.json({ error: 'Waveform data is required' }, { status: 400 })
    }

    if (!uniqueCode) {
      return NextResponse.json({ error: 'Unique code is required' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(audioFile.type)) {
      return NextResponse.json(
        {
          error: `Invalid audio type. Allowed types: ${ALLOWED_AUDIO_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Check if unique code already exists
    const existingCode = await prisma.soundArt.findUnique({
      where: { uniqueCode },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: 'Unique code already exists. Please try again.' },
        { status: 409 }
      )
    }

    // 🔒 SAFE UPLOAD: Upload audio file to Vercel Blob with verification
    const uploadResult = await safeBlobUpload(
      `soundart/${uniqueCode}/${audioFile.name}`,
      audioFile,
      {
        userId: userId || 'anonymous',
        type: 'audio',
        recordType: 'soundArt'
      },
      {
        addRandomSuffix: false
      }
    )

    if (!uploadResult.success || !uploadResult.verified) {
      console.error('🚨 SoundArt upload verification failed', {
        error: uploadResult.error,
        userId,
        uniqueCode,
        filename: audioFile.name
      })

      return NextResponse.json(
        {
          error: 'Upload verification failed. Please try again.',
          details: uploadResult.error
        },
        { status: 500 }
      )
    }

    console.log(`[SoundArt Upload] Uploaded audio to blob: ${uploadResult.url}`)

    // Create SoundArt record in database
    const soundArt = await prisma.soundArt.create({
      data: {
        userId,
        uniqueCode,
        audioUrl: uploadResult.url!,
        audioFilename: audioFile.name,
        audioSizeBytes: audioFile.size,
        audioDuration,
        waveformData: waveformDataStr,
        title: title || null,
        stylePreset,
        primaryColor,
        backgroundColor,
        waveformStyle,
      },
    })

    console.log(
      `[SoundArt Upload] Created sound art record #${soundArt.id} for user ${userId || 'anonymous'}`
    )

    return NextResponse.json({
      success: true,
      soundArt: {
        id: soundArt.id,
        uniqueCode: soundArt.uniqueCode,
        audioUrl: soundArt.audioUrl,
        playUrl: `/soundart/play/${soundArt.uniqueCode}`,
      },
    })
  } catch (error) {
    console.error('[SoundArt Upload] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload audio file' },
      { status: 500 }
    )
  }
}

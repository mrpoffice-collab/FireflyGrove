import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { safeBlobUpload } from '@/lib/blob-upload-safe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const promptId = formData.get('promptId') as string | null
    const customPrompt = formData.get('customPrompt') as string | null
    const recordedBy = formData.get('recordedBy') as string | null
    const branchId = formData.get('branchId') as string | null
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const duration = parseFloat(formData.get('duration') as string)

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    // 🔒 SAFE UPLOAD: Upload to Vercel Blob with verification
    const filename = `audio-spark-${Date.now()}-${audioFile.name}`
    const uploadResult = await safeBlobUpload(
      filename,
      audioFile,
      {
        userId: user.id,
        type: 'audio',
        recordType: 'audioSpark'
      }
    )

    if (!uploadResult.success || !uploadResult.verified) {
      console.error('🚨 Audio spark upload verification failed', {
        error: uploadResult.error,
        userId: user.id,
        filename
      })

      return NextResponse.json(
        {
          error: 'Upload verification failed. Please try again.',
          details: uploadResult.error
        },
        { status: 500 }
      )
    }

    // Create AudioSpark record
    const audioSpark = await prisma.audioSpark.create({
      data: {
        userId: user.id,
        promptId: promptId || null,
        customPrompt,
        audioUrl: uploadResult.url!,
        audioFilename: filename,
        audioSizeBytes: audioFile.size,
        audioDuration: duration,
        recordedBy,
        branchId,
        title,
        description,
        status: 'saved',
      },
      include: {
        prompt: true,
      },
    })

    // Update prompt usage count if applicable
    if (promptId) {
      await prisma.audioPrompt.update({
        where: { id: promptId },
        data: {
          usageCount: { increment: 1 },
        },
      })
    }

    return NextResponse.json({ success: true, audioSpark })
  } catch (error) {
    console.error('Error uploading audio spark:', error)
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    )
  }
}

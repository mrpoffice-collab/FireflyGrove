import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { safeBlobUpload } from '@/lib/blob-upload-safe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const type = formData.get('type') as string || 'general'

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    // 🔒 SAFE UPLOAD: Upload to Vercel Blob with verification
    const filename = `${type}-audio-${Date.now()}-${audioFile.name}`
    const uploadResult = await safeBlobUpload(
      filename,
      audioFile,
      {
        userId: user.id,
        type: 'audio',
        recordType: 'entry'
      }
    )

    if (!uploadResult.success || !uploadResult.verified) {
      console.error('🚨 Audio upload verification failed', {
        error: uploadResult.error,
        userId: user.id,
        filename,
        type
      })

      return NextResponse.json(
        {
          error: 'Upload verification failed. Please try again.',
          details: uploadResult.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename,
    })
  } catch (error) {
    console.error('Error uploading audio:', error)
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    )
  }
}

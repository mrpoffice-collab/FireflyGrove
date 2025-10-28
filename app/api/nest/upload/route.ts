import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

/**
 * POST /api/nest/upload
 * Upload a photo to the nest
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get user to check admin status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })

    const isAdmin = user?.isAdmin || false

    // Get the form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Determine file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    // Validate file type
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'File must be an image or video' },
        { status: 400 }
      )
    }

    // Videos are admin-only
    if (isVideo && !isAdmin) {
      return NextResponse.json(
        { error: 'Video uploads are currently in beta testing. Contact support to enable this feature.' },
        { status: 403 }
      )
    }

    // Validate file size
    const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024 // 500MB for video, 10MB for images
    if (file.size > maxSize) {
      const maxSizeLabel = isVideo ? '500MB' : '10MB'
      return NextResponse.json(
        { error: `File size must be less than ${maxSizeLabel}` },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob with appropriate path
    const pathPrefix = isVideo ? 'nest/videos' : 'nest'
    const blob = await put(`${pathPrefix}/${userId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Create nest item in database
    const nestItem = await prisma.nestItem.create({
      data: {
        userId,
        photoUrl: isImage ? blob.url : null,
        videoUrl: isVideo ? blob.url : null,
        mediaType: isVideo ? 'video' : 'photo',
        filename: file.name,
        sizeBytes: file.size,
        uploadedAt: new Date(),
      },
    })

    console.log(`✅ Nest item created: ${file.name} (${isVideo ? 'VIDEO' : 'PHOTO'}) - ID: ${nestItem.id}`)

    return NextResponse.json({ item: nestItem }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading to nest:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}

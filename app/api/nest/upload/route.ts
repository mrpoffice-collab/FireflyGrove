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

    // Get the form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`nest/${userId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Create nest item in database
    const nestItem = await prisma.nestItem.create({
      data: {
        userId,
        photoUrl: blob.url,
        filename: file.name,
        sizeBytes: file.size,
        uploadedAt: new Date(),
      },
    })

    return NextResponse.json({ item: nestItem }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading to nest:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

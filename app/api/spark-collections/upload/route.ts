import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const icon = formData.get('icon') as string | null
    const description = formData.get('description') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
    }

    // Only accept text files
    if (!file.name.endsWith('.txt')) {
      return NextResponse.json({ error: 'Only .txt files are supported' }, { status: 400 })
    }

    // Read file content
    const text = await file.text()

    // Split by newlines and filter out empty lines
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length === 0) {
      return NextResponse.json({ error: 'No prompts found in file' }, { status: 400 })
    }

    // Create the collection
    const collection = await prisma.sparkCollection.create({
      data: {
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || null,
        promptCount: lines.length,
        isFeatured: false,
        isGlobal: false,
      },
    })

    // Create all sparks in the collection
    const sparkPromises = lines.map((line, index) =>
      prisma.spark.create({
        data: {
          userId,
          collectionId: collection.id,
          text: line,
          order: index,
          isActive: true,
          isGlobal: false,
          sparkType: 'custom',
        },
      })
    )

    await Promise.all(sparkPromises)

    // Auto-activate this collection for the user
    await prisma.userSparkCollection.create({
      data: {
        userId,
        collectionId: collection.id,
        isActive: true,
      },
    })

    return NextResponse.json({
      collection,
      promptCount: lines.length,
      message: `Successfully uploaded ${lines.length} prompts!`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading spark collection:', error)
    return NextResponse.json(
      { error: 'Failed to upload collection' },
      { status: 500 }
    )
  }
}

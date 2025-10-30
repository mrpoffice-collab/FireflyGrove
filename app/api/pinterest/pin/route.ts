import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pinterest } from '@/lib/pinterest'
import { generatePinSVG, MemoryPinData, PIN_TEMPLATES } from '@/lib/pinGenerator'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/pinterest/pin
 * Create a Pinterest pin from Firefly Grove content
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!pinterest.isConfigured()) {
      return NextResponse.json(
        { error: 'Pinterest API not configured' },
        { status: 503 }
      )
    }

    const {
      memoryId,
      branchId,
      boardId,
      customTitle,
      customDescription,
      template,
    } = await req.json()

    // Fetch memory data
    let pinData: MemoryPinData
    let title: string
    let description: string
    let link: string

    if (memoryId) {
      // Create pin from a memory
      const memory = await prisma.entry.findUnique({
        where: { id: memoryId },
        include: {
          author: { select: { name: true } },
          branch: { select: { title: true, id: true } },
        },
      })

      if (!memory) {
        return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
      }

      pinData = {
        memoryText: memory.text,
        authorName: memory.author.name,
        branchTitle: memory.branch.title,
        memoryDate: new Date(memory.createdAt).toLocaleDateString(),
        photoUrl: memory.mediaUrl || undefined,
      }

      title = customTitle || `${memory.branch.title} - ${memory.text.substring(0, 50)}...`
      description = customDescription || `"${memory.text.substring(0, 200)}..." - Shared from Firefly Grove, a place to preserve family memories.`
      link = `${process.env.NEXTAUTH_URL}/branch/${memory.branch.id}`

    } else if (branchId) {
      // Create pin for a branch (memorial page)
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: {
          owner: { select: { name: true } },
          entries: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!branch) {
        return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
      }

      const latestMemory = branch.entries[0]

      pinData = {
        memoryText: latestMemory?.text || `Honoring the memory of ${branch.title}`,
        authorName: branch.owner.name,
        branchTitle: branch.title,
        photoUrl: latestMemory?.mediaUrl || undefined,
      }

      title = customTitle || `In Memory of ${branch.title}`
      description = customDescription || `Preserving memories of ${branch.title}. Visit their memorial page on Firefly Grove to share your own memories.`
      link = `${process.env.NEXTAUTH_URL}/branch/${branch.id}`

    } else {
      return NextResponse.json(
        { error: 'Either memoryId or branchId is required' },
        { status: 400 }
      )
    }

    // Generate pin image as SVG
    const templateToUse = template ? PIN_TEMPLATES[template as keyof typeof PIN_TEMPLATES] : PIN_TEMPLATES.memorial
    const svg = generatePinSVG(pinData, templateToUse)

    // Convert SVG to data URL for Pinterest
    const svgBase64 = Buffer.from(svg).toString('base64')
    const imageDataUrl = `data:image/svg+xml;base64,${svgBase64}`

    // For now, we'll use the image data URL directly
    // In production, you might want to upload to Vercel Blob storage first
    // and use that URL instead

    // Create the pin
    const pin = await pinterest.createPin({
      title,
      description,
      link,
      imageUrl: imageDataUrl,
      boardId: boardId,
      altText: `${pinData.branchTitle} - Memory from Firefly Grove`,
    })

    return NextResponse.json({
      success: true,
      pin: {
        id: pin.id,
        url: `https://pinterest.com/pin/${pin.id}`,
        title: pin.title,
        boardId: pin.board_id,
      },
    })

  } catch (error: any) {
    console.error('Error creating Pinterest pin:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create pin' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pinterest/pin
 * Delete a Pinterest pin
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = (session.user as any).isAdmin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!pinterest.isConfigured()) {
      return NextResponse.json(
        { error: 'Pinterest API not configured' },
        { status: 503 }
      )
    }

    const { pinId } = await req.json()

    if (!pinId) {
      return NextResponse.json({ error: 'Pin ID is required' }, { status: 400 })
    }

    await pinterest.deletePin(pinId)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting Pinterest pin:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete pin' },
      { status: 500 }
    )
  }
}

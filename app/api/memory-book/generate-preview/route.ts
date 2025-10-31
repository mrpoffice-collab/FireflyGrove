import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateMemoryBook } from '@/lib/memory-book-generator'

export const dynamic = 'force-dynamic'

/**
 * POST /api/memory-book/generate-preview
 *
 * Generate memory book PDFs for preview/download (without sending to Lulu)
 * Returns both interior and cover PDFs
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { branchId, includeAudioQR = true, coverType = 'hardcover' } = body

    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 })
    }

    console.log(`[Memory Book] Generating preview for branch ${branchId}...`)

    // Generate the book PDFs
    const startTime = Date.now()
    const book = await generateMemoryBook({
      branchId,
      userId,
      includeAudioQR,
      coverType,
    })

    const duration = Date.now() - startTime
    console.log(`[Memory Book] Generated in ${duration}ms:`, {
      pageCount: book.pageCount,
      memoryCount: book.memoryCount,
      audioCount: book.audioCount,
      interiorSize: `${Math.round(book.interiorPdf.length / 1024)}KB`,
      coverSize: `${Math.round(book.coverPdf.length / 1024)}KB`,
    })

    // Return PDFs as base64 for download or preview
    return NextResponse.json({
      success: true,
      book: {
        pageCount: book.pageCount,
        memoryCount: book.memoryCount,
        audioCount: book.audioCount,
        interiorPdf: book.interiorPdf.toString('base64'),
        coverPdf: book.coverPdf.toString('base64'),
        interiorSizeKB: Math.round(book.interiorPdf.length / 1024),
        coverSizeKB: Math.round(book.coverPdf.length / 1024),
      },
    })
  } catch (error: any) {
    console.error('[Memory Book] Generation failed:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate memory book',
        details: error.stack,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/memory-book/generate-preview?branchId=xxx
 *
 * Generate and download interior PDF directly
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userId = (session.user as any).id
    const branchId = req.nextUrl.searchParams.get('branchId')

    if (!branchId) {
      return new NextResponse('Branch ID required', { status: 400 })
    }

    console.log(`[Memory Book] Downloading interior PDF for branch ${branchId}...`)

    const book = await generateMemoryBook({
      branchId,
      userId,
      includeAudioQR: true,
    })

    // Return PDF for download
    return new NextResponse(new Uint8Array(book.interiorPdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="memory-book-interior-${branchId}.pdf"`,
        'Content-Length': book.interiorPdf.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[Memory Book] Download failed:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getLegacyDownload } from '@/lib/legacy'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const archive = await getLegacyDownload(token)

    return new NextResponse(archive.html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${archive.filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Error downloading legacy:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download legacy archive' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * This endpoint triggers Facebook to scrape a URL
 * Call this when a memorial page loads to pre-warm Facebook's cache
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    // Trigger Facebook scraper
    const fbDebugUrl = `https://graph.facebook.com/?id=${encodeURIComponent(url)}&scrape=true`

    try {
      const response = await fetch(fbDebugUrl, {
        method: 'POST',
      })

      const data = await response.json()

      console.log('Facebook scrape response:', data)

      return NextResponse.json({
        success: true,
        message: 'Facebook cache warmed',
        data,
        url
      })
    } catch (error: any) {
      console.error('Facebook scrape error:', error)
      // Don't fail - just log and continue
      return NextResponse.json({
        success: false,
        message: 'Failed to warm cache',
        error: error.message,
        url
      })
    }
  } catch (error: any) {
    console.error('Prefetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

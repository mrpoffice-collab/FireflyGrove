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
    const fbDebugUrl = `https://graph.facebook.com/?id=${encodeURIComponent(url)}&scrape=true&access_token=966242223397117|d41d8cd98f00b204e9800998ecf8427e`

    try {
      const response = await fetch(fbDebugUrl, {
        method: 'POST',
      })

      const data = await response.json()

      return NextResponse.json({
        success: true,
        message: 'Facebook cache warmed',
        data
      })
    } catch (error: any) {
      console.error('Facebook scrape error:', error)
      // Don't fail - just log and continue
      return NextResponse.json({
        success: true,
        message: 'Attempted to warm cache'
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

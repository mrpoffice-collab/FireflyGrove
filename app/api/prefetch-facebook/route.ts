import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * This endpoint triggers Facebook to scrape a URL
 * Call this when a memorial page loads to pre-warm Facebook's cache
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Prefetch API received body:', body)

    const { url } = body

    if (!url) {
      console.error('No URL provided in request body')
      return NextResponse.json({ error: 'URL required', receivedBody: body }, { status: 400 })
    }

    console.log('Attempting to prefetch URL:', url)

    // Trigger Facebook scraper
    const fbDebugUrl = `https://graph.facebook.com/?id=${encodeURIComponent(url)}&scrape=true`
    console.log('Facebook Debug URL:', fbDebugUrl)

    try {
      const response = await fetch(fbDebugUrl, {
        method: 'POST',
      })

      console.log('Facebook response status:', response.status)
      const data = await response.json()

      console.log('Facebook scrape response:', JSON.stringify(data, null, 2))

      return NextResponse.json({
        success: true,
        message: 'Facebook cache warmed',
        data,
        url,
        fbDebugUrl
      })
    } catch (error: any) {
      console.error('Facebook scrape error:', error)
      // Don't fail - just log and continue
      return NextResponse.json({
        success: false,
        message: 'Failed to warm cache',
        error: error.message,
        url,
        errorDetails: error.toString()
      })
    }
  } catch (error: any) {
    console.error('Prefetch error:', error)
    return NextResponse.json(
      { error: error.message, errorType: error.constructor.name },
      { status: 500 }
    )
  }
}

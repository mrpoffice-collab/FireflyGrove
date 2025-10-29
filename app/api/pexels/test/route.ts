import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchPhotos } from '@/lib/pexels'

/**
 * GET /api/pexels/test
 * Test Pexels API connection
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test with a simple query
    const results = await searchPhotos('nature', 1, 5)

    return NextResponse.json({
      success: true,
      message: 'Pexels API is working!',
      test_results: {
        total_results: results.total_results,
        photos_returned: results.photos?.length || 0,
        sample_photo: results.photos?.[0] ? {
          id: results.photos[0].id,
          photographer: results.photos[0].photographer,
          alt: results.photos[0].alt,
        } : null,
      },
    })
  } catch (error) {
    console.error('Error testing Pexels API:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test Pexels API'
      },
      { status: 500 }
    )
  }
}

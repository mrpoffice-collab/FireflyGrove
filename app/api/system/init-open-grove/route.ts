import { NextResponse } from 'next/server'
import { getOrCreateOpenGrove } from '@/lib/openGrove'

export const dynamic = 'force-dynamic'

/**
 * GET /api/system/init-open-grove
 *
 * Initialize the Open Grove (system grove for public legacy trees)
 * This is idempotent - safe to call multiple times
 */
export async function GET() {
  try {
    const openGrove = await getOrCreateOpenGrove()

    return NextResponse.json({
      success: true,
      message: 'Open Grove initialized',
      grove: {
        id: openGrove.id,
        name: openGrove.name,
        isOpenGrove: openGrove.isOpenGrove,
        treeLimit: openGrove.treeLimit,
      },
    })
  } catch (error: any) {
    console.error('Error initializing Open Grove:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Open Grove' },
      { status: 500 }
    )
  }
}

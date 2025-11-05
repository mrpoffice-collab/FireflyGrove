import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { runComprehensiveHealthCheck } from '@/lib/blob-monitoring'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/blob-health
 * Run a blob health check (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Verify admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get limit from query params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log(`🏥 [ADMIN] Running blob health check (limit: ${limit})...`)

    // Run health check
    const report = await runComprehensiveHealthCheck(limit)

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error: any) {
    console.error('Error running blob health check:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run health check' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/blob-health/verify
 * Verify a specific blob URL (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Verify admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    // Verify the blob
    const { verifyBlobUrl } = await import('@/lib/blob-monitoring')
    const result = await verifyBlobUrl(url)

    return NextResponse.json({
      success: true,
      verification: result
    })

  } catch (error: any) {
    console.error('Error verifying blob:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify blob' },
      { status: 500 }
    )
  }
}

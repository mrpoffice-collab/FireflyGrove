import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/check-email
 *
 * Check if an email exists in the system
 * Body: { email: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    return NextResponse.json({
      exists: !!user,
    })
  } catch (error: any) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check email' },
      { status: 500 }
    )
  }
}

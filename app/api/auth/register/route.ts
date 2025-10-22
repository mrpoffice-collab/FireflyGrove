import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isDemoMode } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: 'Registration is disabled in demo mode' },
      { status: 403 }
    )
  }

  try {
    const { email, password, name } = await req.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isDemoMode } from '@/lib/demo'

export const dynamic = 'force-dynamic'

/**
 * POST /api/beta-signup
 *
 * Instant beta tester signup - no invite required
 * Used by the Facebook post landing page for immediate access
 */
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered. Please log in instead.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with automatic beta tester status
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        status: 'ACTIVE',
        isBetaTester: true, // Automatically grant beta tester access
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBetaTester: true,
      },
    })

    // Auto-create Grove for new beta tester
    await prisma.grove.create({
      data: {
        userId: user.id,
        name: `${name.trim()}'s Grove`,
        planType: 'family', // Beta testers get family plan
        treeLimit: 10,
        status: 'active',
      },
    })

    console.log(`[Beta Signup] New beta tester signed up: ${email}`)

    return NextResponse.json({
      success: true,
      user,
      message: 'Welcome to Firefly Grove! Your beta tester account has been created.',
    })
  } catch (error: any) {
    console.error('Beta signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}

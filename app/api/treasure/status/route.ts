import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { startOfDay, format, differenceInDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get user with treasure data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastTreasureUTC: true,
        lastTreasureLocal: true,
        timeZone: true,
        graceTokensMonth: true,
        graceTokensUsed: true,
        graceMonthKey: true,
        treasureCount: true,
        lastPromptId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's timezone (from user or browser)
    const timeZone = user.timeZone || 'America/Chicago'

    // Get today in user's timezone
    const now = new Date()
    const zonedNow = toZonedTime(now, timeZone)
    const todayLocal = format(zonedNow, 'yyyy-MM-dd')
    const currentMonth = format(zonedNow, 'yyyy-MM')

    // Reset grace tokens if new month
    let graceTokensUsed = user.graceTokensUsed
    if (user.graceMonthKey !== currentMonth) {
      graceTokensUsed = 0
      await prisma.user.update({
        where: { id: userId },
        data: {
          graceTokensUsed: 0,
          graceMonthKey: currentMonth,
        },
      })
    }

    // Check if user already completed today
    const todayCompleted = user.lastTreasureLocal === todayLocal

    // Get a random prompt (avoid last one used)
    const prompts = await prisma.treasurePrompt.findMany({
      where: {
        isActive: true,
        ...(user.lastPromptId ? { id: { not: user.lastPromptId } } : {}),
      },
      select: {
        id: true,
        text: true,
        category: true,
        weight: true,
      },
    })

    // Weighted random selection
    let selectedPrompt = null
    if (prompts.length > 0) {
      const totalWeight = prompts.reduce((sum, p) => sum + p.weight, 0)
      let random = Math.random() * totalWeight

      for (const prompt of prompts) {
        random -= prompt.weight
        if (random <= 0) {
          selectedPrompt = prompt
          break
        }
      }

      // Fallback to first if somehow nothing selected
      if (!selectedPrompt) {
        selectedPrompt = prompts[0]
      }
    }

    // Determine if should show modal
    const shouldShowModal = !todayCompleted && selectedPrompt !== null

    // Calculate grace tokens available
    const graceTokensAvailable = user.graceTokensMonth - graceTokensUsed

    return NextResponse.json({
      shouldShowModal,
      todayCompleted,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      treasureCount: user.treasureCount,
      graceTokensAvailable,
      graceTokensMonth: user.graceTokensMonth,
      prompt: selectedPrompt,
      todayLocal,
    })
  } catch (error) {
    console.error('Treasure status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

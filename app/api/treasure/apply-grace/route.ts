import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format, differenceInDays, subDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { missedDate } = body // Format: "YYYY-MM-DD"

    if (!missedDate) {
      return NextResponse.json(
        { error: 'Missed date is required' },
        { status: 400 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastTreasureLocal: true,
        timeZone: true,
        graceTokensMonth: true,
        graceTokensUsed: true,
        graceMonthKey: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const timeZone = user.timeZone || 'America/Chicago'
    const now = new Date()
    const zonedNow = toZonedTime(now, timeZone)
    const todayLocal = format(zonedNow, 'yyyy-MM-dd')
    const currentMonth = format(zonedNow, 'yyyy-MM')

    // Reset grace tokens if new month
    let graceTokensUsed = user.graceTokensUsed
    let graceMonthKey = user.graceMonthKey

    if (user.graceMonthKey !== currentMonth) {
      graceTokensUsed = 0
      graceMonthKey = currentMonth
    }

    // Check if user has grace tokens available
    const graceTokensAvailable = user.graceTokensMonth - graceTokensUsed

    if (graceTokensAvailable <= 0) {
      return NextResponse.json(
        { error: 'No grace tokens available this month' },
        { status: 400 }
      )
    }

    // Validate missed date is within 48 hours
    const missedDateObj = new Date(missedDate + 'T00:00:00')
    const todayDateObj = new Date(todayLocal + 'T00:00:00')
    const daysDiff = differenceInDays(todayDateObj, missedDateObj)

    if (daysDiff > 2 || daysDiff < 1) {
      return NextResponse.json(
        { error: 'Grace tokens can only be applied to dates within the last 48 hours' },
        { status: 400 }
      )
    }

    // Check if there's already an entry for that date
    const existingEntry = await prisma.treasureEntry.findFirst({
      where: {
        userId,
        entryLocal: missedDate,
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You already have an entry for this date' },
        { status: 400 }
      )
    }

    // Create a grace entry (backfilled)
    await prisma.treasureEntry.create({
      data: {
        userId,
        text: '[Grace token applied - no entry for this day]',
        promptText: 'Grace token used',
        category: 'OTHER',
        entryLocal: missedDate,
        isBackfilled: true,
      },
    })

    // Calculate new streak
    let newStreak = user.currentStreak

    // If the missed date was yesterday, increment streak
    const yesterdayLocal = format(subDays(zonedNow, 1), 'yyyy-MM-dd')

    if (missedDate === yesterdayLocal && user.lastTreasureLocal) {
      const lastDate = new Date(user.lastTreasureLocal + 'T00:00:00')
      const yesterdayDate = new Date(yesterdayLocal + 'T00:00:00')
      const daysSinceLastEntry = differenceInDays(yesterdayDate, lastDate)

      if (daysSinceLastEntry === 1) {
        // Consecutive, increment
        newStreak = user.currentStreak + 1
      } else if (daysSinceLastEntry === 0) {
        // Same as last entry date
        newStreak = user.currentStreak
      }
    }

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: {
        graceTokensUsed: graceTokensUsed + 1,
        graceMonthKey,
        currentStreak: newStreak,
        lastTreasureLocal: missedDate > user.lastTreasureLocal! ? missedDate : user.lastTreasureLocal,
      },
    })

    // Log analytics event
    await prisma.treasureEvent.create({
      data: {
        userId,
        eventType: 'GRACE_TOKEN_USED',
        metadata: {
          missedDate,
          graceTokensRemaining: graceTokensAvailable - 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      graceTokensRemaining: graceTokensAvailable - 1,
      newStreak,
      message: 'Grace token applied! Your streak is safe.',
    })
  } catch (error) {
    console.error('Grace token error:', error)
    return NextResponse.json(
      { error: 'Failed to apply grace token' },
      { status: 500 }
    )
  }
}

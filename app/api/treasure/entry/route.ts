import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format, differenceInDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    const {
      text,
      audioUrl,
      promptId,
      promptText,
      category,
      branchId,
      chipUsed,
    } = body

    // Validation
    if (!text && !audioUrl) {
      return NextResponse.json(
        { error: 'Either text or audioUrl is required' },
        { status: 400 }
      )
    }

    if (!promptText) {
      return NextResponse.json(
        { error: 'Prompt text is required' },
        { status: 400 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastTreasureUTC: true,
        lastTreasureLocal: true,
        timeZone: true,
        treasureCount: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's timezone
    const timeZone = user.timeZone || 'America/Chicago'
    const now = new Date()
    const zonedNow = toZonedTime(now, timeZone)
    const todayLocal = format(zonedNow, 'yyyy-MM-dd')

    // Check if already completed today
    const alreadyCompletedToday = user.lastTreasureLocal === todayLocal

    // Calculate streak (only if this is first entry today)
    let newStreak = user.currentStreak
    let newLongestStreak = user.longestStreak

    if (!alreadyCompletedToday) {
      if (!user.lastTreasureLocal) {
        // First ever entry
        newStreak = 1
      } else {
        // Parse last completion date
        const lastDate = new Date(user.lastTreasureLocal + 'T00:00:00')
        const todayDate = new Date(todayLocal + 'T00:00:00')
        const daysDiff = differenceInDays(todayDate, lastDate)

        if (daysDiff === 1) {
          // Consecutive day
          newStreak = user.currentStreak + 1
        } else if (daysDiff === 0) {
          // Same day (shouldn't happen, but handle it)
          newStreak = user.currentStreak
        } else {
          // Streak broken
          newStreak = 1
        }
      }

      // Update longest streak if current is higher
      newLongestStreak = Math.max(newStreak, user.longestStreak)
    }

    // Create treasure entry
    const entry = await prisma.treasureEntry.create({
      data: {
        userId,
        text: text || '',
        audioUrl,
        promptId,
        promptText,
        category: category || 'OTHER',
        branchId,
        chipUsed,
        entryLocal: todayLocal,
        isBackfilled: false,
      },
      include: {
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Update user stats (only if first entry today)
    if (!alreadyCompletedToday) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastTreasureUTC: now,
          lastTreasureLocal: todayLocal,
          treasureCount: { increment: 1 },
          lastPromptId: promptId,
        },
      })
    } else {
      // Just increment count
      await prisma.user.update({
        where: { id: userId },
        data: {
          treasureCount: { increment: 1 },
        },
      })
    }

    // Log analytics event
    await prisma.treasureEvent.create({
      data: {
        userId,
        eventType: 'SAVE',
        metadata: {
          entryId: entry.id,
          category,
          hasAudio: !!audioUrl,
          chipUsed,
          isFirstToday: !alreadyCompletedToday,
          newStreak,
        },
      },
    })

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        text: entry.text,
        branch: entry.branch,
      },
      streak: {
        current: newStreak,
        longest: newLongestStreak,
        isNewRecord: newStreak === newLongestStreak && newStreak > 1,
      },
      message: alreadyCompletedToday
        ? 'Another treasure added today!'
        : 'Treasure saved!',
    })
  } catch (error) {
    console.error('Treasure entry error:', error)
    return NextResponse.json(
      { error: 'Failed to save treasure entry' },
      { status: 500 }
    )
  }
}

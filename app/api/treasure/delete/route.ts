import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { differenceInDays } from 'date-fns'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 })
    }

    // Get the entry to be deleted
    const entry = await prisma.treasureEntry.findUnique({
      where: { id: entryId },
      select: {
        userId: true,
        entryLocal: true,
        entryUTC: true,
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Verify ownership
    if (entry.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if this is the only entry for this day
    const entriesOnSameDay = await prisma.treasureEntry.count({
      where: {
        userId,
        entryLocal: entry.entryLocal,
      },
    })

    const isOnlyEntryForDay = entriesOnSameDay === 1

    // Delete the entry
    await prisma.treasureEntry.delete({
      where: { id: entryId },
    })

    // Update user's treasure count
    await prisma.user.update({
      where: { id: userId },
      data: {
        treasureCount: { decrement: 1 },
      },
    })

    // If this was the only entry for the day, we need to recalculate the glow trail
    if (isOnlyEntryForDay) {
      await recalculateGlowTrail(userId)
    }

    return NextResponse.json({
      success: true,
      wasOnlyEntryForDay: isOnlyEntryForDay,
      message: isOnlyEntryForDay
        ? 'Entry deleted. Your glow trail has been recalculated.'
        : 'Entry deleted.',
    })
  } catch (error) {
    console.error('Delete treasure entry error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete entry',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Recalculate glow trail from scratch based on all remaining entries
 */
async function recalculateGlowTrail(userId: string) {
  // Get all remaining entries ordered by date
  const entries = await prisma.treasureEntry.findMany({
    where: { userId },
    select: { entryLocal: true },
    orderBy: { entryLocal: 'asc' },
  })

  if (entries.length === 0) {
    // No entries left, reset everything
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 0,
        longestStreak: 0,
        lastTreasureLocal: null,
        lastTreasureUTC: null,
      },
    })
    return
  }

  // Get unique days (deduplicate)
  const uniqueDays = Array.from(new Set(entries.map((e) => e.entryLocal))).sort()

  let currentStreak = 1
  let longestStreak = 1

  // Calculate streaks by checking consecutive days
  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDate = new Date(uniqueDays[i - 1])
    const currDate = new Date(uniqueDays[i])
    const daysDiff = differenceInDays(currDate, prevDate)

    if (daysDiff === 1) {
      // Consecutive day
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      // Gap in streak
      currentStreak = 1
    }
  }

  // Get the most recent entry for lastTreasureUTC
  const lastEntry = await prisma.treasureEntry.findFirst({
    where: { userId },
    orderBy: { entryUTC: 'desc' },
    select: { entryUTC: true, entryLocal: true },
  })

  // Check if current streak is still active (last entry was today or yesterday)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  if (lastEntry && lastEntry.entryLocal !== today && lastEntry.entryLocal !== yesterday) {
    // Streak is broken, reset to 0
    currentStreak = 0
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak,
      lastTreasureLocal: lastEntry?.entryLocal || null,
      lastTreasureUTC: lastEntry?.entryUTC || null,
    },
  })
}

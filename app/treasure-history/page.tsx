'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'

interface TreasureEntry {
  id: string
  text: string
  audioUrl: string | null
  promptText: string
  category: string
  entryUTC: string
  entryLocal: string
  chipUsed: string | null
  branch: {
    id: string
    title: string
  } | null
}

interface Stats {
  currentGlowTrail: number
  longestGlowTrail: number
  totalCount: number
}

export default function TreasureHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<TreasureEntry[]>([])
  const [stats, setStats] = useState<Stats>({ currentGlowTrail: 0, longestGlowTrail: 0, totalCount: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all') // all, wisdom, spiritual, gratitude, etc.

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory()
    }
  }, [status])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/treasure/history')
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch treasure history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || 'User'} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-text-muted">Loading your treasures...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Filter entries
  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.category === filter)

  // Group by month
  const groupedByMonth = filteredEntries.reduce((acc, entry) => {
    const date = new Date(entry.entryUTC)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(entry)
    return acc
  }, {} as Record<string, TreasureEntry[]>)

  const categories = [
    { value: 'all', label: 'All Treasures' },
    { value: 'WISDOM', label: '🧠 Wisdom' },
    { value: 'SPIRITUAL', label: '✨ Spiritual' },
    { value: 'GRATITUDE', label: '🙏 Gratitude' },
    { value: 'LIFE_LESSON', label: '📚 Life Lessons' },
    { value: 'FAMILY_STORY', label: '👨‍👩‍👧‍👦 Family Stories' },
    { value: 'PARENTING', label: '👶 Parenting' },
    { value: 'NOTE_TO_SELF', label: '📝 Notes to Self' },
    { value: 'BLESSING', label: '🫶 Blessings' },
  ]

  return (
    <div className="min-h-screen">
      <Header
        userName={session.user?.name || ''}
        isBetaTester={(session.user as any)?.isBetaTester || false}
        isAdmin={(session.user as any)?.isAdmin || false}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/grove"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-light text-text-soft flex items-center gap-2">
              <span>📜</span>
              <span>My Treasure Chest</span>
            </h1>
          </div>
          <p className="text-text-muted">
            Your collection of wisdom, gratitude, and treasured thoughts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-firefly-glow mb-1">✨ {stats.currentGlowTrail}</div>
            <div className="text-xs text-text-muted">Current Glow Trail</div>
          </div>
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-text-soft mb-1">⭐ {stats.longestGlowTrail}</div>
            <div className="text-xs text-text-muted">Longest Glow Trail</div>
          </div>
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-text-soft mb-1">📜 {stats.totalCount}</div>
            <div className="text-xs text-text-muted">Total Treasures</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-soft ${
                  filter === cat.value
                    ? 'bg-firefly-dim/20 text-firefly-glow border border-firefly-dim/40'
                    : 'bg-bg-dark text-text-muted hover:text-text-soft border border-border-subtle hover:border-firefly-dim/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-bg-dark border border-border-subtle rounded-lg">
            <div className="text-5xl mb-4">📜</div>
            <p className="text-text-muted mb-4">No treasures yet</p>
            <Link
              href="/grove"
              className="inline-block px-6 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
            >
              Add Your First Treasure
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedByMonth)
              .sort()
              .reverse()
              .map((monthKey) => {
                const [year, month] = monthKey.split('-')
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })

                return (
                  <div key={monthKey}>
                    <h2 className="text-xl text-text-soft mb-4 font-light">{monthName}</h2>
                    <div className="space-y-4">
                      {groupedByMonth[monthKey].map((entry) => (
                        <div
                          key={entry.id}
                          className="bg-bg-dark border border-border-subtle rounded-lg p-4 hover:border-firefly-dim/30 transition-soft"
                        >
                          {/* Date and Category */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-text-muted">
                              {new Date(entry.entryUTC).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              {entry.branch && (
                                <span className="text-xs px-2 py-1 bg-firefly-dim/10 text-firefly-glow rounded">
                                  {entry.branch.title}
                                </span>
                              )}
                              <span className="text-xs px-2 py-1 bg-bg-elevated text-text-muted rounded">
                                {entry.category.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Prompt */}
                          <div className="text-sm italic text-text-muted mb-2">
                            "{entry.promptText}"
                          </div>

                          {/* Response */}
                          {entry.text && (
                            <div className="text-text-soft mb-3">
                              {entry.text}
                            </div>
                          )}

                          {/* Audio */}
                          {entry.audioUrl && (
                            <div className="mb-3">
                              <audio src={entry.audioUrl} controls className="w-full" />
                            </div>
                          )}

                          {/* Chip Used */}
                          {entry.chipUsed && (
                            <div className="text-xs text-text-muted">
                              Quick save: {entry.chipUsed.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}

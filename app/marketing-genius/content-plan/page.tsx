'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'

interface ContentCalendarItem {
  id: string
  topic: string
  keywords: string[]
  excerpt: string | null
  scheduledFor: string
  status: string
  postId: string | null
  post?: {
    id: string
    title: string
    status: string
    publishedAt: string | null
    views: number
    signups: number
  }
  createdAt: string
}

export default function ContentPlanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [calendar, setCalendar] = useState<ContentCalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchCalendar()
    }
  }, [status, router])

  const fetchCalendar = async () => {
    try {
      const res = await fetch('/api/marketing/content-calendar')
      if (res.ok) {
        const data = await res.json()
        setCalendar(data.calendar)
      }
    } catch (error) {
      console.error('Error fetching calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content plan item?')) return

    try {
      const res = await fetch('/api/marketing/content-calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (res.ok) {
        fetchCalendar()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  // Group by week
  const groupByWeek = () => {
    const weeks: Record<string, ContentCalendarItem[]> = {}

    calendar.forEach(item => {
      const date = new Date(item.scheduledFor)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weeks[weekKey]) {
        weeks[weekKey] = []
      }
      weeks[weekKey].push(item)
    })

    return Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0]))
  }

  // Analytics
  const stats = {
    total: calendar.length,
    planned: calendar.filter(i => i.status === 'planned').length,
    generated: calendar.filter(i => i.status === 'generated').length,
    published: calendar.filter(i => i.status === 'published').length,
    totalViews: calendar.reduce((sum, i) => sum + (i.post?.views || 0), 0),
    totalSignups: calendar.reduce((sum, i) => sum + (i.post?.signups || 0), 0)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Loading content plan...</div>
        </div>
      </div>
    )
  }

  const weeklyGroups = groupByWeek()

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header userName={session?.user?.name || ''} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/marketing-genius"
              className="text-firefly-glow hover:text-firefly-dim text-sm mb-2 inline-block"
            >
              ← Back to Marketing Intelligence
            </Link>
            <h1 className="text-4xl font-light text-text-soft mb-3">📅 Content Plan</h1>
            <p className="text-text-muted text-lg">
              Strategic content calendar and publishing schedule
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg transition-soft ${
                view === 'calendar'
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-elevated text-text-muted hover:text-text-soft'
              }`}
            >
              📅 Calendar View
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg transition-soft ${
                view === 'list'
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-elevated text-text-muted hover:text-text-soft'
              }`}
            >
              📋 List View
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
            <div className="text-2xl font-light text-text-soft">{stats.total}</div>
            <div className="text-text-muted text-sm">Total Posts</div>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
            <div className="text-2xl font-light text-yellow-400">{stats.planned}</div>
            <div className="text-text-muted text-sm">Planned</div>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
            <div className="text-2xl font-light text-blue-400">{stats.generated}</div>
            <div className="text-text-muted text-sm">Generated</div>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
            <div className="text-2xl font-light text-green-400">{stats.published}</div>
            <div className="text-text-muted text-sm">Published</div>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
            <div className="text-2xl font-light text-firefly-glow">{stats.totalViews}</div>
            <div className="text-text-muted text-sm">Total Views</div>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
            <div className="text-2xl font-light text-firefly-glow">{stats.totalSignups}</div>
            <div className="text-text-muted text-sm">Signups</div>
          </div>
        </div>

        {/* Empty State */}
        {calendar.length === 0 && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl text-text-soft mb-2">No Content Planned Yet</h3>
            <p className="text-text-muted mb-6">
              Use the <strong>Full Automation</strong> feature in Marketing Intelligence to generate a content plan
            </p>
            <Link
              href="/marketing-genius"
              className="inline-block px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
            >
              Go to Marketing Intelligence
            </Link>
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && calendar.length > 0 && (
          <div className="space-y-8">
            {weeklyGroups.map(([weekStart, items]) => (
              <div key={weekStart} className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
                <h3 className="text-lg text-text-soft font-medium mb-4">
                  📆 Week of {formatWeekRange(weekStart)}
                </h3>

                <div className="space-y-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="bg-bg-dark border border-border-subtle rounded-lg p-4 hover:border-firefly-dim transition-soft"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                              item.status === 'generated' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {item.status === 'published' ? '✅ Published' :
                               item.status === 'generated' ? '📝 Generated' :
                               '📋 Planned'}
                            </span>
                            <span className="text-text-muted text-sm">
                              {formatDate(item.scheduledFor)}
                            </span>
                          </div>

                          <h4 className="text-text-soft font-medium mb-2">
                            {item.post ? item.post.title : item.topic}
                          </h4>

                          {item.excerpt && (
                            <p className="text-text-muted text-sm mb-2">{item.excerpt}</p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {item.keywords.map(keyword => (
                              <span
                                key={keyword}
                                className="px-2 py-1 bg-firefly-dim/10 text-firefly-glow rounded text-xs"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>

                          {item.post && item.status === 'published' && (
                            <div className="mt-3 flex items-center gap-4 text-text-muted text-sm">
                              <span>👁️ {item.post.views} views</span>
                              <span>•</span>
                              <span>✨ {item.post.signups} signups</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {item.status === 'planned' && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-soft"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === 'list' && calendar.length > 0 && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-bg-dark border-b border-border-subtle">
                <tr>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Date</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Topic</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Keywords</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Performance</th>
                  <th className="text-right px-6 py-4 text-text-muted text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calendar.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border-subtle ${
                      index % 2 === 0 ? 'bg-bg-dark' : 'bg-bg-elevated'
                    }`}
                  >
                    <td className="px-6 py-4 text-text-muted text-sm">
                      {formatDate(item.scheduledFor)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-text-soft font-medium">
                        {item.post ? item.post.title : item.topic}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.slice(0, 2).map(keyword => (
                          <span
                            key={keyword}
                            className="px-2 py-0.5 bg-firefly-dim/10 text-firefly-glow rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                        {item.keywords.length > 2 && (
                          <span className="text-text-muted text-xs">
                            +{item.keywords.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'generated' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.post && item.status === 'published' ? (
                        <div className="text-text-muted text-sm">
                          {item.post.views} views / {item.post.signups} signups
                        </div>
                      ) : (
                        <span className="text-text-muted text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'planned' && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

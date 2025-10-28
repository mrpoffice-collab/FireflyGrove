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
    estimatedUsers: number | null
    platform: string
    slug: string | null
  }
  createdAt: string
}

export default function ContentPlanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [calendar, setCalendar] = useState<ContentCalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState<string>('')
  const [platformFilter, setPlatformFilter] = useState<string | null>(null) // Filter by platform

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

  const handleStartEdit = (item: ContentCalendarItem) => {
    setEditingId(item.id)
    setEditDate(new Date(item.scheduledFor).toISOString().split('T')[0])
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditDate('')
  }

  const handleSaveDate = async (postId: string) => {
    try {
      const res = await fetch(`/api/marketing/posts/${postId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledFor: editDate }),
      })

      if (res.ok) {
        alert('📅 Date updated successfully!')
        setEditingId(null)
        setEditDate('')
        fetchCalendar()
      } else {
        alert('Failed to update date')
      }
    } catch (error) {
      console.error('Error updating date:', error)
      alert('Error updating date')
    }
  }

  // Apply platform filter
  const filteredCalendar = platformFilter
    ? calendar.filter(item => item.post?.platform === platformFilter)
    : calendar

  // Group by week
  const groupByWeek = () => {
    const weeks: Record<string, ContentCalendarItem[]> = {}

    filteredCalendar.forEach(item => {
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

  // Analytics (use filtered calendar for display stats)
  const stats = {
    total: filteredCalendar.length,
    approved: filteredCalendar.filter(i => i.status === 'approved' || i.status === 'scheduled').length,
    scheduled: filteredCalendar.filter(i => i.status === 'scheduled').length,
    published: filteredCalendar.filter(i => i.status === 'published').length,
    totalViews: filteredCalendar.reduce((sum, i) => sum + (i.post?.views || 0), 0),
    totalSignups: filteredCalendar.reduce((sum, i) => sum + (i.post?.signups || 0), 0),
    // Platform breakdown (always use full calendar for counts)
    blog: calendar.filter(i => i.post?.platform === 'blog').length,
    facebook: calendar.filter(i => i.post?.platform === 'facebook').length,
    pinterest: calendar.filter(i => i.post?.platform === 'pinterest').length,
    email: calendar.filter(i => i.post?.platform === 'email').length,
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
            <div className="text-2xl font-light text-text-soft">{stats.total}</div>
            <div className="text-text-muted text-sm">Total Scheduled</div>
          </div>
          <div className="bg-bg-elevated border border-green-500/30 rounded-lg p-4">
            <div className="text-2xl font-light text-green-400">{stats.approved}</div>
            <div className="text-text-muted text-sm">Ready to Publish</div>
          </div>
          <div className="bg-bg-elevated border border-blue-500/30 rounded-lg p-4">
            <div className="text-2xl font-light text-blue-400">{stats.published}</div>
            <div className="text-text-muted text-sm">Published</div>
          </div>
          <div className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-4">
            <div className="text-2xl font-light text-firefly-glow">{stats.totalSignups}</div>
            <div className="text-text-muted text-sm">Total Signups</div>
          </div>
        </div>

        {/* Platform Breakdown - Clickable Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg text-text-soft font-medium">Filter by Platform</h3>
            {platformFilter && (
              <button
                onClick={() => setPlatformFilter(null)}
                className="text-sm text-firefly-glow hover:text-firefly-dim"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setPlatformFilter(platformFilter === 'blog' ? null : 'blog')}
              className={`bg-bg-elevated border rounded-lg p-4 text-left transition-soft ${
                platformFilter === 'blog'
                  ? 'border-green-500 ring-2 ring-green-500/30'
                  : 'border-border-subtle hover:border-firefly-dim'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📝</span>
                <div className="text-xl font-light text-text-soft">{stats.blog}</div>
              </div>
              <div className="text-text-muted text-sm">Blog Posts</div>
            </button>
            <button
              onClick={() => setPlatformFilter(platformFilter === 'facebook' ? null : 'facebook')}
              className={`bg-bg-elevated border rounded-lg p-4 text-left transition-soft ${
                platformFilter === 'facebook'
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-border-subtle hover:border-firefly-dim'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">👤</span>
                <div className="text-xl font-light text-text-soft">{stats.facebook}</div>
              </div>
              <div className="text-text-muted text-sm">Facebook Posts</div>
            </button>
            <button
              onClick={() => setPlatformFilter(platformFilter === 'pinterest' ? null : 'pinterest')}
              className={`bg-bg-elevated border rounded-lg p-4 text-left transition-soft ${
                platformFilter === 'pinterest'
                  ? 'border-red-500 ring-2 ring-red-500/30'
                  : 'border-border-subtle hover:border-firefly-dim'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📌</span>
                <div className="text-xl font-light text-text-soft">{stats.pinterest}</div>
              </div>
              <div className="text-text-muted text-sm">Pinterest Pins</div>
            </button>
            <button
              onClick={() => setPlatformFilter(platformFilter === 'email' ? null : 'email')}
              className={`bg-bg-elevated border rounded-lg p-4 text-left transition-soft ${
                platformFilter === 'email'
                  ? 'border-purple-500 ring-2 ring-purple-500/30'
                  : 'border-border-subtle hover:border-firefly-dim'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📧</span>
                <div className="text-xl font-light text-text-soft">{stats.email}</div>
              </div>
              <div className="text-text-muted text-sm">Newsletters</div>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredCalendar.length === 0 && calendar.length > 0 && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-12 text-center">
            <p className="text-text-muted text-lg mb-4">
              No {platformFilter} posts found
            </p>
            <button
              onClick={() => setPlatformFilter(null)}
              className="text-firefly-glow hover:text-firefly-dim text-sm"
            >
              Clear filter to see all posts
            </button>
          </div>
        )}

        {calendar.length === 0 && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl text-text-soft mb-2">No Approved Content Yet</h3>
            <p className="text-text-muted mb-6">
              Generate topics, create content, and approve posts to see them here!
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/marketing-genius/topics"
                className="inline-block px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                🎯 Generate Topics
              </Link>
              <Link
                href="/marketing-genius/drafts"
                className="inline-block px-6 py-3 bg-bg-dark hover:bg-bg-elevated border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
              >
                📝 Review Drafts
              </Link>
            </div>
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
                            {item.post?.platform && (
                              <span className="text-lg">
                                {item.post.platform === 'blog' ? '📝' :
                                 item.post.platform === 'facebook' ? '👤' :
                                 item.post.platform === 'pinterest' ? '📌' :
                                 item.post.platform === 'email' ? '📧' : '📄'}
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {item.status === 'published' ? '✅ Published' : '📅 Scheduled'}
                            </span>

                            {/* Editable Date */}
                            {editingId === item.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="px-2 py-1 bg-bg-dark border border-firefly-dim rounded text-text-soft text-sm"
                                />
                                <button
                                  onClick={() => handleSaveDate(item.postId!)}
                                  className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(item)}
                                disabled={item.status === 'published'}
                                className="text-text-muted text-sm hover:text-firefly-glow disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                📅 {formatDate(item.scheduledFor)}
                              </button>
                            )}
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

                          {item.post?.estimatedUsers && (
                            <div className="mt-2 text-sm">
                              <span className="text-firefly-glow font-medium">📊 Est. Users: {item.post.estimatedUsers}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {item.status !== 'published' && (
                            <Link
                              href="/marketing-genius/drafts"
                              className="px-3 py-1 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow rounded text-sm transition-soft text-center"
                            >
                              View in Drafts
                            </Link>
                          )}
                          {item.status === 'published' && item.post?.platform === 'blog' && item.post?.slug && (
                            <Link
                              href={`/blog/${item.post.slug}`}
                              target="_blank"
                              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm transition-soft text-center"
                            >
                              View Post →
                            </Link>
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
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Platform</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Date</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Topic</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Keywords</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Est. Users</th>
                  <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">Status</th>
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
                    <td className="px-6 py-4">
                      <span className="text-xl">
                        {item.post?.platform === 'blog' ? '📝' :
                         item.post?.platform === 'facebook' ? '👤' :
                         item.post?.platform === 'pinterest' ? '📌' :
                         item.post?.platform === 'email' ? '📧' : '📄'}
                      </span>
                    </td>
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
                      {item.post?.estimatedUsers ? (
                        <span className="text-firefly-glow font-medium text-sm">
                          {item.post.estimatedUsers}
                        </span>
                      ) : (
                        <span className="text-text-muted text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.status === 'published' ? '✅ Published' : '📅 Scheduled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status !== 'published' && (
                        <Link
                          href="/marketing-genius/drafts"
                          className="text-firefly-glow hover:text-firefly-dim text-sm"
                        >
                          Manage
                        </Link>
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

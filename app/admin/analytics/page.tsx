'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'

interface AnalyticsData {
  timeframe: string
  startDate: string
  endDate: string
  summary: {
    totalEvents: number
    activeUsers: number
    errorEvents: number
    abandonedActions: number
  }
  eventsByCategory: Array<{ category: string; count: number }>
  eventsByType: Array<{ eventType: string; count: number }>
  recentEvents: Array<{
    id: string
    userId: string | null
    eventType: string
    category: string
    action: string
    isError: boolean
    isSuccess: boolean
    isAbandoned: boolean
    createdAt: string
  }>
  betaInvites: {
    totalSent: number
    totalSignups: number
    conversionRate: string
    invites: Array<{
      id: string
      email: string
      name: string | null
      sentBy: string | null
      signedUp: boolean
      signedUpAt: string | null
      createdAt: string
    }>
  }
}

// Event label mapping for user-friendly display
const eventLabels: Record<string, string> = {
  // Invite events
  'invite_page_viewed': '👥 Invite Page Viewed',
  'invite_email_clicked': '📧 Email Invite Button Clicked',
  'invite_email_sent': '✅ Email Invite Sent',
  'invite_email_failed': '❌ Email Invite Failed',
  'invite_email_attempted': '⚠️ Email Invite Abandoned',
  'invite_sms_clicked': '📱 SMS Invite Button Clicked',
  'invite_sms_attempted': '⚠️ SMS Invite Abandoned',

  // Branch events
  'branch_created': '🌿 Branch Created',
  'branch_updated': '🌿 Branch Updated',
  'branch_deleted': '🌿 Branch Deleted',

  // Memory events
  'memory_created': '📸 Memory Created',
  'memory_updated': '📸 Memory Updated',
  'memory_deleted': '📸 Memory Deleted',

  // Other common events
  'page_view': '👁️ Page View',
  'user_signup': '✨ User Signup',
  'user_login': '🔐 User Login',
}

// Function to get readable event label
const getEventLabel = (eventType: string): string => {
  return eventLabels[eventType] || eventType
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState('7days')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`)
      if (res.status === 403) {
        router.push('/dashboard')
        return
      }
      if (!res.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Header
          userName={session?.user?.name || ''}
          isBetaTester={(session?.user as any)?.isBetaTester || false}
          isAdmin={(session?.user as any)?.isAdmin || false}
        />
        <div className="min-h-screen text-text-soft flex items-center justify-center">
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Header
          userName={session?.user?.name || ''}
          isBetaTester={(session?.user as any)?.isBetaTester || false}
          isAdmin={(session?.user as any)?.isAdmin || false}
        />
        <div className="min-h-screen text-text-soft flex items-center justify-center">
          <div className="text-center">
            <p className="text-error-text mb-4">Error: {error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-firefly-dim text-bg-dark rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-soft">
      <Header
        userName={session?.user?.name || ''}
        isBetaTester={(session?.user as any)?.isBetaTester || false}
        isAdmin={(session?.user as any)?.isAdmin || false}
      />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-firefly-glow mb-2">Analytics Dashboard</h1>
            <p className="text-text-muted">Privacy-respecting user behavior insights</p>
          </div>

        {/* Timeframe Selector */}
        <div className="mb-6 flex gap-2">
          {['24hours', '7days', '30days', '90days', 'all'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded transition-soft ${
                timeframe === tf
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-elevated text-text-soft hover:bg-bg-elevated/80'
              }`}
            >
              {tf === '24hours' && 'Last 24h'}
              {tf === '7days' && 'Last 7 Days'}
              {tf === '30days' && 'Last 30 Days'}
              {tf === '90days' && 'Last 90 Days'}
              {tf === 'all' && 'All Time'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <p className="text-text-muted text-sm mb-1">Total Events</p>
            <p className="text-3xl text-firefly-glow">{data.summary.totalEvents.toLocaleString()}</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <p className="text-text-muted text-sm mb-1">Active Users</p>
            <p className="text-3xl text-firefly-glow">{data.summary.activeUsers.toLocaleString()}</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <p className="text-text-muted text-sm mb-1">Errors</p>
            <p className="text-3xl text-error-text">{data.summary.errorEvents.toLocaleString()}</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <p className="text-text-muted text-sm mb-1">Abandoned</p>
            <p className="text-3xl text-yellow-400">{data.summary.abandonedActions.toLocaleString()}</p>
          </div>
        </div>

        {/* Beta Invites Section */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl text-text-soft mb-4 flex items-center gap-2">
            <span>📧</span>
            <span>Beta Invites & Signups</span>
          </h2>

          {/* Invite Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-bg-elevated/50 border border-border-subtle rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">Invites Sent</p>
              <p className="text-3xl text-blue-400">{data.betaInvites.totalSent}</p>
            </div>
            <div className="bg-bg-elevated/50 border border-border-subtle rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">Signups</p>
              <p className="text-3xl text-green-400">{data.betaInvites.totalSignups}</p>
            </div>
            <div className="bg-bg-elevated/50 border border-border-subtle rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">Conversion Rate</p>
              <p className="text-3xl text-firefly-glow">{data.betaInvites.conversionRate}%</p>
            </div>
          </div>

          {/* Recent Invites Table */}
          <div className="bg-bg-dark rounded-lg p-4">
            <h3 className="text-lg text-text-soft mb-3">Recent Invites</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border-subtle">
                  <tr className="text-left text-text-muted">
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Sent Date</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Signup Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.betaInvites.invites.map((invite) => (
                    <tr key={invite.id} className="border-b border-border-subtle/50">
                      <td className="py-2 pr-4 text-text-soft">{invite.email}</td>
                      <td className="py-2 pr-4 text-text-muted">{invite.name || '-'}</td>
                      <td className="py-2 pr-4 text-text-muted text-xs">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4">
                        {invite.signedUp ? (
                          <span className="px-2 py-1 bg-green-500/20 text-success-text rounded text-xs">
                            ✓ Signed Up
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-text-muted text-xs">
                        {invite.signedUpAt
                          ? new Date(invite.signedUpAt).toLocaleDateString()
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.betaInvites.invites.length === 0 && (
                <p className="text-center text-text-muted py-4">No invites sent in this timeframe</p>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Events by Category */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <h2 className="text-xl text-text-soft mb-4">Events by Category</h2>
            <div className="space-y-3">
              {data.eventsByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-soft capitalize">{item.category}</span>
                    <span className="text-text-muted">{item.count}</span>
                  </div>
                  <div className="w-full bg-bg-dark rounded-full h-2">
                    <div
                      className="bg-firefly-dim h-2 rounded-full"
                      style={{
                        width: `${(item.count / data.summary.totalEvents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Events */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <h2 className="text-xl text-text-soft mb-4">Top Event Types</h2>
            <div className="space-y-3">
              {data.eventsByType.map((item) => (
                <div key={item.eventType} className="flex justify-between text-sm">
                  <span className="text-text-soft">{getEventLabel(item.eventType)}</span>
                  <span className="text-firefly-glow font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
          <h2 className="text-xl text-text-soft mb-4">Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border-subtle">
                <tr className="text-left text-text-muted">
                  <th className="pb-2 pr-4">Time</th>
                  <th className="pb-2 pr-4">User</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Event</th>
                  <th className="pb-2 pr-4">Action</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEvents.map((event) => (
                  <tr key={event.id} className="border-b border-border-subtle/50">
                    <td className="py-2 pr-4 text-text-muted">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-text-soft font-mono text-xs">
                      {event.userId ? event.userId.slice(-8) : 'anon'}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-1 bg-bg-dark rounded text-xs capitalize">
                        {event.category}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-text-soft">{getEventLabel(event.eventType)}</td>
                    <td className="py-2 pr-4 text-text-muted capitalize">{event.action}</td>
                    <td className="py-2">
                      {event.isError && (
                        <span className="px-2 py-1 bg-red-500/20 text-error-text rounded text-xs">
                          Error
                        </span>
                      )}
                      {event.isAbandoned && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          Abandoned
                        </span>
                      )}
                      {event.isSuccess && !event.isError && !event.isAbandoned && (
                        <span className="px-2 py-1 bg-green-500/20 text-success-text rounded text-xs">
                          Success
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

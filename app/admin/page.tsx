'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface DashboardStats {
  users: {
    total: number
    betaTesters: number
    activeSubscribers: number
    trialUsers: number
  }
  content: {
    totalMemories: number
    totalBranches: number
    publicMemorials: number
    pendingReports: number
  }
  activity: {
    last24h: {
      newUsers: number
      newMemories: number
      errors: number
    }
  }
  betaInvites: {
    totalSent: number
    totalSignups: number
    conversionRate: string
  }
}

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  category: string
  message: string
  count?: number
  action?: { label: string; href: string }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = (session?.user as any)?.isAdmin

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.push('/grove')
    } else if (isAdmin) {
      fetchDashboardData()
    }
  }, [isAdmin, status, router])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header
        userName={session?.user?.name || ''}
        isAdmin={isAdmin}
        isBetaTester={(session?.user as any)?.isBetaTester || false}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-firefly-glow mb-2">
            Admin Dashboard
          </h1>
          <p className="text-text-muted">
            Monitor and manage Firefly Grove
          </p>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-lg font-medium text-text-soft mb-3">🚨 Alerts</h2>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 flex items-start justify-between ${
                  alert.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30'
                    : alert.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                      {alert.category}
                    </span>
                    {alert.count && (
                      <span className="text-xs bg-bg-dark px-2 py-0.5 rounded">
                        {alert.count}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    alert.type === 'error' ? 'text-error-text' :
                    alert.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-300'
                  }`}>
                    {alert.message}
                  </p>
                </div>
                {alert.action && (
                  <button
                    onClick={() => router.push(alert.action!.href)}
                    className="ml-4 px-3 py-1.5 bg-bg-elevated hover:bg-border-subtle text-text-soft text-sm rounded transition-soft"
                  >
                    {alert.action.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-text-soft mb-4">📊 Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Users */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
                <div className="text-text-muted text-sm mb-2">Total Users</div>
                <div className="text-3xl text-firefly-glow font-light mb-3">
                  {stats.users.total.toLocaleString()}
                </div>
                <div className="space-y-1 text-xs text-text-muted">
                  <div className="flex justify-between">
                    <span>Beta Testers</span>
                    <span className="text-blue-400">{stats.users.betaTesters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscribers</span>
                    <span className="text-green-400">{stats.users.activeSubscribers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trial Users</span>
                    <span className="text-yellow-400">{stats.users.trialUsers}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
                <div className="text-text-muted text-sm mb-2">Content</div>
                <div className="text-3xl text-firefly-glow font-light mb-3">
                  {stats.content.totalMemories.toLocaleString()}
                </div>
                <div className="space-y-1 text-xs text-text-muted">
                  <div className="flex justify-between">
                    <span>Memories</span>
                    <span className="text-firefly-glow">{stats.content.totalMemories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Branches</span>
                    <span className="text-text-soft">{stats.content.totalBranches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Public Memorials</span>
                    <span className="text-purple-400">{stats.content.publicMemorials}</span>
                  </div>
                </div>
              </div>

              {/* Activity (24h) */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
                <div className="text-text-muted text-sm mb-2">Last 24 Hours</div>
                <div className="text-3xl text-green-400 font-light mb-3">
                  {stats.activity.last24h.newUsers}
                </div>
                <div className="space-y-1 text-xs text-text-muted">
                  <div className="flex justify-between">
                    <span>New Users</span>
                    <span className="text-green-400">{stats.activity.last24h.newUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Memories</span>
                    <span className="text-blue-400">{stats.activity.last24h.newMemories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors</span>
                    <span className="text-red-400">{stats.activity.last24h.errors}</span>
                  </div>
                </div>
              </div>

              {/* Beta Invites */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
                <div className="text-text-muted text-sm mb-2">Beta Program</div>
                <div className="text-3xl text-purple-400 font-light mb-3">
                  {stats.betaInvites.conversionRate}%
                </div>
                <div className="space-y-1 text-xs text-text-muted">
                  <div className="flex justify-between">
                    <span>Invites Sent</span>
                    <span className="text-blue-400">{stats.betaInvites.totalSent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signups</span>
                    <span className="text-green-400">{stats.betaInvites.totalSignups}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion</span>
                    <span className="text-purple-400">{stats.betaInvites.conversionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users & Community */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/40 transition-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-soft">Users & Community</h3>
                <p className="text-xs text-text-muted">Manage users and invites</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                🔍 User Management
              </button>
              <button
                onClick={() => router.push('/admin/users/beta-invites')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                📧 Beta Invites
              </button>
              <button
                onClick={() => router.push('/admin/users/feature-updates')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                📣 Feature Updates
              </button>
            </div>
          </div>

          {/* Content & Moderation */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/40 transition-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-2xl">
                🛡️
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-soft">Content & Moderation</h3>
                <p className="text-xs text-text-muted">Oversee public content</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/content/reports')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                🚨 Content Reports
                {stats && stats.content.pendingReports > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                    {stats.content.pendingReports}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/admin/content/open-grove')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                🌳 Open Grove ({stats?.content.publicMemorials || 0})
              </button>
            </div>
          </div>

          {/* System & Health */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/40 transition-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-2xl">
                🔧
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-soft">System & Health</h3>
                <p className="text-xs text-text-muted">Monitor performance</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/system/health')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                💚 System Health
                {stats && stats.activity.last24h.errors > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                    {stats.activity.last24h.errors}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                📊 Analytics
              </button>
              <button
                onClick={() => router.push('/admin/system/cleanup')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                🗑️ Cleanup Tools
              </button>
            </div>
          </div>

          {/* Marketing & Growth */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/40 transition-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center text-2xl">
                📈
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-soft">Marketing & Growth</h3>
                <p className="text-xs text-text-muted">Promotional tools</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/marketing/pinterest')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                📌 Pinterest
              </button>
              <button
                onClick={() => router.push('/admin/marketing/screenshots')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                📸 Screenshots
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/40 transition-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-firefly-dim/20 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-soft">Quick Actions</h3>
                <p className="text-xs text-text-muted">Common tasks</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/users/beta-invites')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                💌 Send Beta Invite
              </button>
              <button
                onClick={() => router.push('/admin/users/feature-updates')}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                📢 Send Update Email
              </button>
              <button
                onClick={fetchDashboardData}
                className="w-full text-left px-4 py-2.5 bg-bg-dark hover:bg-border-subtle rounded text-sm text-text-soft transition-soft"
              >
                🔄 Refresh Dashboard
              </button>
            </div>
          </div>

          {/* Legacy & Future */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/40 transition-soft opacity-60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center text-2xl">
                🕯️
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-soft">Legacy Management</h3>
                <p className="text-xs text-text-muted">Coming soon</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="px-4 py-2.5 bg-bg-dark rounded text-sm text-text-muted cursor-not-allowed">
                🎁 Pending Releases
              </div>
              <div className="px-4 py-2.5 bg-bg-dark rounded text-sm text-text-muted cursor-not-allowed">
                👨‍👩‍👧 Heir Relationships
              </div>
              <div className="px-4 py-2.5 bg-bg-dark rounded text-sm text-text-muted cursor-not-allowed">
                🔓 Manual Triggers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

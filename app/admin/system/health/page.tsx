'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'

interface HealthData {
  system: {
    uptime: string
    nodeVersion: string
    platform: string
  }
  database: {
    status: 'connected' | 'disconnected' | 'error'
    responseTime: number
  }
  errors: {
    last24h: number
    last7d: number
    recentErrors: Array<{
      id: string
      eventType: string
      action: string
      createdAt: string
      metadata: any
    }>
  }
  storage: {
    totalEntries: number
    totalBranches: number
    entriesWithMedia: number
  }
}

export default function SystemHealthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const isAdmin = (session?.user as any)?.isAdmin

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.push('/grove')
    } else if (isAdmin) {
      fetchHealth()
    }
  }, [isAdmin, status, router])

  const fetchHealth = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/admin/system/health')
      if (response.ok) {
        const data = await response.json()
        setHealth(data)
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-text-muted">Loading system health...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const getHealthStatus = () => {
    if (!health) return { color: 'gray', label: 'Unknown', emoji: '❓' }

    if (health.errors.last24h > 50) return { color: 'red', label: 'Critical', emoji: '🔴' }
    if (health.errors.last24h > 10) return { color: 'yellow', label: 'Warning', emoji: '🟡' }
    if (health.database.status === 'error') return { color: 'red', label: 'Database Error', emoji: '🔴' }
    return { color: 'green', label: 'Healthy', emoji: '🟢' }
  }

  const healthStatus = getHealthStatus()

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header
        userName={session?.user?.name || ''}
        isAdmin={isAdmin}
        isBetaTester={(session?.user as any)?.isBetaTester || false}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-text-muted">
          <Link href="/admin" className="hover:text-firefly-glow transition-soft">Admin</Link>
          <span className="mx-2">/</span>
          <span>System & Health</span>
          <span className="mx-2">/</span>
          <span className="text-text-soft">System Health</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-firefly-glow mb-2">
              System Health
            </h1>
            <p className="text-text-muted">
              Monitor system performance, errors, and database health
            </p>
          </div>
          <button
            onClick={fetchHealth}
            disabled={refreshing}
            className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow disabled:bg-gray-600 text-bg-dark rounded transition-soft flex items-center gap-2"
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {health && (
          <>
            {/* Overall Status Banner */}
            <div className={`mb-8 p-6 rounded-lg border-2 ${
              healthStatus.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
              healthStatus.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{healthStatus.emoji}</span>
                <div>
                  <h2 className={`text-2xl font-medium ${
                    healthStatus.color === 'green' ? 'text-green-400' :
                    healthStatus.color === 'yellow' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    System Status: {healthStatus.label}
                  </h2>
                  <p className="text-text-muted text-sm mt-1">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* System Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* System Info */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
                <h3 className="text-lg font-medium text-text-soft mb-4 flex items-center gap-2">
                  <span>💻</span>
                  System Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Uptime:</span>
                    <span className="text-text-soft font-mono">{health.system.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Node Version:</span>
                    <span className="text-text-soft font-mono">{health.system.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Platform:</span>
                    <span className="text-text-soft font-mono">{health.system.platform}</span>
                  </div>
                </div>
              </div>

              {/* Database Health */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
                <h3 className="text-lg font-medium text-text-soft mb-4 flex items-center gap-2">
                  <span>🗄️</span>
                  Database
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      health.database.status === 'connected'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {health.database.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Response Time:</span>
                    <span className={`text-text-soft font-mono ${
                      health.database.responseTime > 500 ? 'text-red-400' :
                      health.database.responseTime > 200 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {health.database.responseTime}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Stats */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
                <h3 className="text-lg font-medium text-text-soft mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  Errors
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Last 24 Hours:</span>
                    <span className={`text-2xl font-bold ${
                      health.errors.last24h > 50 ? 'text-red-400' :
                      health.errors.last24h > 10 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {health.errors.last24h}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Last 7 Days:</span>
                    <span className="text-text-soft font-mono">{health.errors.last7d}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Stats */}
            <div className="mb-8 bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-soft mb-4 flex items-center gap-2">
                <span>📦</span>
                Storage & Content
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl text-firefly-glow font-light mb-1">
                    {health.storage.totalBranches.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-muted">Total Branches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl text-firefly-glow font-light mb-1">
                    {health.storage.totalEntries.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-muted">Total Memories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl text-firefly-glow font-light mb-1">
                    {health.storage.entriesWithMedia.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-muted">With Media</div>
                </div>
              </div>
            </div>

            {/* Recent Errors */}
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-soft mb-4 flex items-center gap-2">
                <span>🔍</span>
                Recent Errors ({health.errors.recentErrors.length})
              </h3>

              {health.errors.recentErrors.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <div className="text-4xl mb-3">✨</div>
                  <p>No recent errors - system is running smoothly!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {health.errors.recentErrors.map((error) => (
                    <div
                      key={error.id}
                      className="bg-bg-dark border border-red-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-error-text mb-1">
                            {error.eventType}
                          </div>
                          <div className="text-xs text-text-muted">
                            Action: {error.action}
                          </div>
                        </div>
                        <div className="text-xs text-text-muted">
                          {new Date(error.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {error.metadata && (
                        <details className="mt-2">
                          <summary className="text-xs text-text-muted cursor-pointer hover:text-text-soft">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-bg-elevated rounded text-xs text-text-soft overflow-x-auto">
                            {JSON.stringify(error.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

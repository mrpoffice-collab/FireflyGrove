'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

interface TopicPerformance {
  id: string
  topic: string
  confidenceScore: number
  relevanceScore: number
  demandScore: number
  estimatedUsers: number | null
  actualUsers: number | null
  status: string
  publishedAt: Date | null
  post: {
    id: string
    title: string
    platform: string
    status: string
    publishedAt: Date | null
  } | null
  variance: number | null
}

interface PerformanceData {
  overview: {
    totalTopics: number
    published: number
    drafted: number
    estimatedUsers: number
    actualUsers: number
    accuracy: number | null
    trackedTopics: number
  }
  byPlatform: Record<string, {
    count: number
    estimatedUsers: number
    actualUsers: number
  }>
  topPerformers: Array<{
    topic: string
    estimated: number
    actual: number
    variance: number
  }>
  topics: TopicPerformance[]
}

export default function PerformancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PerformanceData | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/marketing/content-performance')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (topicId: string, currentValue: number | null) => {
    setEditingId(topicId)
    setEditValue(currentValue !== null ? currentValue.toString() : '0')
  }

  const saveEdit = async (topicId: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/marketing/content-performance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          actualUsers: parseInt(editValue),
        }),
      })

      if (res.ok) {
        setEditingId(null)
        setEditValue('')
        fetchData()
      } else {
        alert('Failed to update')
      }
    } catch (error) {
      console.error('Error updating:', error)
      alert('Error updating')
    } finally {
      setUpdating(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const getVarianceColor = (variance: number | null) => {
    if (variance === null) return 'text-text-muted'
    if (variance > 20) return 'text-green-400' // Beat estimate by 20%+
    if (variance > 0) return 'text-green-300' // Beat estimate
    if (variance > -20) return 'text-yellow-400' // Within 20%
    return 'text-red-400' // Missed by 20%+
  }

  const getVarianceLabel = (variance: number | null) => {
    if (variance === null) return 'Not tracked'
    if (variance > 0) return `+${variance}%`
    return `${variance}%`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Loading performance data...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">No performance data available</div>
        </div>
      </div>
    )
  }

  const platformEntries = Object.entries(data.byPlatform)

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header userName={session?.user?.name || ''} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketing-genius"
            className="text-firefly-glow hover:text-firefly-dim text-sm mb-2 inline-block"
          >
            ← Back to Marketing Intelligence
          </Link>
          <h1 className="text-4xl font-light text-text-soft mb-3">
            📊 Content Performance Tracking
          </h1>
          <p className="text-text-muted text-lg">
            Estimated vs Actual User Acquisition
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Total Topics</div>
            <div className="text-3xl font-light text-firefly-glow">
              {data.overview.totalTopics}
            </div>
            <div className="text-text-muted text-xs">
              {data.overview.published} published, {data.overview.drafted} drafted
            </div>
          </div>

          <div className="bg-bg-elevated border border-blue-500/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Estimated Users</div>
            <div className="text-3xl font-light text-blue-400">
              {data.overview.estimatedUsers}
            </div>
            <div className="text-text-muted text-xs">Projected signups</div>
          </div>

          <div className="bg-bg-elevated border border-green-500/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Actual Users</div>
            <div className="text-3xl font-light text-green-400">
              {data.overview.actualUsers}
            </div>
            <div className="text-text-muted text-xs">
              {data.overview.trackedTopics} topics tracked
            </div>
          </div>

          <div className="bg-bg-elevated border border-purple-500/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Accuracy</div>
            <div className="text-3xl font-light text-purple-400">
              {data.overview.accuracy !== null ? `${data.overview.accuracy}%` : 'N/A'}
            </div>
            <div className="text-text-muted text-xs">Estimation accuracy</div>
          </div>
        </div>

        {/* Performance by Platform */}
        {platformEntries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-text-soft mb-4">
              Performance by Platform
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platformEntries.map(([platform, stats]) => (
                <div
                  key={platform}
                  className="bg-bg-elevated border border-border-subtle rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-text-soft capitalize">
                      {platform}
                    </h3>
                    <span className="text-sm text-text-muted">{stats.count} posts</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Estimated:</span>
                      <span className="text-blue-400">{stats.estimatedUsers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Actual:</span>
                      <span className="text-green-400">{stats.actualUsers}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-text-muted">Variance:</span>
                      <span
                        className={
                          stats.actualUsers > stats.estimatedUsers
                            ? 'text-green-400'
                            : 'text-yellow-400'
                        }
                      >
                        {stats.estimatedUsers > 0
                          ? `${Math.round(((stats.actualUsers - stats.estimatedUsers) / stats.estimatedUsers) * 100)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performers */}
        {data.topPerformers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-text-soft mb-4">
              🏆 Top Performers
            </h2>
            <div className="bg-bg-elevated border border-green-500/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-green-500/10">
                  <tr className="text-left text-sm text-text-muted">
                    <th className="p-4">Topic</th>
                    <th className="p-4 text-right">Estimated</th>
                    <th className="p-4 text-right">Actual</th>
                    <th className="p-4 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPerformers.map((topic, i) => (
                    <tr key={i} className="border-t border-border-subtle">
                      <td className="p-4 text-text-soft">{topic.topic}</td>
                      <td className="p-4 text-right text-blue-400">{topic.estimated}</td>
                      <td className="p-4 text-right text-green-400">{topic.actual}</td>
                      <td className={`p-4 text-right font-medium ${getVarianceColor(topic.variance)}`}>
                        {getVarianceLabel(topic.variance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Topics */}
        <div className="mb-8">
          <h2 className="text-2xl font-light text-text-soft mb-4">
            All Topics
          </h2>
          <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-dark">
                  <tr className="text-left text-sm text-text-muted">
                    <th className="p-4">Topic</th>
                    <th className="p-4">Post</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-right">Estimated</th>
                    <th className="p-4 text-right">Actual</th>
                    <th className="p-4 text-right">Variance</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topics.map((topic) => (
                    <tr key={topic.id} className="border-t border-border-subtle hover:bg-bg-dark/30">
                      <td className="p-4">
                        <div className="text-text-soft font-medium">{topic.topic}</div>
                        <div className="text-xs text-text-muted">
                          R:{topic.relevanceScore} D:{topic.demandScore}
                        </div>
                      </td>
                      <td className="p-4">
                        {topic.post ? (
                          <div>
                            <div className="text-sm text-text-soft">{topic.post.title.substring(0, 40)}...</div>
                            <div className="text-xs text-text-muted capitalize">{topic.post.platform}</div>
                          </div>
                        ) : (
                          <span className="text-text-muted text-sm">No post</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${
                          topic.confidenceScore >= 70
                            ? 'bg-green-500/20 text-green-400'
                            : topic.confidenceScore >= 50
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {topic.confidenceScore}
                        </span>
                      </td>
                      <td className="p-4 text-right text-blue-400">
                        {topic.estimatedUsers || 0}
                      </td>
                      <td className="p-4 text-right">
                        {editingId === topic.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 px-2 py-1 bg-bg-dark border border-firefly-dim rounded text-text-soft text-sm text-right"
                              min="0"
                            />
                            <button
                              onClick={() => saveEdit(topic.id)}
                              disabled={updating}
                              className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(topic.id, topic.actualUsers)}
                            className="text-green-400 hover:text-green-300"
                          >
                            {topic.actualUsers !== null ? topic.actualUsers : '—'}
                          </button>
                        )}
                      </td>
                      <td className={`p-4 text-right font-medium ${getVarianceColor(topic.variance)}`}>
                        {getVarianceLabel(topic.variance)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          topic.status === 'published'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {topic.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-400 mb-2">
            💡 How to Use This Dashboard
          </h3>
          <ul className="text-text-muted space-y-2 text-sm">
            <li>• <strong>Estimated Users:</strong> AI prediction based on topic score</li>
            <li>• <strong>Actual Users:</strong> Click the number to edit (track real signups manually)</li>
            <li>• <strong>Variance:</strong> Green = beat estimate, Yellow = close, Red = missed</li>
            <li>• <strong>Accuracy:</strong> How well estimates match reality (improves over time)</li>
            <li>• <strong>Score:</strong> Confidence score (70+ = high value content)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

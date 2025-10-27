'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

interface DraftPost {
  id: string
  platform: string
  postType: string
  title: string
  content: string
  excerpt: string | null
  status: string
  scheduledFor: string | null
  isApproved: boolean
  approvedAt: string | null
  approvedBy: string | null
  slug: string | null
  keywords: string[]
  topic: string | null
  subreddit: string | null
  pinDescription: string | null
  createdAt: string
}

export default function DraftsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [drafts, setDrafts] = useState<DraftPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchDrafts()
    }
  }, [status, router])

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/marketing/drafts')
      if (res.ok) {
        const data = await res.json()
        setDrafts(data.drafts)
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (postId: string) => {
    const newSelection = new Set(selectedPosts)
    if (newSelection.has(postId)) {
      newSelection.delete(postId)
    } else {
      newSelection.add(postId)
    }
    setSelectedPosts(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedPosts.size === drafts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(drafts.map((d) => d.id)))
    }
  }

  const approvePosts = async (postIds: string[]) => {
    setApproving(true)
    try {
      const res = await fetch('/api/marketing/drafts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postIds }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ ${data.approved} post(s) approved!`)
        fetchDrafts()
        setSelectedPosts(new Set())
      } else {
        alert('Failed to approve posts')
      }
    } catch (error) {
      console.error('Error approving posts:', error)
      alert('Error approving posts')
    } finally {
      setApproving(false)
    }
  }

  const approveSelected = () => {
    if (selectedPosts.size === 0) {
      alert('No posts selected')
      return
    }

    if (confirm(`Approve ${selectedPosts.size} selected post(s)?`)) {
      approvePosts(Array.from(selectedPosts))
    }
  }

  const approveSingle = (postId: string) => {
    approvePosts([postId])
  }

  const unapproveSingle = async (postId: string) => {
    try {
      const res = await fetch('/api/marketing/drafts/unapprove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (res.ok) {
        fetchDrafts()
      } else {
        alert('Failed to unapprove post')
      }
    } catch (error) {
      console.error('Error unapproving post:', error)
      alert('Error unapprove post')
    }
  }

  const deletePosts = async (postIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${postIds.length} post(s)? This cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch('/api/marketing/drafts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postIds }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`🗑️ ${data.deleted} post(s) deleted!`)
        fetchDrafts()
        setSelectedPosts(new Set())
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete posts')
      }
    } catch (error) {
      console.error('Error deleting posts:', error)
      alert('Error deleting posts')
    }
  }

  const deleteSelected = () => {
    if (selectedPosts.size === 0) {
      alert('No posts selected')
      return
    }

    deletePosts(Array.from(selectedPosts))
  }

  const deleteSingle = (postId: string) => {
    deletePosts([postId])
  }

  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case 'blog': return '📝'
      case 'facebook': return '👤'
      case 'pinterest': return '📌'
      case 'reddit': return '💬'
      case 'email': return '📧'
      default: return '📄'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'blog': return 'border-green-500/30 bg-green-500/10'
      case 'facebook': return 'border-blue-500/30 bg-blue-500/10'
      case 'pinterest': return 'border-red-500/30 bg-red-500/10'
      case 'reddit': return 'border-orange-500/30 bg-orange-500/10'
      case 'email': return 'border-purple-500/30 bg-purple-500/10'
      default: return 'border-border-subtle bg-bg-elevated'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Loading drafts...</div>
        </div>
      </div>
    )
  }

  const approvedDrafts = drafts.filter((d) => d.isApproved)
  const unapprovedDrafts = drafts.filter((d) => !d.isApproved)

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
            📝 Draft Posts Review
          </h1>
          <p className="text-text-muted text-lg">
            Review and approve content for auto-publishing
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-elevated border border-yellow-500/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Awaiting Review</div>
            <div className="text-3xl font-light text-yellow-400">
              {unapprovedDrafts.length}
            </div>
            <div className="text-text-muted text-xs">Need approval</div>
          </div>
          <div className="bg-bg-elevated border border-green-500/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Approved</div>
            <div className="text-3xl font-light text-green-400">
              {approvedDrafts.length}
            </div>
            <div className="text-text-muted text-xs">Ready to publish</div>
          </div>
          <div className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Total Drafts</div>
            <div className="text-3xl font-light text-firefly-glow">
              {drafts.length}
            </div>
            <div className="text-text-muted text-xs">All posts</div>
          </div>
        </div>

        {/* SECTION 1: Awaiting Review */}
        {unapprovedDrafts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-light text-text-soft mb-6">
              📋 Awaiting Review ({unapprovedDrafts.length})
            </h2>

            {/* Bulk Actions for Unapproved */}
            <div className="mb-6 bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedPosts.size === unapprovedDrafts.length && unapprovedDrafts.length > 0}
                    onChange={() => {
                      if (selectedPosts.size === unapprovedDrafts.length) {
                        setSelectedPosts(new Set())
                      } else {
                        setSelectedPosts(new Set(unapprovedDrafts.map((d) => d.id)))
                      }
                    }}
                    className="w-5 h-5 rounded border-border-subtle bg-bg-dark"
                  />
                  <div>
                    <h3 className="text-lg text-text-soft font-medium">
                      {selectedPosts.size === 0
                        ? 'Select posts to approve or delete'
                        : `${selectedPosts.size} selected`}
                    </h3>
                  </div>
                </div>
                {selectedPosts.size > 0 && (
                  <div className="flex gap-3">
                    <button
                      onClick={approveSelected}
                      disabled={approving}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-soft"
                    >
                      {approving ? 'Approving...' : `✅ Approve ${selectedPosts.size}`}
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-soft"
                    >
                      🗑️ Delete {selectedPosts.size}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Unapproved Posts List */}
            <div className="space-y-4">
              {unapprovedDrafts.map((post) => (
              <div
                key={post.id}
                className={`border rounded-xl p-6 transition-soft ${getPlatformColor(post.platform)} ${
                  post.isApproved ? 'border-green-500/50' : ''
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <input
                    type="checkbox"
                    checked={selectedPosts.has(post.id)}
                    onChange={() => toggleSelection(post.id)}
                    className="mt-1 w-5 h-5 rounded border-border-subtle bg-bg-dark"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getPlatformEmoji(post.platform)}</span>
                      <span className="text-xs uppercase font-medium text-text-muted">
                        {post.platform}
                      </span>
                      {post.isApproved && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          ✅ Approved
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-medium text-text-soft mb-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-text-muted text-sm mb-3">
                        {post.excerpt.substring(0, 200)}...
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 text-sm text-text-muted mb-3">
                      {post.scheduledFor && (
                        <span>📅 Scheduled: {new Date(post.scheduledFor).toLocaleDateString()}</span>
                      )}
                      {post.topic && <span>🎯 Topic: {post.topic}</span>}
                      {post.subreddit && <span>📍 r/{post.subreddit}</span>}
                      {post.keywords.length > 0 && (
                        <span>🔑 {post.keywords.slice(0, 3).join(', ')}</span>
                      )}
                    </div>

                    {/* Preview Toggle */}
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-sm text-firefly-glow hover:text-firefly-dim"
                    >
                      {expandedPost === post.id ? '▼ Hide content' : '▶ Show content'}
                    </button>

                    {/* Expanded Content */}
                    {expandedPost === post.id && (
                      <div className="mt-4 p-4 bg-bg-dark rounded-lg border border-border-subtle">
                        <pre className="text-text-soft text-sm whitespace-pre-wrap font-sans">
                          {post.content}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!post.isApproved ? (
                      <button
                        onClick={() => approveSingle(post.id)}
                        disabled={approving}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                      >
                        ✅ Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => unapproveSingle(post.id)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-soft"
                      >
                        ↩️ Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => deleteSingle(post.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-soft"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: Approved & Ready to Publish */}
        {approvedDrafts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-light text-green-400 mb-6">
              ✅ Approved & Ready to Publish ({approvedDrafts.length})
            </h2>
            <p className="text-text-muted mb-6">
              These posts will auto-publish on their scheduled dates. Great work! 🎉
            </p>

            {/* Approved Posts List */}
            <div className="space-y-4">
              {approvedDrafts.map((post) => (
                <div
                  key={post.id}
                  className={`border border-green-500/50 rounded-xl p-6 transition-soft ${getPlatformColor(post.platform)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getPlatformEmoji(post.platform)}</span>
                        <span className="text-xs uppercase font-medium text-text-muted">
                          {post.platform}
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          ✅ Approved
                        </span>
                      </div>
                      <h3 className="text-xl font-medium text-text-soft mb-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-text-muted text-sm mb-3">
                          {post.excerpt.substring(0, 200)}...
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-3 text-sm text-text-muted mb-3">
                        {post.scheduledFor && (
                          <span className="text-green-400">
                            📅 Publishing: {new Date(post.scheduledFor).toLocaleDateString()}
                          </span>
                        )}
                        {post.topic && <span>🎯 Topic: {post.topic}</span>}
                        {post.keywords.length > 0 && (
                          <span>🔑 {post.keywords.slice(0, 3).join(', ')}</span>
                        )}
                      </div>

                      {/* Preview Toggle */}
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="text-sm text-firefly-glow hover:text-firefly-dim"
                      >
                        {expandedPost === post.id ? '▼ Hide content' : '▶ Show content'}
                      </button>

                      {/* Expanded Content */}
                      {expandedPost === post.id && (
                        <div className="mt-4 p-4 bg-bg-dark rounded-lg border border-border-subtle">
                          <pre className="text-text-soft text-sm whitespace-pre-wrap font-sans">
                            {post.content}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => unapproveSingle(post.id)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-soft"
                      >
                        ↩️ Unapprove
                      </button>
                      <button
                        onClick={() => deleteSingle(post.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-soft"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {drafts.length === 0 && (
          <div className="text-center py-12 bg-bg-elevated rounded-xl border border-border-subtle">
            <p className="text-text-muted">
              No draft posts yet. Generate content from topics to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

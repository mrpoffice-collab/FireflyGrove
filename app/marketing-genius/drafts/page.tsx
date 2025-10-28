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
  estimatedUsers: number | null
  pinDescription: string | null
  image: string | null
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
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState<string>('')
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editImage, setEditImage] = useState<string>('')
  const [publishing, setPublishing] = useState(false)
  const [fixingImages, setFixingImages] = useState(false)
  const [postingToFacebook, setPostingToFacebook] = useState(false)
  const [generatingVideo, setGeneratingVideo] = useState(false)
  const [videoPreview, setVideoPreview] = useState<{
    postId: string
    script: string
    scriptBreakdown: { hook: string; keyPoints: string[]; cta: string }
    audioUrl: string
    metadata: any
  } | null>(null)

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

    // Ask about auto-filling gaps
    const autoFillGaps = confirm(
      `Auto-fill gaps in the schedule?\n\n` +
      `YES = Remaining posts will be rescheduled evenly (2 days apart)\n` +
      `NO = Keep existing schedule dates`
    )

    try {
      const res = await fetch('/api/marketing/drafts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postIds, autoFillGaps }),
      })

      if (res.ok) {
        const data = await res.json()
        const message = data.rescheduled
          ? `🗑️ ${data.deleted} post(s) deleted!\n📅 Remaining posts rescheduled to fill gaps.`
          : `🗑️ ${data.deleted} post(s) deleted!`
        alert(message)
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

  const publishNow = async (postId: string) => {
    if (!confirm('Publish this blog post now? It will be published immediately to /blog.')) {
      return
    }

    setPublishing(true)
    try {
      const res = await fetch(`/api/marketing/posts/${postId}/publish`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Published! View at: ${data.url}`)
        fetchDrafts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to publish')
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      alert('Error publishing post')
    } finally {
      setPublishing(false)
    }
  }

  const postToFacebook = async (postId: string) => {
    if (!confirm('Post this to your Facebook Page now? It will be visible immediately.')) {
      return
    }

    setPostingToFacebook(true)
    try {
      const res = await fetch('/api/marketing/posts/publish-to-facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Posted to Facebook!\n\nView at: ${data.postUrl}`)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to post to Facebook')
      }
    } catch (error) {
      console.error('Error posting to Facebook:', error)
      alert('Error posting to Facebook')
    } finally {
      setPostingToFacebook(false)
    }
  }

  const generateMarketingVideo = async (postId: string) => {
    setGeneratingVideo(true)
    try {
      const res = await fetch('/api/marketing/posts/generate-marketing-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, voice: 'nova' }),
      })

      if (res.ok) {
        const data = await res.json()

        // Convert base64 audio to blob URL
        const audioBlob = await fetch(
          `data:audio/mp3;base64,${data.video.voiceOver.audio}`
        ).then((r) => r.blob())
        const audioUrl = URL.createObjectURL(audioBlob)

        setVideoPreview({
          postId,
          script: data.video.script,
          scriptBreakdown: data.video.scriptBreakdown,
          audioUrl,
          metadata: data.video.metadata,
        })
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to generate marketing video')
      }
    } catch (error) {
      console.error('Error generating marketing video:', error)
      alert('Error generating marketing video')
    } finally {
      setGeneratingVideo(false)
    }
  }

  const closeVideoPreview = () => {
    if (videoPreview?.audioUrl) {
      URL.revokeObjectURL(videoPreview.audioUrl)
    }
    setVideoPreview(null)
  }

  const downloadAudio = () => {
    if (!videoPreview) return
    const a = document.createElement('a')
    a.href = videoPreview.audioUrl
    a.download = `${videoPreview.metadata.title.replace(/[^a-z0-9]/gi, '-')}-voiceover.mp3`
    a.click()
  }

  const startEditDate = (post: DraftPost) => {
    setEditingDateId(post.id)
    setEditDate(post.scheduledFor ? new Date(post.scheduledFor).toISOString().split('T')[0] : '')
  }

  const saveDate = async (postId: string) => {
    try {
      const res = await fetch(`/api/marketing/posts/${postId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledFor: editDate }),
      })

      if (res.ok) {
        alert('📅 Date updated successfully!')
        setEditingDateId(null)
        setEditDate('')
        fetchDrafts()
      } else {
        alert('Failed to update date')
      }
    } catch (error) {
      console.error('Error updating date:', error)
      alert('Error updating date')
    }
  }

  const cancelEditDate = () => {
    setEditingDateId(null)
    setEditDate('')
  }

  const startEditImage = (post: DraftPost) => {
    setEditingImageId(post.id)
    setEditImage(post.image || '')
  }

  const saveImage = async (postId: string) => {
    try {
      const res = await fetch(`/api/marketing/posts/${postId}/update-image`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: editImage }),
      })

      if (res.ok) {
        alert('🖼️ Image updated successfully!')
        setEditingImageId(null)
        setEditImage('')
        fetchDrafts()
      } else {
        alert('Failed to update image')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Error updating image')
    }
  }

  const cancelEditImage = () => {
    setEditingImageId(null)
    setEditImage('')
  }

  const fixMissingImages = async () => {
    if (!confirm('Add images to all posts that are missing them? This will use keyword-based Unsplash images.')) {
      return
    }

    setFixingImages(true)
    try {
      const res = await fetch('/api/marketing/posts/fix-missing-images', {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Success! Updated ${data.updated} posts with images.`)
        fetchDrafts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to fix images')
      }
    } catch (error) {
      console.error('Error fixing images:', error)
      alert('Error fixing images')
    } finally {
      setFixingImages(false)
    }
  }

  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case 'blog': return '📝'
      case 'facebook': return '👤'
      case 'pinterest': return '📌'
      case 'email': return '📧'
      default: return '📄'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'blog': return 'border-green-500/30 bg-green-500/10'
      case 'facebook': return 'border-blue-500/30 bg-blue-500/10'
      case 'pinterest': return 'border-red-500/30 bg-red-500/10'
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

          {/* Fix Missing Images Button */}
          <button
            onClick={fixMissingImages}
            disabled={fixingImages}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
          >
            {fixingImages ? '⏳ Adding images...' : '🖼️ Fix Missing Images'}
          </button>
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
                        <div className="flex items-center gap-2">
                          {editingDateId === post.id ? (
                            <>
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="px-2 py-1 bg-bg-dark border border-firefly-dim rounded text-text-soft text-xs"
                              />
                              <button
                                onClick={() => saveDate(post.id)}
                                className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditDate}
                                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditDate(post)}
                              className="hover:text-firefly-glow transition-soft"
                            >
                              📅 Scheduled: {new Date(post.scheduledFor).toLocaleDateString()}
                            </button>
                          )}
                        </div>
                      )}
                      {/* Image editor for blog posts */}
                      {post.platform === 'blog' && (
                        <div className="flex items-center gap-2">
                          {editingImageId === post.id ? (
                            <>
                              <input
                                type="text"
                                value={editImage}
                                onChange={(e) => setEditImage(e.target.value)}
                                placeholder="Image URL (Unsplash, etc.)"
                                className="flex-1 px-2 py-1 bg-bg-dark border border-firefly-dim rounded text-text-soft text-xs"
                              />
                              <button
                                onClick={() => saveImage(post.id)}
                                className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditImage}
                                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditImage(post)}
                              className="hover:text-firefly-glow transition-soft text-xs"
                            >
                              🖼️ Image: {post.image ? '✓ Set' : '⚠️ Missing - Click to add'}
                            </button>
                          )}
                        </div>
                      )}
                      {post.topic && <span>🎯 Topic: {post.topic}</span>}
                      {post.estimatedUsers && (
                        <span className="text-firefly-glow font-medium">📊 Est. Users: {post.estimatedUsers}</span>
                      )}
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

                    {/* Share Buttons for Social Posts */}
                    {post.platform === 'facebook' && post.isApproved && (
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://fireflygrove.app')}&quote=${encodeURIComponent(post.content.substring(0, 500))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#1877f2] hover:bg-[#0c63d4] text-white rounded-lg text-sm font-medium transition-soft text-center"
                        title="Note: Facebook can't show custom images from drafts. Publish the blog post first for image preview."
                      >
                        📤 Share to FB
                      </a>
                    )}

                    {post.platform === 'pinterest' && post.isApproved && (
                      <a
                        href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent('https://fireflygrove.app')}&media=${encodeURIComponent(post.image || '')}&description=${encodeURIComponent(post.content.substring(0, 500))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#e60023] hover:bg-[#c2001d] text-white rounded-lg text-sm font-medium transition-soft text-center"
                      >
                        📤 Share to Pinterest
                      </a>
                    )}

                    {/* Publish Now button for blog posts */}
                    {post.platform === 'blog' && post.isApproved && (
                      <>
                        <button
                          onClick={() => publishNow(post.id)}
                          disabled={publishing}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                        >
                          {publishing ? 'Publishing...' : '🚀 Publish Now'}
                        </button>
                        <button
                          onClick={() => generateMarketingVideo(post.id)}
                          disabled={generatingVideo}
                          className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                        >
                          {generatingVideo ? '⏳ Generating...' : '🎬 Generate Video'}
                        </button>
                        <button
                          onClick={() => postToFacebook(post.id)}
                          disabled={postingToFacebook}
                          className="px-4 py-2 bg-[#1877f2] hover:bg-[#0c63d4] disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                        >
                          {postingToFacebook ? 'Posting...' : '📘 Post to FB'}
                        </button>
                      </>
                    )}

                    {/* Post to Facebook button for Facebook posts */}
                    {post.platform === 'facebook' && post.isApproved && (
                      <button
                        onClick={() => postToFacebook(post.id)}
                        disabled={postingToFacebook}
                        className="px-4 py-2 bg-[#1877f2] hover:bg-[#0c63d4] disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                      >
                        {postingToFacebook ? 'Posting...' : '📘 Post to FB'}
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
                          <div className="flex items-center gap-2">
                            {editingDateId === post.id ? (
                              <>
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="px-2 py-1 bg-bg-dark border border-firefly-dim rounded text-text-soft text-xs"
                                />
                                <button
                                  onClick={() => saveDate(post.id)}
                                  className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditDate}
                                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditDate(post)}
                                className="text-green-400 hover:text-firefly-glow transition-soft"
                              >
                                📅 Publishing: {new Date(post.scheduledFor).toLocaleDateString()}
                              </button>
                            )}
                          </div>
                        )}
                        {post.topic && <span>🎯 Topic: {post.topic}</span>}
                        {post.estimatedUsers && (
                          <span className="text-firefly-glow font-medium">📊 Est. Users: {post.estimatedUsers}</span>
                        )}
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
                      {/* Share Buttons for Social Posts */}
                      {post.platform === 'facebook' && (
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://fireflygrove.app')}&quote=${encodeURIComponent(post.content.substring(0, 500))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#1877f2] hover:bg-[#0c63d4] text-white rounded-lg text-sm font-medium transition-soft text-center"
                          title="Note: Facebook can't show custom images from drafts. Publish the blog post first for image preview."
                        >
                          📤 Share to FB
                        </a>
                      )}

                      {post.platform === 'pinterest' && (
                        <a
                          href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent('https://fireflygrove.app')}&media=${encodeURIComponent(post.image || '')}&description=${encodeURIComponent(post.content.substring(0, 500))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#e60023] hover:bg-[#c2001d] text-white rounded-lg text-sm font-medium transition-soft text-center"
                        >
                          📤 Share to Pinterest
                        </a>
                      )}

                      {/* Publish Now button for blog posts */}
                      {post.platform === 'blog' && (
                        <>
                          <button
                            onClick={() => publishNow(post.id)}
                            disabled={publishing}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                          >
                            {publishing ? 'Publishing...' : '🚀 Publish Now'}
                          </button>
                          <button
                            onClick={() => generateMarketingVideo(post.id)}
                            disabled={generatingVideo}
                            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                          >
                            {generatingVideo ? '⏳ Generating...' : '🎬 Generate Video'}
                          </button>
                          <button
                            onClick={() => postToFacebook(post.id)}
                            disabled={postingToFacebook}
                            className="px-4 py-2 bg-[#1877f2] hover:bg-[#0c63d4] disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                          >
                            {postingToFacebook ? 'Posting...' : '📘 Post to FB'}
                          </button>
                        </>
                      )}

                      {/* Post to Facebook button for Facebook posts */}
                      {post.platform === 'facebook' && (
                        <button
                          onClick={() => postToFacebook(post.id)}
                          disabled={postingToFacebook}
                          className="px-4 py-2 bg-[#1877f2] hover:bg-[#0c63d4] disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-soft"
                        >
                          {postingToFacebook ? 'Posting...' : '📘 Post to FB'}
                        </button>
                      )}

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

      {/* Video Preview Modal */}
      {videoPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-elevated border border-firefly-dim rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-firefly-glow">
                  🎬 Marketing Video Generated!
                </h2>
                <button
                  onClick={closeVideoPreview}
                  className="text-text-muted hover:text-text-soft text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Audio Player */}
              <div className="mb-6 bg-bg-dark rounded-lg p-4 border border-border-subtle">
                <h3 className="text-lg font-medium text-text-soft mb-3">🎤 Voice-Over</h3>
                <audio
                  controls
                  src={videoPreview.audioUrl}
                  className="w-full mb-3"
                  style={{ colorScheme: 'dark' }}
                />
                <button
                  onClick={downloadAudio}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-soft"
                >
                  ⬇️ Download Audio
                </button>
              </div>

              {/* Script Breakdown */}
              <div className="mb-6 bg-bg-dark rounded-lg p-4 border border-border-subtle">
                <h3 className="text-lg font-medium text-text-soft mb-3">📝 Video Script</h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-firefly-glow font-medium mb-1">Hook (0-3s)</div>
                    <div className="text-text-soft bg-bg-elevated p-3 rounded">
                      {videoPreview.scriptBreakdown.hook}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-firefly-glow font-medium mb-1">Key Points (3-25s)</div>
                    <ul className="space-y-2">
                      {videoPreview.scriptBreakdown.keyPoints.map((point, i) => (
                        <li key={i} className="text-text-soft bg-bg-elevated p-3 rounded">
                          {i + 1}. {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-sm text-firefly-glow font-medium mb-1">Call to Action (25-30s)</div>
                    <div className="text-text-soft bg-bg-elevated p-3 rounded">
                      {videoPreview.scriptBreakdown.cta}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-text-muted font-medium mb-1">Full Script</div>
                    <div className="text-text-soft bg-bg-elevated p-3 rounded text-sm whitespace-pre-wrap">
                      {videoPreview.script}
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-blue-400 mb-2">📹 Next Steps</h3>
                <ol className="text-text-soft space-y-2 text-sm list-decimal list-inside">
                  <li>Download the voice-over audio (button above)</li>
                  <li>Go to <Link href="/video-collage" className="text-firefly-glow hover:underline">Video Maker</Link></li>
                  <li>Upload your blog post image</li>
                  <li>Add the voice-over audio you just downloaded</li>
                  <li>Add text overlays with the script above</li>
                  <li>Export and post to Facebook!</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  href="/video-collage"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-medium text-center transition-soft"
                >
                  🎬 Open Video Maker
                </Link>
                <button
                  onClick={closeVideoPreview}
                  className="px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-soft rounded-lg font-medium transition-soft"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

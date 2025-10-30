'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

interface PinterestBoard {
  id: string
  name: string
  description: string
  privacy: string
  pin_count: number
  created_at: string
}

interface Analytics {
  all_time?: {
    impression: number
    save: number
    pin_click: number
    outbound_click: number
  }
}

export default function PinterestAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [boards, setBoards] = useState<PinterestBoard[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Board creation
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [newBoardPrivacy, setNewBoardPrivacy] = useState<'PUBLIC' | 'PROTECTED' | 'SECRET'>('PUBLIC')
  const [creatingBoard, setCreatingBoard] = useState(false)

  // Analytics filters
  const [analyticsDays, setAnalyticsDays] = useState(30)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      const adminStatus = (session.user as any).isAdmin
      setIsAdmin(adminStatus)

      if (!adminStatus) {
        router.push('/grove')
      } else {
        fetchData()
      }
    }
  }, [session, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch boards
      const boardsRes = await fetch('/api/pinterest/boards')
      if (boardsRes.ok) {
        const data = await boardsRes.json()
        setBoards(data.boards || [])
      }

      // Fetch analytics
      const analyticsRes = await fetch(`/api/pinterest/analytics?days=${analyticsDays}`)
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data.analytics || null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load Pinterest data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingBoard(true)

    try {
      const res = await fetch('/api/pinterest/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBoardName,
          description: newBoardDescription,
          privacy: newBoardPrivacy,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setBoards([...boards, data.board])
        setShowCreateBoard(false)
        setNewBoardName('')
        setNewBoardDescription('')
        setNewBoardPrivacy('PUBLIC')
      } else {
        const error = await res.json()
        alert(`Failed to create board: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating board:', error)
      alert('Failed to create board')
    } finally {
      setCreatingBoard(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!session || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header
        userName={session.user?.name || ''}
        isAdmin={isAdmin}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-text-soft mb-2">
              Pinterest <span className="text-red-500">Integration</span>
            </h1>
            <p className="text-text-muted">
              Manage your Pinterest boards and share Firefly Grove memories
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Analytics Overview */}
          {analytics && analytics.all_time && (
            <div className="mb-8 bg-bg-dark border border-border-subtle rounded-lg p-6">
              <h2 className="text-2xl text-text-soft mb-4">Pinterest Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-elevated p-4 rounded-lg">
                  <div className="text-text-muted text-sm mb-1">Impressions</div>
                  <div className="text-3xl text-text-soft font-light">
                    {analytics.all_time.impression.toLocaleString()}
                  </div>
                </div>
                <div className="bg-bg-elevated p-4 rounded-lg">
                  <div className="text-text-muted text-sm mb-1">Saves</div>
                  <div className="text-3xl text-firefly-glow font-light">
                    {analytics.all_time.save.toLocaleString()}
                  </div>
                </div>
                <div className="bg-bg-elevated p-4 rounded-lg">
                  <div className="text-text-muted text-sm mb-1">Pin Clicks</div>
                  <div className="text-3xl text-text-soft font-light">
                    {analytics.all_time.pin_click.toLocaleString()}
                  </div>
                </div>
                <div className="bg-bg-elevated p-4 rounded-lg">
                  <div className="text-text-muted text-sm mb-1">Outbound Clicks</div>
                  <div className="text-3xl text-green-400 font-light">
                    {analytics.all_time.outbound_click.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boards Management */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-text-soft">Your Pinterest Boards</h2>
              <button
                onClick={() => setShowCreateBoard(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-soft"
              >
                + Create Board
              </button>
            </div>

            {boards.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <p>No Pinterest boards found.</p>
                <p className="text-sm mt-2">Create your first board to start pinning memories!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boards.map((board) => (
                  <div
                    key={board.id}
                    className="bg-bg-elevated border border-border-subtle rounded-lg p-4 hover:border-red-500/50 transition-soft"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg text-text-soft font-medium">{board.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        board.privacy === 'PUBLIC'
                          ? 'bg-green-500/20 text-green-400'
                          : board.privacy === 'SECRET'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {board.privacy}
                      </span>
                    </div>
                    {board.description && (
                      <p className="text-sm text-text-muted mb-3">{board.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{board.pin_count} pins</span>
                      <a
                        href={`https://pinterest.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:text-red-400"
                      >
                        View on Pinterest →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <h2 className="text-2xl text-text-soft mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/grove')}
                className="p-4 bg-bg-elevated hover:bg-border-subtle border border-border-subtle rounded-lg transition-soft text-left"
              >
                <div className="text-lg text-text-soft mb-2">📌 Pin a Memory</div>
                <div className="text-sm text-text-muted">
                  Go to your grove and click the Pinterest icon on any memory card
                </div>
              </button>
              <button
                onClick={() => router.push('/blog')}
                className="p-4 bg-bg-elevated hover:bg-border-subtle border border-border-subtle rounded-lg transition-soft text-left"
              >
                <div className="text-lg text-text-soft mb-2">📝 Share Blog Posts</div>
                <div className="text-sm text-text-muted">
                  Create Pinterest pins from your blog content
                </div>
              </button>
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-8 bg-bg-dark border border-firefly-dim/30 rounded-lg p-6">
            <h3 className="text-xl text-firefly-glow mb-4">How to Share to Pinterest</h3>
            <div className="space-y-4 text-text-muted text-sm">
              <div className="flex gap-3">
                <span className="text-firefly-glow font-medium">1.</span>
                <span>Go to any branch and find a memory you want to share</span>
              </div>
              <div className="flex gap-3">
                <span className="text-firefly-glow font-medium">2.</span>
                <span>Click the Pinterest icon (red "P") next to the memory</span>
              </div>
              <div className="flex gap-3">
                <span className="text-firefly-glow font-medium">3.</span>
                <span>Select which board to pin to</span>
              </div>
              <div className="flex gap-3">
                <span className="text-firefly-glow font-medium">4.</span>
                <span>A beautiful Pinterest-optimized image will be automatically generated and pinned!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateBoard && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowCreateBoard(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-bg-dark border border-border-subtle rounded-lg shadow-2xl max-w-md w-full">
            <form onSubmit={handleCreateBoard} className="p-6">
              <h3 className="text-xl text-text-soft mb-4">Create Pinterest Board</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-soft mb-2">Board Name</label>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-red-500"
                    placeholder="e.g., Family Memories"
                    required
                    disabled={creatingBoard}
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-soft mb-2">Description</label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Describe your board..."
                    rows={3}
                    disabled={creatingBoard}
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-soft mb-2">Privacy</label>
                  <select
                    value={newBoardPrivacy}
                    onChange={(e) => setNewBoardPrivacy(e.target.value as any)}
                    className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-red-500"
                    disabled={creatingBoard}
                  >
                    <option value="PUBLIC">Public - Anyone can see this board</option>
                    <option value="PROTECTED">Protected - Only people you invite</option>
                    <option value="SECRET">Secret - Only you can see it</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateBoard(false)}
                  className="flex-1 py-2 bg-bg-elevated hover:bg-border-subtle text-text-soft rounded transition-soft"
                  disabled={creatingBoard}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-soft disabled:opacity-50"
                  disabled={creatingBoard}
                >
                  {creatingBoard ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

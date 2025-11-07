'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import FireflyGrove from '@/components/FireflyGrove'
import SharePanel from '@/components/SharePanel'

interface Memorial {
  id: string
  name: string
  birthDate: string
  deathDate: string
  memoryCount: number
  memoryLimit: number | null
  ownerName: string
  branchId: string | null
  branchTitle: string
  createdAt: string
}

export default function OpenGrovePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'memories'>('recent')
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalMemories, setTotalMemories] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setIsAdmin((session.user as any).isAdmin || false)
    }
  }, [session])
  const [memoryAges, setMemoryAges] = useState<number[]>([])
  const featuredPhoto = '' // TODO: Add featured photo from actual memorial
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [showSharePreview, setShowSharePreview] = useState(false)

  useEffect(() => {
    fetchMemorials()
  }, [search, sortBy])

  const fetchMemorials = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        limit: '50',
        offset: '0',
      })

      const res = await fetch(`/api/open-grove?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMemorials(data.memorials)
        setTotal(data.pagination.total)
        setTotalMemories(data.totalMemories || 0)
        setMemoryAges(data.memoryAges || [])
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch memorials:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    // Extract just the date part without timezone conversion
    const [year, month, day] = dateStr.split('T')[0].split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} isAdmin={isAdmin} />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Featured Photo */}
        {featuredPhoto && (
          <div className="relative mb-8 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <img
              src={featuredPhoto}
              alt="Open Grove"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-darker/60 to-bg-darker" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="text-6xl mb-4">🕯️</div>
                <h1 className="text-5xl font-light text-white mb-3 drop-shadow-lg">
                  Open Grove
                </h1>
                <p className="text-white/90 text-lg max-w-2xl mx-auto mb-4 drop-shadow">
                  A public garden where every story glows.<br />
                  Each candle a memory, each memory a life that still shines.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header - fallback if no photo */}
        {!featuredPhoto && (
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🕯️</div>
            <h1 className="text-4xl font-light text-[var(--legacy-text)] mb-2">
              Open Grove
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto mb-4">
              A public garden where every story glows.<br />
              Each candle a memory, each memory a life that still shines.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mb-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => router.push('/memorial/create')}
            className="px-4 py-2 bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] rounded border border-[var(--legacy-amber)]/40 text-sm transition-soft"
          >
            Create Memorial
          </button>
          <button
            onClick={() => setShowSharePreview(true)}
            className="px-4 py-2 bg-bg-dark hover:bg-border-subtle text-text-soft rounded border border-border-subtle text-sm transition-soft inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Open Grove
          </button>
        </div>

        {/* Memory Counter */}
        <div className="text-center mb-6">
          <p className="text-[var(--legacy-text)] text-lg italic">
            The Grove holds <span className="text-[var(--legacy-glow)] font-semibold">{totalMemories.toLocaleString()}</span> {totalMemories === 1 ? 'memory' : 'memories'} tonight.
          </p>
        </div>

        {/* Firefly Visualization - Main Focus */}
        {loading ? (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="text-center py-32 bg-bg-darker/50 rounded-lg border border-[var(--legacy-amber)]/20">
              <div className="text-text-muted">Loading the grove...</div>
            </div>
          </div>
        ) : totalMemories > 0 ? (
          <div className="max-w-6xl mx-auto mb-8">
            <FireflyGrove memoryCount={totalMemories} memoryAges={memoryAges} />
            <p className="text-center text-text-muted text-sm mt-3 italic">
              Each light represents a memory, glowing in the darkness.<br />
              As time passes, they gently fade to make room for new stories to shine.
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="text-center py-32 bg-bg-darker/50 rounded-lg border border-[var(--legacy-amber)]/20">
              <div className="text-6xl mb-4">🌿</div>
              <h3 className="text-xl text-text-soft mb-2">The grove awaits its first light</h3>
              <p className="text-text-muted">Be the first to create a memorial</p>
            </div>
          </div>
        )}

        {/* Browse Memorials Link */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/open-grove/memorials')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-soft rounded-lg border border-border-subtle transition-soft"
          >
            <span>Browse All Memorials</span>
            <span className="text-[var(--legacy-amber)]">({total})</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Search - Moved to Bottom */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-4">
            <label className="block text-text-soft text-sm mb-2 text-center">
              Search for a loved one
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  router.push(`/open-grove/memorials?search=${encodeURIComponent(search)}`)
                }
              }}
              placeholder="Enter a name..."
              className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-[var(--legacy-amber)]/50 transition-soft text-center"
            />
            <button
              onClick={() => {
                if (search.trim()) {
                  router.push(`/open-grove/memorials?search=${encodeURIComponent(search)}`)
                }
              }}
              disabled={!search.trim()}
              className="w-full mt-3 px-4 py-2 bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] rounded border border-[var(--legacy-amber)]/40 transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Share Preview Modal */}
      {showSharePreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-elevated border-2 border-[var(--legacy-amber)]/30 rounded-xl max-w-2xl w-full p-8 shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block text-5xl mb-4">🕯️</div>
              <h2 className="text-2xl font-light text-[var(--legacy-text)] mb-2">
                Share the Open Grove
              </h2>
              <p className="text-text-muted text-sm">Preview what will be shared</p>
            </div>

            {/* Preview Card - What they'll see */}
            <div className="mb-8 bg-gradient-to-b from-bg-dark/80 to-bg-darker rounded-lg border border-[var(--legacy-amber)]/20 overflow-hidden shadow-lg">
              {/* Featured Image Area */}
              <div className="relative h-48 bg-gradient-to-b from-[var(--legacy-amber)]/10 to-bg-darker flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-6xl mb-3 animate-pulse">🕯️</div>
                  <div className="text-[var(--legacy-glow)] font-light text-2xl drop-shadow-lg">
                    Open Grove
                  </div>
                </div>
              </div>

              {/* Share Preview Content */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-[var(--legacy-text)] mb-2">
                  Open Grove - Firefly Grove
                </h3>
                <p className="text-text-soft leading-relaxed mb-4">
                  Visit the Open Grove, where <span className="text-[var(--legacy-glow)] font-semibold">{totalMemories.toLocaleString()}</span> {totalMemories === 1 ? 'memory' : 'memories'} shine. A public garden where every story glows.
                </p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="truncate">{typeof window !== 'undefined' ? window.location.href : 'firefly-grove.com/open-grove'}</span>
                </div>
              </div>
            </div>

            {/* Confidence Message */}
            <div className="mb-6 p-4 bg-[var(--legacy-amber)]/5 border border-[var(--legacy-amber)]/20 rounded-lg">
              <p className="text-sm text-text-soft text-center leading-relaxed">
                ✨ This link leads to the public Open Grove, where anyone can view and search memorials.
                No personal information is shared beyond what's already public.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowSharePreview(false)
                  setShowSharePanel(true)
                }}
                className="flex-1 py-3 bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] rounded-lg border border-[var(--legacy-amber)]/40 font-medium transition-soft"
              >
                Continue to Share
              </button>
              <button
                onClick={() => setShowSharePreview(false)}
                className="px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-muted rounded-lg border border-border-subtle transition-soft"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Panel */}
      <SharePanel
        isOpen={showSharePanel}
        shareData={{
          title: 'Open Grove - Firefly Grove',
          text: `Visit the Open Grove, where ${totalMemories.toLocaleString()} memories shine. A public garden where every story glows.`,
          url: typeof window !== 'undefined' ? window.location.href : 'https://firefly-grove.com/open-grove'
        }}
        onClose={() => setShowSharePanel(false)}
      />
    </div>
  )
}

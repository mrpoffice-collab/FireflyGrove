'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import FireflyGrove from '@/components/FireflyGrove'

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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🕯️</div>
          <h1 className="text-4xl font-light text-[var(--legacy-text)] mb-2">
            Open Grove
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto mb-4">
            A public garden where every story glows.<br />
            Each candle a memory, each memory a life that still shines.
          </p>

          {/* Small Create Memorial Button */}
          <button
            onClick={() => router.push('/memorial/create')}
            className="px-4 py-2 bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] rounded border border-[var(--legacy-amber)]/40 text-sm transition-soft"
          >
            Create Memorial
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
              className="w-full mt-3 px-4 py-2 bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] rounded border border-[var(--legacy-amber)]/40 transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

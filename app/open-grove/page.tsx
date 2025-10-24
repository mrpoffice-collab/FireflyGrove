'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

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

  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'memories'>('recent')
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

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
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch memorials:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🕯️</div>
          <h1 className="text-4xl font-light text-[var(--legacy-text)] mb-2">
            Open Grove
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            A public memorial garden where every story finds a light. Browse memorials, share memories, and honor those who have passed.
          </p>
          <p className="text-text-muted text-sm mt-2">
            {total} {total === 1 ? 'memorial' : 'memorials'} in the Open Grove
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-[var(--legacy-amber)]/50 transition-soft"
                />
              </div>

              {/* Sort */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'memories')}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-[var(--legacy-amber)]/50 transition-soft"
                >
                  <option value="recent">Most Recent</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="memories">Most Memories</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Create Memorial CTA */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-[var(--legacy-amber)]/10 border border-[var(--legacy-amber)]/30 rounded-lg p-6 text-center">
            <h3 className="text-[var(--legacy-text)] font-medium mb-2">
              Create a Free Memorial
            </h3>
            <p className="text-text-muted text-sm mb-4">
              Honor the memory of a loved one with a lasting digital memorial
            </p>
            <button
              onClick={() => router.push('/memorial/create')}
              className="px-6 py-3 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft"
            >
              🕯️ Create Memorial
            </button>
          </div>
        </div>

        {/* Memorials Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-text-muted">Loading memorials...</div>
          </div>
        ) : memorials.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌿</div>
            <h3 className="text-xl text-text-soft mb-2">
              {search ? 'No memorials found' : 'No memorials yet'}
            </h3>
            <p className="text-text-muted">
              {search ? 'Try adjusting your search' : 'Be the first to create a memorial'}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {memorials.map((memorial) => (
                <div
                  key={memorial.id}
                  onClick={() => {
                    if (memorial.branchId) {
                      router.push(`/branch/${memorial.branchId}`)
                    }
                  }}
                  className={`bg-bg-dark border border-[var(--legacy-amber)]/30 rounded-lg p-6 hover:border-[var(--legacy-glow)]/50 transition-soft group ${
                    memorial.branchId ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Name */}
                      <h3 className="text-2xl font-light text-[var(--legacy-text)] mb-2 group-hover:text-[var(--legacy-glow)] transition-soft">
                        {memorial.name}
                      </h3>

                      {/* Dates */}
                      {memorial.birthDate && memorial.deathDate && (
                        <div className="text-text-muted text-sm mb-3">
                          {formatDate(memorial.birthDate)} ~ {formatDate(memorial.deathDate)}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--legacy-amber)]">💭</span>
                          <span className="text-text-soft">
                            {memorial.memoryCount} {memorial.memoryCount === 1 ? 'memory' : 'memories'}
                          </span>
                          {memorial.memoryLimit && (
                            <span className="text-text-muted">
                              / {memorial.memoryLimit}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-text-muted">Created by</span>
                          <span className="text-text-soft">{memorial.ownerName}</span>
                        </div>
                      </div>

                      {/* No branch warning */}
                      {!memorial.branchId && (
                        <div className="mt-3 text-xs text-text-muted italic">
                          Memorial setup incomplete - contact support
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="ml-4">
                      <div className="text-[var(--legacy-amber)] group-hover:text-[var(--legacy-glow)] transition-soft">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar if has limit */}
                  {memorial.memoryLimit && memorial.memoryCount > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-bg-darker rounded-full h-2">
                        <div
                          className="bg-[var(--legacy-amber)] h-2 rounded-full transition-soft"
                          style={{
                            width: `${Math.min((memorial.memoryCount / memorial.memoryLimit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      {memorial.memoryCount >= memorial.memoryLimit && (
                        <div className="text-xs text-[var(--legacy-amber)] mt-1">
                          Memory limit reached
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    // TODO: Implement pagination
                  }}
                  className="px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-soft rounded font-medium transition-soft border border-border-subtle"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

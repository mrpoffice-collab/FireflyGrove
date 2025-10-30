'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
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

function MemorialsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState<'recent' | 'firstname' | 'lastname'>('firstname')
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setIsAdmin((session.user as any).isAdmin || false)
    }
  }, [session])

  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearch(searchParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchMemorials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, page])

  const fetchMemorials = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        limit: '20',
        offset: String((page - 1) * 20),
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
    const [year, month, day] = dateStr.split('T')[0].split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} isAdmin={isAdmin} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/open-grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-4 transition-soft inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Open Grove
          </button>

          <h1 className="text-3xl font-light text-[var(--legacy-text)] mb-2">
            Memorial Directory
          </h1>
          <p className="text-text-muted">
            {total} {total === 1 ? 'memorial' : 'memorials'} in the Open Grove
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-4">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div>
                <label className="block text-text-soft text-sm mb-2">
                  Search by name
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Enter a name..."
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-[var(--legacy-amber)]/50 transition-soft"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-text-soft text-sm mb-2">
                  Sort by
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSortBy('firstname')
                      setPage(1)
                    }}
                    className={`flex-1 px-4 py-2 rounded border transition-soft ${
                      sortBy === 'firstname'
                        ? 'bg-[var(--legacy-amber)]/20 border-[var(--legacy-amber)]/40 text-[var(--legacy-text)]'
                        : 'bg-bg-darker border-border-subtle text-text-muted hover:text-text-soft'
                    }`}
                  >
                    First Name (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('lastname')
                      setPage(1)
                    }}
                    className={`flex-1 px-4 py-2 rounded border transition-soft ${
                      sortBy === 'lastname'
                        ? 'bg-[var(--legacy-amber)]/20 border-[var(--legacy-amber)]/40 text-[var(--legacy-text)]'
                        : 'bg-bg-darker border-border-subtle text-text-muted hover:text-text-soft'
                    }`}
                  >
                    Last Name (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('recent')
                      setPage(1)
                    }}
                    className={`flex-1 px-4 py-2 rounded border transition-soft ${
                      sortBy === 'recent'
                        ? 'bg-[var(--legacy-amber)]/20 border-[var(--legacy-amber)]/40 text-[var(--legacy-text)]'
                        : 'bg-bg-darker border-border-subtle text-text-muted hover:text-text-soft'
                    }`}
                  >
                    Most Recent
                  </button>
                </div>
              </div>
            </div>
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
          <>
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="max-w-4xl mx-auto mt-8">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-bg-dark hover:bg-border-subtle text-text-soft rounded border border-border-subtle transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded border transition-soft ${
                            page === pageNum
                              ? 'bg-[var(--legacy-amber)]/20 border-[var(--legacy-amber)]/40 text-[var(--legacy-text)]'
                              : 'bg-bg-dark border-border-subtle text-text-muted hover:text-text-soft'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-bg-dark hover:bg-border-subtle text-text-soft rounded border border-border-subtle transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                <p className="text-center text-text-muted text-sm mt-4">
                  Page {page} of {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function MemorialsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    }>
      <MemorialsContent />
    </Suspense>
  )
}

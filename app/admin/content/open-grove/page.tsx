'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'

interface PublicMemorial {
  id: string
  title: string
  type: string
  isPublic: boolean
  isFeatured: boolean
  createdAt: string
  _count: {
    entries: number
    members: number
  }
  owner: {
    name: string
    email: string
  }
}

export default function OpenGroveOversightPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [memorials, setMemorials] = useState<PublicMemorial[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'featured'>('all')
  const [selectedMemorial, setSelectedMemorial] = useState<PublicMemorial | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const isAdmin = (session?.user as any)?.isAdmin

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.push('/grove')
    } else if (isAdmin) {
      fetchMemorials()
    }
  }, [isAdmin, status, router, filterStatus])

  const fetchMemorials = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/open-grove?filter=${filterStatus}`)
      if (response.ok) {
        const data = await response.json()
        setMemorials(data.memorials)
      }
    } catch (error) {
      console.error('Failed to fetch memorials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMemorialAction = async (memorialId: string, action: 'feature' | 'unfeature' | 'hide') => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/open-grove/${memorialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchMemorials()
        setSelectedMemorial(null)
        const actionText = action === 'feature' ? 'featured' : action === 'unfeature' ? 'unfeatured' : 'hidden'
        alert(`Memorial ${actionText} successfully`)
      } else {
        const error = await response.json()
        alert(`Failed to ${action} memorial: ${error.error}`)
      }
    } catch (error) {
      console.error(`Failed to ${action} memorial:`, error)
      alert(`Failed to ${action} memorial`)
    } finally {
      setActionLoading(false)
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
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-text-muted">
          <Link href="/admin" className="hover:text-firefly-glow transition-soft">Admin</Link>
          <span className="mx-2">/</span>
          <span>Content & Moderation</span>
          <span className="mx-2">/</span>
          <span className="text-text-soft">Open Grove Oversight</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-firefly-glow mb-2">
            Open Grove Oversight
          </h1>
          <p className="text-text-muted">
            Manage public memorials in Open Grove
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(['all', 'public', 'featured'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-soft ${
                filterStatus === filter
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-elevated text-text-muted hover:bg-border-subtle'
              }`}
            >
              {filter === 'all' && 'All Memorials'}
              {filter === 'public' && 'Public'}
              {filter === 'featured' && 'Featured'}
            </button>
          ))}
        </div>

        {/* Memorial Count */}
        <div className="mb-4 text-sm text-text-muted">
          {memorials.length} memorial{memorials.length !== 1 ? 's' : ''} found
        </div>

        {/* Memorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memorials.map((memorial) => (
            <div
              key={memorial.id}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-firefly-dim/40 transition-soft"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-text-soft mb-1">{memorial.title}</h3>
                  <div className="text-xs text-text-muted">
                    Created by {memorial.owner.name}
                  </div>
                </div>
                {memorial.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs flex items-center gap-1">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    memorial.isPublic
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {memorial.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Memories:</span>
                  <span className="text-firefly-glow">{memorial._count.entries}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Contributors:</span>
                  <span className="text-text-soft">{memorial._count.members}</span>
                </div>
                <div className="text-xs text-text-muted">
                  Created {new Date(memorial.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => setSelectedMemorial(memorial)}
                className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded text-sm transition-soft"
              >
                Manage Memorial
              </button>
            </div>
          ))}
        </div>

        {memorials.length === 0 && (
          <div className="text-center py-16 bg-bg-elevated border border-border-subtle rounded-lg">
            <div className="text-5xl mb-4">🌳</div>
            <p className="text-text-muted mb-2">No {filterStatus !== 'all' ? filterStatus : ''} memorials</p>
            <p className="text-sm text-text-muted">
              {filterStatus === 'all' ? 'No public memorials have been created yet' : 'Try changing the filter'}
            </p>
          </div>
        )}
      </div>

      {/* Memorial Management Modal */}
      {selectedMemorial && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedMemorial(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-bg-dark border border-border-subtle rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-light text-text-soft mb-1">{selectedMemorial.title}</h3>
                  <p className="text-text-muted text-sm">Manage this public memorial</p>
                </div>
                <button
                  onClick={() => setSelectedMemorial(null)}
                  className="text-text-muted hover:text-text-soft transition-soft"
                >
                  ✕
                </button>
              </div>

              {/* Memorial Details */}
              <div className="space-y-6">
                {/* Owner Info */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-2">Memorial Owner</h4>
                  <div className="bg-bg-elevated rounded-lg p-4">
                    <div className="text-sm text-text-soft">{selectedMemorial.owner.name}</div>
                    <div className="text-xs text-text-muted">{selectedMemorial.owner.email}</div>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-2">Memorial Stats</h4>
                  <div className="bg-bg-elevated rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Total Memories:</span>
                      <span className="text-firefly-glow font-medium">{selectedMemorial._count.entries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Contributors:</span>
                      <span className="text-text-soft">{selectedMemorial._count.members}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Status:</span>
                      <span className={selectedMemorial.isPublic ? 'text-green-400' : 'text-gray-400'}>
                        {selectedMemorial.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Featured:</span>
                      <span className={selectedMemorial.isFeatured ? 'text-yellow-400' : 'text-gray-400'}>
                        {selectedMemorial.isFeatured ? 'Yes ⭐' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Management Actions */}
                <div>
                  <h4 className="text-sm font-medium text-text-soft mb-3">Management Actions</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedMemorial.isFeatured ? (
                      <button
                        onClick={() => handleMemorialAction(selectedMemorial.id, 'unfeature')}
                        disabled={actionLoading}
                        className="px-4 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded transition-soft disabled:opacity-50 text-left"
                      >
                        <div className="text-sm font-medium mb-1">⭐ Remove from Featured</div>
                        <div className="text-xs opacity-70">Remove from featured memorials section</div>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMemorialAction(selectedMemorial.id, 'feature')}
                        disabled={actionLoading}
                        className="px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded transition-soft disabled:opacity-50 text-left"
                      >
                        <div className="text-sm font-medium mb-1">⭐ Feature This Memorial</div>
                        <div className="text-xs opacity-70">Highlight in featured memorials section</div>
                      </button>
                    )}

                    <button
                      onClick={() => handleMemorialAction(selectedMemorial.id, 'hide')}
                      disabled={actionLoading}
                      className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded transition-soft disabled:opacity-50 text-left"
                    >
                      <div className="text-sm font-medium mb-1">🚫 Hide Memorial</div>
                      <div className="text-xs opacity-70">Make this memorial private (owner can still access)</div>
                    </button>

                    <Link
                      href={`/branch/${selectedMemorial.id}`}
                      target="_blank"
                      className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded transition-soft text-left block"
                    >
                      <div className="text-sm font-medium mb-1">👁️ View Memorial</div>
                      <div className="text-xs opacity-70">Open memorial in new tab</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

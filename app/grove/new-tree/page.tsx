'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

export default function NewTreePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showTypeSelection, setShowTypeSelection] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pendingNestPhoto, setPendingNestPhoto] = useState<string | null>(null)

  // Check for pending nest photo from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const nestPhotoParam = urlParams.get('pendingNestPhoto')
      if (nestPhotoParam) {
        setPendingNestPhoto(nestPhotoParam)
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Tree name is required')
      return
    }

    if (submitting) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const url = pendingNestPhoto
          ? `/tree/${data.tree.id}?pendingNestPhoto=${pendingNestPhoto}`
          : `/tree/${data.tree.id}`
        router.push(url)
      } else if (res.status === 403) {
        // At capacity
        setError(data.error || 'You have reached your tree capacity. Upgrade to add more trees.')
      } else {
        setError(data.error || 'Failed to create tree')
      }
    } catch (error) {
      console.error('Failed to create tree:', error)
      setError('Failed to create tree')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Grove
          </button>

          {showTypeSelection ? (
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
              <h1 className="text-3xl font-light text-text-soft mb-2 text-center">
                What type of tree?
              </h1>
              <p className="text-text-muted mb-8 text-center">
                Choose the type of tree you'd like to create
              </p>

              <div className="space-y-4">
                {/* Living Family Tree */}
                <button
                  onClick={() => setShowTypeSelection(false)}
                  className="w-full p-6 bg-bg-darker border-2 border-border-subtle hover:border-firefly-dim/50 rounded-lg text-left transition-soft group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🌳</div>
                    <div className="flex-1">
                      <h3 className="text-lg text-text-soft mb-2 group-hover:text-firefly-glow transition-soft">
                        Living Family Tree
                      </h3>
                      <p className="text-text-muted text-sm">
                        For your family, friends, and loved ones. Organize branches by person and share memories together.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Legacy Tree */}
                <button
                  onClick={() => router.push('/legacy-tree/create')}
                  className="w-full p-6 bg-[var(--legacy-amber)]/5 border-2 border-[var(--legacy-amber)]/30 hover:border-[var(--legacy-amber)]/50 rounded-lg text-left transition-soft group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🕯️</div>
                    <div className="flex-1">
                      <h3 className="text-lg text-[var(--legacy-text)] mb-2 group-hover:text-[var(--legacy-glow)] transition-soft">
                        Legacy Tree (Memorial)
                      </h3>
                      <p className="text-text-muted text-sm">
                        Honor the memory of a loved one who has passed. Free public memorial or private in your grove.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setShowTypeSelection(true)}
                  className="text-text-muted hover:text-text-soft transition-soft"
                  title="Back to tree type selection"
                >
                  ←
                </button>
                <h1 className="text-3xl font-light text-text-soft">
                  Create Living Family Tree
                </h1>
              </div>
              <p className="text-text-muted mb-8">
                Trees organize your family branches. You might create a tree for your immediate family, extended relatives, or different family lines.
              </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Tree Name <span className="text-firefly-dim">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="e.g., Smith Family, Mom's Side, Dad's Lineage"
                  autoFocus
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
                  placeholder="Add details about this tree"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-text-muted text-xs mt-1">
                  {description.length} / 500
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="text-red-400 text-sm">{error}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/grove')}
                  className="flex-1 py-3 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Tree'}
                </button>
              </div>
            </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

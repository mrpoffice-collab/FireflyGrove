'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

export default function NewBranchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const treeId = params.treeId as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Branch title is required')
      return
    }

    if (submitting) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treeId,
          title: title.trim(),
          description: description.trim() || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push(`/branch/${data.branch.id}`)
      } else {
        setError(data.error || 'Failed to create branch')
      }
    } catch (error) {
      console.error('Failed to create branch:', error)
      setError('Failed to create branch')
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
            onClick={() => router.push(`/tree/${treeId}`)}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Tree
          </button>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
            <h1 className="text-3xl font-light text-text-soft mb-2">
              Create New Branch
            </h1>
            <p className="text-text-muted mb-8">
              Branches represent individual people or relationships in your family tree. Create a branch for yourself, a family member, or a loved one.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Branch Title <span className="text-firefly-dim">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="e.g., Mom, Grandpa Joe, My Journey"
                  autoFocus
                  maxLength={100}
                />
                <p className="text-text-muted text-xs mt-1">
                  This could be a person's name, nickname, or a relationship label
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
                  placeholder="Add details about this person or branch"
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
                  onClick={() => router.push(`/tree/${treeId}`)}
                  className="flex-1 py-3 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

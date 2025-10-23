'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import FireflyCanvas from '@/components/FireflyCanvas'

interface Branch {
  id: string
  title: string
  description: string | null
  personStatus: string
  createdAt: string
  owner: {
    id: string
    name: string
  }
  _count: {
    entries: number
  }
}

interface Tree {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  branches: Branch[]
}

export default function TreePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const treeId = params.treeId as string

  const [tree, setTree] = useState<Tree | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [treeName, setTreeName] = useState('')
  const [treeDescription, setTreeDescription] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && treeId) {
      fetchTree()
    }
  }, [status, treeId])

  const fetchTree = async () => {
    try {
      const res = await fetch(`/api/trees/${treeId}`)
      if (res.ok) {
        const data = await res.json()
        setTree(data)
        setTreeName(data.name)
        setTreeDescription(data.description || '')
      } else {
        router.push('/grove')
      }
    } catch (error) {
      console.error('Failed to fetch tree:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRenameTree = async () => {
    if (!treeName.trim()) return

    try {
      const res = await fetch(`/api/trees/${treeId}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: treeName,
          description: treeDescription
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTree(data.tree)
        setIsEditingName(false)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to rename tree')
      }
    } catch (error) {
      console.error('Failed to rename tree:', error)
      alert('Failed to rename tree')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-darker flex items-center justify-center">
        <div className="text-text-muted">Loading tree...</div>
      </div>
    )
  }

  if (!session || !tree) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-darker">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push('/grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Grove
          </button>

          <div className="mb-8">
            {isEditingName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={treeName}
                    onChange={(e) => setTreeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameTree()
                      if (e.key === 'Escape') {
                        setTreeName(tree.name)
                        setTreeDescription(tree.description || '')
                        setIsEditingName(false)
                      }
                    }}
                    className="text-4xl font-light bg-bg-dark border border-firefly-dim/50 rounded px-3 py-1 text-text-soft focus:outline-none focus:border-firefly-glow flex-1"
                    autoFocus
                    maxLength={100}
                    placeholder="Tree name"
                  />
                </div>
                <textarea
                  value={treeDescription}
                  onChange={(e) => setTreeDescription(e.target.value)}
                  className="w-full bg-bg-dark border border-border-subtle rounded px-3 py-2 text-text-muted focus:outline-none focus:border-firefly-dim/50 resize-none"
                  rows={2}
                  placeholder="Description (optional)"
                  maxLength={500}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRenameTree}
                    className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setTreeName(tree.name)
                      setTreeDescription(tree.description || '')
                      setIsEditingName(false)
                    }}
                    className="px-4 py-2 bg-bg-dark hover:bg-border-subtle text-text-muted rounded text-sm transition-soft"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-light text-text-soft">
                    {tree.name}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-text-muted hover:text-firefly-glow transition-soft"
                    title="Rename tree"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                {tree.description && (
                  <p className="text-text-muted">{tree.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Firefly Visualization */}
          {tree.branches.length > 0 && (
            <div className="mb-8">
              <FireflyCanvas branches={tree.branches} />
            </div>
          )}

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-light text-text-soft">Branches</h2>
            <button
              onClick={() => router.push(`/tree/${treeId}/new-branch`)}
              className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
            >
              + New Branch
            </button>
          </div>

          {tree.branches.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border-subtle rounded-lg">
              <div className="text-6xl mb-4">🌿</div>
              <h3 className="text-xl text-text-soft mb-2">No branches yet</h3>
              <p className="text-text-muted mb-6">
                Create your first branch to start capturing memories
              </p>
              <button
                onClick={() => router.push(`/tree/${treeId}/new-branch`)}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
              >
                Create First Branch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tree.branches.map((branch) => (
                <div
                  key={branch.id}
                  onClick={() => router.push(`/branch/${branch.id}`)}
                  className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/50 transition-soft cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">
                      {branch.personStatus === 'legacy' ? '🕯️' : '🌿'}
                    </div>
                    {branch.personStatus === 'legacy' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-[var(--legacy-amber)]/20 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/30">
                        Legacy
                      </span>
                    )}
                  </div>
                  <h3
                    className={`text-xl mb-2 group-hover:text-firefly-glow transition-soft ${
                      branch.personStatus === 'legacy'
                        ? 'text-[var(--legacy-text)]'
                        : 'text-text-soft'
                    }`}
                  >
                    {branch.title}
                  </h3>
                  {branch.description && (
                    <p className="text-text-muted text-sm mb-4 line-clamp-2">
                      {branch.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span>{branch._count.entries} memories</span>
                    <span>•</span>
                    <span>
                      Created {new Date(branch.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

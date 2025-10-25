'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import FireflyCanvas from '@/components/FireflyCanvas'
import TransplantTreeModal from '@/components/TransplantTreeModal'
import RootTreeModal from '@/components/RootTreeModal'

interface Branch {
  id: string
  title: string
  description: string | null
  personStatus: string
  createdAt: string
  lastMemoryDate: string | null
  owner: {
    id: string
    name: string
  }
  _count: {
    entries: number
  }
  // For rooted trees
  isFromRootedTree?: boolean
  rootedTreeName?: string | null
}

interface Tree {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  grove: {
    id: string
    name: string
  }
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
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null)
  const [showTransplantModal, setShowTransplantModal] = useState(false)
  const [showRootModal, setShowRootModal] = useState(false)

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
        setTreeName(data.tree.name)
        setTreeDescription(data.tree.description || '')
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

  const handleDeleteBranch = async (branchId: string, branchTitle: string) => {
    if (!confirm(`Are you sure you want to delete the branch "${branchTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeletingBranchId(branchId)

    try {
      const res = await fetch(`/api/branches/${branchId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        await fetchTree() // Refresh to remove deleted branch
      } else {
        alert(data.error || 'Failed to delete branch')
      }
    } catch (error) {
      console.error('Failed to delete branch:', error)
      alert('Failed to delete branch')
    } finally {
      setDeletingBranchId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading tree...</div>
      </div>
    )
  }

  if (!session || !tree) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push('/grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Grove
          </button>

          <div className="mb-8 text-center">
            {isEditingName ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
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
                    className="text-4xl font-light bg-bg-dark border border-firefly-dim/50 rounded px-3 py-1 text-text-soft focus:outline-none focus:border-firefly-glow text-center"
                    autoFocus
                    maxLength={100}
                    placeholder="Tree name"
                  />
                </div>
                <textarea
                  value={treeDescription}
                  onChange={(e) => setTreeDescription(e.target.value)}
                  className="w-full max-w-md mx-auto bg-bg-dark border border-border-subtle rounded px-3 py-2 text-text-muted focus:outline-none focus:border-firefly-dim/50 resize-none text-center"
                  rows={2}
                  placeholder="Description (optional)"
                  maxLength={500}
                />
                <div className="flex gap-2 justify-center">
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
                <div className="flex items-center justify-center gap-3 mb-2">
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
                  <button
                    onClick={() => setShowTransplantModal(true)}
                    className="text-text-muted hover:text-firefly-glow transition-soft"
                    title="Transfer tree to another person"
                  >
                    🚚
                  </button>
                  <button
                    onClick={() => setShowRootModal(true)}
                    className="text-text-muted hover:text-firefly-glow transition-soft"
                    title="Root with another tree"
                  >
                    🌱
                  </button>
                </div>
                {tree.description && (
                  <p className="text-text-muted mb-2">{tree.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Tree Stats */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-text-muted text-sm">
            <span className="flex items-center gap-1">
              🌲 <span className="text-text-soft font-medium">1</span> Tree
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              🌿 <span className="text-text-soft font-medium">{tree.branches.length}</span> {tree.branches.length === 1 ? 'Branch' : 'Branches'}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              💫 <span className="text-text-soft font-medium">
                {tree.branches.reduce((sum, b) => sum + b._count.entries, 0)}
              </span> {tree.branches.reduce((sum, b) => sum + b._count.entries, 0) === 1 ? 'Memory' : 'Memories'}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              ✨ <span className="text-text-soft font-medium">
                {tree.branches.filter(b => b._count.entries > 0).length}
              </span> {tree.branches.filter(b => b._count.entries > 0).length === 1 ? 'Firefly' : 'Fireflies'}
            </span>
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
                  className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/50 transition-soft group relative"
                >
                  <div
                    onClick={() => router.push(`/branch/${branch.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">
                        {branch.personStatus === 'legacy' ? '🕯️' : '🌿'}
                      </div>
                      <div className="flex gap-2">
                        {branch.personStatus === 'legacy' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-[var(--legacy-amber)]/20 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/30">
                            Legacy
                          </span>
                        )}
                        {branch.isFromRootedTree && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30" title={`From ${branch.rootedTreeName}`}>
                            🌱 Rooted
                          </span>
                        )}
                      </div>
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
                  {/* Delete button - only show for branches with 0 memories */}
                  {branch._count.entries === 0 && branch.owner.id === (session.user as any)?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBranch(branch.id, branch.title)
                      }}
                      disabled={deletingBranchId === branch.id}
                      className="absolute top-2 right-2 p-2 text-text-muted hover:text-red-400 transition-soft disabled:opacity-50"
                      title="Delete empty branch"
                    >
                      {deletingBranchId === branch.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transplant Tree Modal */}
      {showTransplantModal && tree && (
        <TransplantTreeModal
          treeId={tree.id}
          treeName={tree.name}
          currentGroveId={tree.grove.id}
          currentGroveName={tree.grove.name}
          isLegacyTree={tree.branches.some(b => b.personStatus === 'legacy')}
          onClose={() => setShowTransplantModal(false)}
          onSuccess={() => {
            setShowTransplantModal(false)
            router.push('/grove')
          }}
        />
      )}

      {/* Root Tree Modal */}
      {showRootModal && tree && (
        <RootTreeModal
          personId={tree.id}
          treeName={tree.name}
          onClose={() => setShowRootModal(false)}
          onSuccess={() => {
            setShowRootModal(false)
            fetchTree() // Refresh to show the new root connection
          }}
        />
      )}
    </div>
  )
}

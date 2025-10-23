'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

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
      } else {
        router.push('/grove')
      }
    } catch (error) {
      console.error('Failed to fetch tree:', error)
    } finally {
      setLoading(false)
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
            <h1 className="text-4xl font-light text-text-soft mb-2">
              {tree.name}
            </h1>
            {tree.description && (
              <p className="text-text-muted">{tree.description}</p>
            )}
          </div>

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

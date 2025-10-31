'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

interface Tree {
  id: string
  name: string
  description: string | null
  branches: Branch[]
}

interface Branch {
  id: string
  title: string
  description: string | null
  personStatus?: string
  _count: {
    entries: number
  }
  tree?: {
    id: string
    name: string
    grove: {
      name: string
    }
  }
}

export default function ForeverKitPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trees, setTrees] = useState<Tree[]>([])
  const [sharedBranches, setSharedBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGroveAndBranches()
    }
  }, [status])

  const fetchGroveAndBranches = async () => {
    try {
      // Fetch grove info and all branches the user owns or has access to
      const [groveRes, allBranchesRes] = await Promise.all([
        fetch('/api/grove'),
        fetch('/api/branches')
      ])

      if (!groveRes.ok) {
        throw new Error('Failed to fetch grove')
      }

      const groveData = await groveRes.json()
      const userGroveId = groveData.id

      // Get all branches user owns/has access to (already includes tree data)
      const allBranches = allBranchesRes.ok ? await allBranchesRes.json() : []

      // Group branches by tree
      const treeMap = new Map<string, Tree>()
      const shared: Branch[] = []

      allBranches.forEach((branch: any) => {
        if (!branch.tree) return

        // Check if this branch is on a different grove (shared)
        if (branch.tree.grove?.id && branch.tree.grove.id !== userGroveId) {
          shared.push(branch)
          return
        }

        // Group by tree
        const treeId = branch.tree.id
        if (!treeMap.has(treeId)) {
          treeMap.set(treeId, {
            id: branch.tree.id,
            name: branch.tree.name,
            description: branch.tree.description || null,
            branches: []
          })
        }
        treeMap.get(treeId)!.branches.push(branch)
      })

      setTrees(Array.from(treeMap.values()))
      setSharedBranches(shared)
    } catch (error) {
      console.error('Failed to fetch grove:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (branchId: string, title: string) => {
    setDownloading(branchId)
    try {
      const res = await fetch(`/api/branches/${branchId}/export`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-forever-kit.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download Forever Kit')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to download Forever Kit')
    } finally {
      setDownloading(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center py-16">
          <div className="text-text-muted">Loading your grove...</div>
        </div>
      </div>
    )
  }

  const totalMemories = trees.reduce((sum, tree) => {
    return sum + tree.branches.reduce((branchSum, branch) => branchSum + branch._count.entries, 0)
  }, 0) + sharedBranches.reduce((sum, branch) => sum + branch._count.entries, 0)

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">📦</span>
              <h1 className="text-4xl font-light text-text-soft">
                Forever Kit Export
              </h1>
            </div>
            <p className="text-text-muted text-lg mb-2">
              Download complete backups of your memories
            </p>
            <p className="text-text-muted text-sm">
              {trees.length} trees • {trees.reduce((sum, t) => sum + t.branches.length, 0) + sharedBranches.length} branches • {totalMemories} memories
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-bg-dark border border-firefly-dim/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg text-firefly-glow font-medium mb-3 flex items-center gap-2">
              <span>✦</span>
              <span>What is a Forever Kit?</span>
            </h2>
            <div className="text-text-muted text-sm space-y-2">
              <p>
                A Forever Kit is a complete, standalone HTML archive of a branch's memories.
                It includes all photos, stories, and voice notes in a single file that works
                offline forever - no internet required.
              </p>
              <p>
                <strong className="text-text-soft">Why download?</strong> Keep a local backup,
                share with family members, or preserve your memories independently of any cloud service.
              </p>
              <p>
                <strong className="text-text-soft">Format:</strong> Self-contained HTML file
                that opens in any web browser. Beautiful formatting, ready to print or archive.
              </p>
            </div>
          </div>

          {/* Export List */}
          {trees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌳</div>
              <p className="text-text-muted mb-6">
                Your grove is empty. Plant your first tree to start creating memories.
              </p>
              <button
                onClick={() => router.push('/grove/new-tree')}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Plant First Tree
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {trees.map((tree) => (
                <div key={tree.id} className="bg-bg-dark border border-border-subtle rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">
                      🌳
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-text-soft font-medium mb-1">
                        {tree.name}
                      </h3>
                      <p className="text-text-muted text-sm">
                        {tree.branches.length} {tree.branches.length === 1 ? 'branch' : 'branches'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tree.branches.map((branch) => (
                      <div
                        key={branch.id}
                        className="flex items-center justify-between bg-bg-darker border border-border-subtle rounded-lg p-4 hover:border-firefly-dim/30 transition-soft"
                      >
                        <div className="flex-1">
                          <div className="text-text-soft font-medium mb-1">
                            {branch.title}
                          </div>
                          {branch.description && (
                            <div className="text-text-muted text-sm mb-2">
                              {branch.description}
                            </div>
                          )}
                          <div className="text-text-muted text-xs">
                            {branch._count.entries} {branch._count.entries === 1 ? 'memory' : 'memories'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleExport(branch.id, branch.title)}
                          disabled={downloading === branch.id || branch._count.entries === 0}
                          className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed ml-4"
                        >
                          {downloading === branch.id ? (
                            'Preparing...'
                          ) : branch._count.entries === 0 ? (
                            'No memories'
                          ) : (
                            <>
                              <span className="hidden sm:inline">Download </span>
                              <span>📦</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shared Branches Section */}
          {sharedBranches.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl text-text-soft mb-2 flex items-center gap-2">
                  <span>🤝</span>
                  <span>Shared Branches</span>
                </h2>
                <p className="text-text-muted text-sm">
                  Branches on other people's trees where you've contributed memories
                </p>
              </div>

              <div className="space-y-4">
                {sharedBranches.map((branch) => (
                  <div
                    key={branch.id}
                    className="bg-bg-dark border border-border-subtle rounded-lg p-4 hover:border-firefly-dim/30 transition-soft"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-text-soft font-medium">
                            {branch.title}
                          </span>
                          <span className="text-xs text-text-muted">
                            on {branch.tree?.name || 'Unknown Tree'}
                          </span>
                        </div>
                        {branch.description && (
                          <div className="text-text-muted text-sm mb-2">
                            {branch.description}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span>
                            {branch._count.entries} {branch._count.entries === 1 ? 'memory' : 'memories'}
                          </span>
                          {branch.tree?.grove?.name && (
                            <span>
                              in {branch.tree.grove.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleExport(branch.id, branch.title)}
                        disabled={downloading === branch.id || branch._count.entries === 0}
                        className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed ml-4"
                      >
                        {downloading === branch.id ? (
                          'Preparing...'
                        ) : branch._count.entries === 0 ? (
                          'No memories'
                        ) : (
                          <>
                            <span className="hidden sm:inline">Download </span>
                            <span>📦</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-12 text-center text-text-muted text-sm">
            <p className="mb-2">
              Forever Kits are always available. Download as many times as you need.
            </p>
            <p>
              Your memories are preserved safely in the cloud and now in your hands.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

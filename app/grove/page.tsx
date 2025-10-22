'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import FireflyCanvas from '@/components/FireflyCanvas'
import BranchModal from '@/components/BranchModal'
import Header from '@/components/Header'

interface Branch {
  id: string
  title: string
  description: string | null
  createdAt: string
  _count: {
    entries: number
  }
}

export default function GrovePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewBranch, setShowNewBranch] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBranches()
    }
  }, [status])

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches')
      if (res.ok) {
        const data = await res.json()
        setBranches(data)
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBranch = async (title: string, description: string) => {
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      if (res.ok) {
        await fetchBranches()
        setShowNewBranch(false)
      }
    } catch (error) {
      console.error('Failed to create branch:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-darker flex items-center justify-center">
        <div className="text-text-muted">Loading your grove...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-darker">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light text-text-soft mb-2">
              Your Grove
            </h1>
            <p className="text-text-muted text-sm">
              Each firefly holds the memories of someone special
            </p>
          </div>

          {branches.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted mb-6">
                Your grove is quiet. Create your first branch to begin.
              </p>
              <button
                onClick={() => setShowNewBranch(true)}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Create First Branch
              </button>
            </div>
          ) : (
            <>
              <FireflyCanvas branches={branches} />

              <div className="mt-12 grid gap-4">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    onClick={() => router.push(`/branch/${branch.id}`)}
                    className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim transition-soft cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl text-text-soft mb-1">
                          {branch.title}
                        </h3>
                        {branch.description && (
                          <p className="text-text-muted text-sm">
                            {branch.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-firefly-glow text-2xl mb-1">
                          {branch._count.entries}
                        </div>
                        <div className="text-text-muted text-xs">
                          {branch._count.entries === 1 ? 'memory' : 'memories'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowNewBranch(true)}
                  className="px-6 py-3 bg-bg-dark border border-firefly-dim hover:bg-firefly-dim hover:text-bg-dark text-firefly-glow rounded-lg font-medium transition-soft"
                >
                  New Branch
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showNewBranch && (
        <BranchModal
          onClose={() => setShowNewBranch(false)}
          onSave={handleCreateBranch}
        />
      )}
    </div>
  )
}

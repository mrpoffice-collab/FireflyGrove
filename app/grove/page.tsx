'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { getPlanById } from '@/lib/plans'

interface Tree {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  _count: {
    branches: number
  }
}

interface Grove {
  id: string
  name: string
  planType: string
  treeLimit: number
  status: string
  trees: Tree[]
}

export default function GrovePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [grove, setGrove] = useState<Grove | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGrove()
    }
  }, [status])

  const fetchGrove = async () => {
    try {
      const res = await fetch('/api/grove')
      if (res.ok) {
        const data = await res.json()
        setGrove(data)
      }
    } catch (error) {
      console.error('Failed to fetch grove:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-darker flex items-center justify-center">
        <div className="text-text-muted">Loading grove...</div>
      </div>
    )
  }

  if (!session || !grove) {
    return null
  }

  const plan = getPlanById(grove.planType)
  const treeCount = grove.trees.length
  const isAtCapacity = treeCount >= grove.treeLimit

  return (
    <div className="min-h-screen bg-bg-darker">
      <Header
        userName={session.user?.name || ''}
        groveInfo={{
          planName: plan.name,
          treeCount,
          treeLimit: grove.treeLimit,
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Grove Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-text-soft mb-4">
              {grove.name}
            </h1>

            {grove.status === 'past_due' && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="text-orange-400 font-medium mb-1">Payment Issue</div>
                    <div className="text-text-muted text-sm">
                      Your payment method needs attention. Please update your billing information to continue using all features.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {grove.status === 'canceled' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="text-red-400 font-medium mb-1">Subscription Canceled</div>
                    <div className="text-text-muted text-sm mb-2">
                      Your grove is view-only. Reactivate your subscription to create new trees and memories.
                    </div>
                    <button
                      onClick={() => router.push('/billing')}
                      className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft"
                    >
                      Reactivate Grove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trees Grid */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-light text-text-soft">Your Trees</h2>
            <button
              onClick={() => router.push('/grove/new-tree')}
              disabled={isAtCapacity || grove.status === 'canceled'}
              className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                isAtCapacity
                  ? 'You\'ve reached your tree capacity. Upgrade to add more.'
                  : grove.status === 'canceled'
                  ? 'Reactivate your subscription to create trees'
                  : 'Create a new tree'
              }
            >
              + New Tree
            </button>
          </div>

          {grove.trees.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border-subtle rounded-lg">
              <div className="text-6xl mb-4">🌳</div>
              <h3 className="text-xl text-text-soft mb-2">No trees yet</h3>
              <p className="text-text-muted mb-6">
                Create your first tree to organize your family memories
              </p>
              <button
                onClick={() => router.push('/grove/new-tree')}
                disabled={grove.status === 'canceled'}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
              >
                Create First Tree
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grove.trees.map((tree) => (
                <div
                  key={tree.id}
                  onClick={() => router.push(`/tree/${tree.id}`)}
                  className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/50 transition-soft cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">🌳</div>
                    {tree.status === 'ARCHIVED' && (
                      <span className="px-2 py-1 text-xs rounded bg-text-muted/20 text-text-muted">
                        Archived
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl text-text-soft mb-2 group-hover:text-firefly-glow transition-soft">
                    {tree.name}
                  </h3>
                  {tree.description && (
                    <p className="text-text-muted text-sm mb-4 line-clamp-2">
                      {tree.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span>{tree._count.branches} branches</span>
                    <span>•</span>
                    <span>
                      Created {new Date(tree.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAtCapacity && grove.status === 'active' && (
            <div className="mt-8 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌟</div>
                <div className="flex-1">
                  <h3 className="text-lg text-text-soft mb-2">
                    You've planted all your trees!
                  </h3>
                  <p className="text-text-muted mb-4">
                    Upgrade to grow more trees and expand your family grove.
                  </p>
                  <button
                    onClick={() => router.push('/billing')}
                    className="px-6 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
                  >
                    View Upgrade Options
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

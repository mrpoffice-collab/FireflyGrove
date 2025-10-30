'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Tooltip from '@/components/Tooltip'
import NestNudge from '@/components/NestNudge'
import FireflyCanvas from '@/components/FireflyCanvas'
import FireflyBurst from '@/components/FireflyBurst'
import AudioSparks from '@/components/AudioSparks'
import { getPlanById } from '@/lib/plans'

interface Tree {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  memoryCount: number
  _count: {
    branches: number
  }
}

interface PersonTree {
  id: string
  name: string
  isLegacy: boolean
  memoryCount: number
  birthDate?: string | null
  deathDate?: string | null
  createdAt: string
  _count: {
    branches: number
  }
}

interface Branch {
  id: string
  title: string
  personStatus: string
  lastMemoryDate: string | null
  _count: {
    entries: number
  }
}

interface Grove {
  id: string
  name: string
  planType: string
  treeLimit: number
  status: string
  trees: Tree[]
  persons?: PersonTree[]
  rootedPersons?: PersonTree[]
  allBranches?: Branch[]
}

interface TransplantablePerson {
  id: string
  name: string
  isLegacy: boolean
  birthDate: string | null
  deathDate: string | null
  memoryCount: number
  currentGrove: {
    id: string
    name: string
    owner: {
      id: string
      name: string
    }
  }
}

export default function GrovePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [grove, setGrove] = useState<Grove | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [groveName, setGroveName] = useState('')
  const [transplantable, setTransplantable] = useState<TransplantablePerson[]>([])
  const [transplanting, setTransplanting] = useState<string | null>(null)
  const [pendingNestPhoto, setPendingNestPhoto] = useState<string | null>(null)

  // Firefly Burst state
  const [showBurst, setShowBurst] = useState(false)
  const [burstMemories, setBurstMemories] = useState<any[]>([])
  const [burstId, setBurstId] = useState<string | null>(null)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))

  // Audio Sparks state
  const [showAudioSparks, setShowAudioSparks] = useState(false)

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

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGrove()
      fetchTransplantable()
      // Trigger burst on first load
      generateBurst()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const generateBurst = async () => {
    try {
      const res = await fetch('/api/firefly-burst/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.memories && data.memories.length > 0) {
          setBurstMemories(data.memories)
          setBurstId(data.burst.id)
          setShowBurst(true)
        }
      }
    } catch (error) {
      console.error('Failed to generate burst:', error)
    }
  }

  const fetchGrove = async () => {
    try {
      const res = await fetch('/api/grove')
      if (res.ok) {
        const data = await res.json()
        setGrove(data)
        setGroveName(data.name)
      }
    } catch (error) {
      console.error('Failed to fetch grove:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransplantable = async () => {
    try {
      const res = await fetch('/api/persons/transplantable')
      if (res.ok) {
        const data = await res.json()
        setTransplantable(data.transplantable || [])
      }
    } catch (error) {
      console.error('Failed to fetch transplantable trees:', error)
    }
  }

  const handleTransplant = async (personId: string, personName: string) => {
    if (!grove) return

    const confirmed = confirm(
      `Transplant "${personName}" to your grove?\n\nThis will move the tree from its current grove to yours. The original grove owner will get their tree slot back.`
    )

    if (!confirmed) return

    setTransplanting(personId)

    try {
      const res = await fetch(`/api/persons/${personId}/transplant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationGroveId: grove.id }),
      })

      if (res.ok) {
        // Refresh both lists
        await fetchGrove()
        await fetchTransplantable()
        alert(`"${personName}" has been transplanted to your grove!`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to transplant tree')
      }
    } catch (error) {
      console.error('Failed to transplant tree:', error)
      alert('Failed to transplant tree')
    } finally {
      setTransplanting(null)
    }
  }

  const handleRenameGrove = async () => {
    if (!groveName.trim()) return

    try {
      const res = await fetch('/api/grove/rename', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groveName }),
      })

      if (res.ok) {
        const data = await res.json()
        setGrove(data.grove)
        setGroveName(data.grove.name)
        setIsEditingName(false)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to rename grove')
      }
    } catch (error) {
      console.error('Failed to rename grove:', error)
      alert('Failed to rename grove')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading grove...</div>
      </div>
    )
  }

  if (!session || !grove) {
    return null
  }

  const plan = getPlanById(grove.planType)
  const treeCount = grove.trees?.length || 0
  const isAtCapacity = treeCount >= grove.treeLimit

  return (
    <div className="min-h-screen">
      <Header
        userName={session.user?.name || ''}
        isBetaTester={(session.user as any)?.isBetaTester || false}
        isAdmin={(session.user as any)?.isAdmin || false}
        groveInfo={{
          planName: plan.name,
          treeCount,
          treeLimit: grove.treeLimit,
        }}
      />

      {/* Nest Nudge - Shows when user has old photos in nest */}
      <NestNudge userId={(session.user as any)?.id} />

      {/* Firefly Burst Modal */}
      {showBurst && burstMemories.length > 0 && burstId && (
        <FireflyBurst
          memories={burstMemories}
          burstId={burstId}
          onClose={() => setShowBurst(false)}
          onViewNext={() => {
            setShowBurst(false)
            // Small delay before generating new burst
            setTimeout(() => generateBurst(), 500)
          }}
        />
      )}

      {/* Audio Sparks Modal */}
      {showAudioSparks && (
        <AudioSparks
          onClose={() => setShowAudioSparks(false)}
          branches={grove.allBranches || []}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Transplantable Trees Section */}
          {transplantable.length > 0 && (
            <div className="mb-8 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-6">
              <h2 className="text-xl text-firefly-glow font-medium mb-2 flex items-center gap-2">
                <span>🌱</span>
                <span>Trees You Can Transplant</span>
              </h2>
              <p className="text-text-muted text-sm mb-4">
                These are your trees currently planted in other groves. You can transplant them to your own grove.
              </p>
              <div className="space-y-3">
                {transplantable.map((person) => (
                  <div
                    key={person.id}
                    className="bg-bg-dark border border-border-subtle rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg text-text-soft font-medium">{person.name}</h3>
                      <p className="text-sm text-text-muted">
                        Currently in {person.currentGrove.name} (owned by {person.currentGrove.owner.name})
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {person.memoryCount} {person.memoryCount === 1 ? 'memory' : 'memories'}
                        {person.isLegacy && ' • Legacy tree'}
                      </p>
                    </div>
                    <Tooltip
                      content={isAtCapacity ? 'Your grove is at capacity. Upgrade to add more trees.' : 'Transplant this tree to your grove'}
                      position="left"
                    >
                      <button
                        onClick={() => handleTransplant(person.id, person.name)}
                        disabled={transplanting === person.id || isAtCapacity}
                        className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {transplanting === person.id ? 'Transplanting...' : 'Transplant to My Grove'}
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
              {isAtCapacity && (
                <p className="text-sm text-orange-400 mt-3">
                  ⚠️ Your grove is at capacity ({grove.treeLimit} trees). Upgrade your plan to transplant more trees.
                </p>
              )}
            </div>
          )}

          {/* Grove Header */}
          <div className="mb-8 text-center">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-3 mb-4">
                <input
                  type="text"
                  value={groveName}
                  onChange={(e) => setGroveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameGrove()
                    if (e.key === 'Escape') {
                      setGroveName(grove.name)
                      setIsEditingName(false)
                    }
                  }}
                  className="text-4xl font-light bg-bg-dark border border-firefly-dim/50 rounded px-3 py-1 text-text-soft focus:outline-none focus:border-firefly-glow text-center"
                  autoFocus
                  maxLength={100}
                />
                <button
                  onClick={handleRenameGrove}
                  className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setGroveName(grove.name)
                    setIsEditingName(false)
                  }}
                  className="px-4 py-2 bg-bg-dark hover:bg-border-subtle text-text-muted rounded text-sm transition-soft"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 mb-4">
                <h1 className="text-4xl font-light text-text-soft">
                  {grove.name}
                </h1>
                <Tooltip content="Rename your grove">
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-text-muted hover:text-firefly-glow transition-soft"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </Tooltip>
              </div>
            )}

            <p className="text-text-muted text-sm mb-4">
              Where family, friends, and generations connect through shared memories.
            </p>

            {/* Quick Actions */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              {burstMemories.length > 0 && (
                <button
                  onClick={generateBurst}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 border border-firefly-dim/40 text-firefly-glow rounded-lg text-sm font-medium transition-soft"
                >
                  <span>✨</span>
                  <span>Get Another Burst</span>
                </button>
              )}
              <button
                onClick={() => setShowAudioSparks(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-firefly-glow hover:bg-firefly-bright text-bg-darker rounded-lg text-sm font-medium transition-soft"
              >
                <span>🎙️</span>
                <span>Audio Sparks</span>
              </button>
            </div>

            {/* Grove Stats */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-text-muted text-sm">
              <span className="flex items-center gap-1">
                🌲 <span className="text-text-soft font-medium">{grove.trees?.length || 0}</span> {(grove.trees?.length || 0) === 1 ? 'Tree' : 'Trees'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                🌿 <span className="text-text-soft font-medium">
                  {(grove.trees?.reduce((sum, t) => sum + t._count.branches, 0) || 0) +
                   ((grove.persons?.reduce((sum, p) => sum + p._count.branches, 0) || 0)) +
                   ((grove.rootedPersons?.reduce((sum, p) => sum + p._count.branches, 0) || 0))}
                </span> {((grove.trees?.reduce((sum, t) => sum + t._count.branches, 0) || 0) + ((grove.persons?.reduce((sum, p) => sum + p._count.branches, 0) || 0)) + ((grove.rootedPersons?.reduce((sum, p) => sum + p._count.branches, 0) || 0))) === 1 ? 'Branch' : 'Branches'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                💫 <span className="text-text-soft font-medium">
                  {(grove.trees?.reduce((sum, t) => sum + t.memoryCount, 0) || 0) +
                   ((grove.persons?.reduce((sum, p) => sum + p.memoryCount, 0) || 0)) +
                   ((grove.rootedPersons?.reduce((sum, p) => sum + p.memoryCount, 0) || 0))}
                </span> {((grove.trees?.reduce((sum, t) => sum + t.memoryCount, 0) || 0) + ((grove.persons?.reduce((sum, p) => sum + p.memoryCount, 0) || 0)) + ((grove.rootedPersons?.reduce((sum, p) => sum + p.memoryCount, 0) || 0))) === 1 ? 'Memory' : 'Memories'}
              </span>
            </div>
          </div>

          {/* Status Alerts */}
          <div className="mb-8">
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

          {/* Trees Grid with Firefly Background - Olive Grove Style */}
          <div className="relative">
            {/* Firefly Visualization - Background Layer */}
            {grove.allBranches && grove.allBranches.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                <FireflyCanvas branches={grove.allBranches} />
              </div>
            )}

            {/* Trees Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {/* Existing Trees */}
            {grove.trees?.map((tree) => (
              <div
                key={tree.id}
                onClick={() => {
                  const url = pendingNestPhoto
                    ? `/tree/${tree.id}?pendingNestPhoto=${pendingNestPhoto}`
                    : `/tree/${tree.id}`
                  router.push(url)
                }}
                className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-bg-dark transition-soft cursor-pointer group"
              >
                {/* Simple Olive Tree SVG */}
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  className="group-hover:scale-110 transition-transform"
                >
                  {/* Trunk */}
                  <rect x="36" y="50" width="8" height="25" fill="#8B7355" />
                  {/* Foliage - Olive tree style (organic, flowing) */}
                  <ellipse cx="40" cy="35" rx="20" ry="15" fill="#9ca986" opacity="0.8" />
                  <ellipse cx="30" cy="40" rx="15" ry="12" fill="#9ca986" opacity="0.9" />
                  <ellipse cx="50" cy="40" rx="15" ry="12" fill="#9ca986" opacity="0.9" />
                  <ellipse cx="40" cy="45" rx="18" ry="10" fill="#b8c5a6" opacity="0.7" />
                  {/* Highlight */}
                  <ellipse cx="35" cy="32" rx="8" ry="6" fill="#c5d4b3" opacity="0.5" />
                </svg>

                <div className="text-center">
                  <div className="text-sm font-medium text-text-soft group-hover:text-firefly-glow transition-soft line-clamp-2 mb-1">
                    {tree.name}
                  </div>
                  <div className="text-xs text-text-muted">
                    {tree._count.branches} {tree._count.branches === 1 ? 'branch' : 'branches'}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: grove.treeLimit - treeCount }).map((_, index) => (
              <Tooltip
                key={`empty-${index}`}
                content={grove.status === 'canceled' ? 'Reactivate your subscription to plant new trees' : 'Click to plant a new tree'}
              >
                <div
                  onClick={() => {
                    if (grove.status !== 'canceled') {
                      const url = pendingNestPhoto
                        ? `/grove/new-tree?pendingNestPhoto=${pendingNestPhoto}`
                        : '/grove/new-tree'
                      router.push(url)
                    }
                  }}
                  className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-dashed transition-soft ${
                    grove.status === 'canceled'
                      ? 'border-border-subtle cursor-not-allowed opacity-50'
                      : 'border-border-subtle hover:border-firefly-dim/50 cursor-pointer group'
                  }`}
                >
                  {/* Empty Tree Outline */}
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    className="group-hover:scale-110 transition-transform opacity-30"
                  >
                    <rect x="36" y="50" width="8" height="25" fill="currentColor" className="text-text-muted" />
                    <ellipse cx="40" cy="40" rx="20" ry="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-text-muted" />
                  </svg>

                  <div className="text-center">
                    <div className="text-sm text-text-muted">
                      Available
                    </div>
                  </div>
                </div>
              </Tooltip>
            ))}
            </div>
          </div>

          {(grove.trees?.length || 0) === 0 && (
            <div className="text-center mt-8 p-8 bg-bg-dark border border-border-subtle rounded-lg">
              <p className="text-text-muted mb-4">
                Click an empty tree slot above to plant your first tree
              </p>
            </div>
          )}

          {/* Rooted Legacy Trees Section */}
          {grove.rootedPersons && grove.rootedPersons.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl text-text-soft">
                  Rooted Legacy Trees
                </h2>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  Don't use tree slots
                </span>
              </div>
              <p className="text-text-muted text-sm mb-6">
                Legacy trees from the Open Grove that you care for and manage. These don't count against your tree limit.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grove.rootedPersons.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => {
                      const url = pendingNestPhoto
                        ? `/tree/${person.id}?pendingNestPhoto=${pendingNestPhoto}`
                        : `/tree/${person.id}`
                      router.push(url)
                    }}
                    className="bg-bg-dark border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-soft cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg text-text-soft font-medium">{person.name}</h3>
                      <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                        Rooted
                      </span>
                    </div>
                    {person.birthDate && person.deathDate && (
                      <p className="text-sm text-text-muted mb-2">
                        {new Date(person.birthDate).getFullYear()} — {new Date(person.deathDate).getFullYear()}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>💫 {person.memoryCount} memories</span>
                      <span>🌿 {person._count.branches} branches</span>
                    </div>
                  </div>
                ))}
              </div>
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

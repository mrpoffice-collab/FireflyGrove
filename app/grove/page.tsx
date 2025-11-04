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
import TreasureChestModal from '@/components/TreasureChestModal'
import TreasureWelcomeModal from '@/components/TreasureWelcomeModal'
import { getPlanById } from '@/lib/plans'
import { SkeletonTreeCard, SkeletonPersonCard, SkeletonGrid, SkeletonTitle, SkeletonText } from '@/components/SkeletonLoader'
import { useToast } from '@/lib/toast'

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

interface SharedBranch {
  id: string
  title: string
  description: string | null
  personStatus: string
  owner: {
    id: string
    name: string
    grove: {
      id: string
      name: string
    } | null
  }
  person: {
    id: string
    name: string
    isLegacy: boolean
  } | null
  entries: Array<{
    createdAt: string
  }>
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
  const toast = useToast()
  const [grove, setGrove] = useState<Grove | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [groveName, setGroveName] = useState('')
  const [transplantable, setTransplantable] = useState<TransplantablePerson[]>([])
  const [transplanting, setTransplanting] = useState<string | null>(null)
  const [pendingNestPhoto, setPendingNestPhoto] = useState<string | null>(null)
  const [sharedBranches, setSharedBranches] = useState<SharedBranch[]>([])
  const [loadingShared, setLoadingShared] = useState(false)

  // Firefly Burst state
  const [showBurst, setShowBurst] = useState(false)
  const [burstMemories, setBurstMemories] = useState<any[]>([])
  const [burstId, setBurstId] = useState<string | null>(null)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const [burstSnoozed, setBurstSnoozed] = useState(false)

  // Audio Sparks state
  const [showAudioSparks, setShowAudioSparks] = useState(false)

  // Treasure Chest state
  const [showTreasure, setShowTreasure] = useState(false)
  const [treasureGlowTrail, setTreasureGlowTrail] = useState(0)
  const [showTreasureWelcome, setShowTreasureWelcome] = useState(false)
  const [hasSeenTreasureWelcome, setHasSeenTreasureWelcome] = useState(false)

  // Check for pending nest photo from URL and preview parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)

      // Nest photo handling
      const nestPhotoParam = urlParams.get('pendingNestPhoto')
      if (nestPhotoParam) {
        setPendingNestPhoto(nestPhotoParam)
      }

      // Preview parameter for testing popups/announcements (admin/testing)
      // Usage: /grove?preview=treasureWelcome
      const preview = urlParams.get('preview')
      if (preview === 'treasureWelcome') {
        setShowTreasureWelcome(true)
        setHasSeenTreasureWelcome(true)
        // Clean up URL
        window.history.replaceState({}, '', '/grove')
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
      fetchSharedBranches()
      // Check if bursts are snoozed before triggering
      checkBurstSnooze()
      // Check treasure status
      checkTreasureStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Check treasure status and show modal if needed
  const checkTreasureStatus = async () => {
    try {
      const res = await fetch('/api/treasure/status')
      if (res.ok) {
        const data = await res.json()
        setTreasureGlowTrail(data.currentStreak || 0)

        // Check if this is their first time (no treasures yet)
        const isFirstTime = data.treasureCount === 0 && !hasSeenTreasureWelcome

        // Check localStorage to see if they've dismissed welcome before
        if (isFirstTime && typeof window !== 'undefined') {
          const dismissed = localStorage.getItem('treasureWelcomeDismissed')
          if (!dismissed) {
            setShowTreasureWelcome(true)
            setHasSeenTreasureWelcome(true)
            return // Don't show regular treasure modal yet
          }
        }

        // Show modal if should show and not already completed today
        if (data.shouldShowModal && !data.todayCompleted) {
          setShowTreasure(true)
        }
      }
    } catch (error) {
      console.error('Failed to check treasure status:', error)
    }
  }

  // Handle treasure save - refresh streak
  const handleTreasureSave = () => {
    checkTreasureStatus()
  }

  // Handle treasure welcome close
  const handleTreasureWelcomeClose = () => {
    setShowTreasureWelcome(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('treasureWelcomeDismissed', 'true')
    }
    // Now show the regular treasure modal
    setShowTreasure(true)
  }

  // Check if bursts are currently snoozed
  const checkBurstSnooze = () => {
    if (typeof window === 'undefined') return

    const snoozeUntil = localStorage.getItem('fireflyBurstSnoozeUntil')
    if (snoozeUntil) {
      const snoozeTime = parseInt(snoozeUntil)
      const now = Date.now()

      if (now < snoozeTime) {
        // Still snoozed
        setBurstSnoozed(true)
        return
      } else {
        // Snooze expired, clear it
        localStorage.removeItem('fireflyBurstSnoozeUntil')
      }
    }

    // Not snoozed, trigger burst
    setBurstSnoozed(false)
    generateBurst()
  }

  // Snooze bursts for 3 hours
  const snoozeBursts = () => {
    if (typeof window === 'undefined') return

    const threeHours = 3 * 60 * 60 * 1000 // 3 hours in milliseconds
    const snoozeUntil = Date.now() + threeHours
    localStorage.setItem('fireflyBurstSnoozeUntil', snoozeUntil.toString())
    setBurstSnoozed(true)
    setShowBurst(false)
    toast.success('Firefly Bursts snoozed for 3 hours')
  }

  // Unsnooze bursts manually
  const unsnoozeBursts = () => {
    if (typeof window === 'undefined') return

    localStorage.removeItem('fireflyBurstSnoozeUntil')
    setBurstSnoozed(false)
    toast.success('Firefly Bursts re-enabled!')
    generateBurst()
  }

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

  const fetchSharedBranches = async () => {
    setLoadingShared(true)
    try {
      const res = await fetch('/api/branches/shared')
      if (res.ok) {
        const data = await res.json()
        setSharedBranches(data.sharedBranches || [])
      }
    } catch (error) {
      console.error('Failed to fetch shared branches:', error)
    } finally {
      setLoadingShared(false)
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
        toast.success(`"${personName}" has been transplanted to your grove!`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to transplant tree')
      }
    } catch (error) {
      console.error('Failed to transplant tree:', error)
      toast.error('Failed to transplant tree')
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
      <div className="min-h-screen">
        <Header userName={session?.user?.name || 'User'} />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <SkeletonTitle className="w-64 mb-2" />
            <SkeletonText className="w-96" />
          </div>

          {/* Trees Section */}
          <div className="mb-12">
            <SkeletonTitle className="w-48 mb-6" />
            <SkeletonGrid count={3} ItemComponent={SkeletonTreeCard} columns={3} />
          </div>

          {/* Persons Section */}
          <div className="mb-12">
            <SkeletonTitle className="w-48 mb-6" />
            <SkeletonGrid count={4} ItemComponent={SkeletonPersonCard} columns={2} />
          </div>
        </div>
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
        onTreasureClick={() => setShowTreasure(true)}
        treasureGlowTrail={treasureGlowTrail}
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
          onSnooze={snoozeBursts}
        />
      )}

      {/* Audio Sparks Modal */}
      {showAudioSparks && (
        <AudioSparks
          onClose={() => setShowAudioSparks(false)}
          branches={grove.allBranches || []}
        />
      )}

      {/* Treasure Welcome Modal - for first-time users */}
      {showTreasureWelcome && (
        <TreasureWelcomeModal
          onClose={handleTreasureWelcomeClose}
        />
      )}

      {/* Treasure Chest Modal */}
      {showTreasure && (
        <TreasureChestModal
          onClose={() => setShowTreasure(false)}
          onSave={handleTreasureSave}
        />
      )}

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Transplantable Trees Section */}
          {transplantable.length > 0 && (
            <div className="mb-6 sm:mb-8 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl text-firefly-glow font-medium mb-2 flex items-center gap-2">
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
                    className="bg-bg-dark border border-border-subtle rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg text-text-soft font-medium truncate">{person.name}</h3>
                      <p className="text-xs sm:text-sm text-text-muted line-clamp-2">
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
                        className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                      >
                        {transplanting === person.id ? 'Transplanting...' : 'Transplant to My Grove'}
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
              {isAtCapacity && (
                <p className="text-sm text-warning-text mt-3">
                  ⚠️ Your grove is at capacity ({grove.treeLimit} trees). Upgrade your plan to transplant more trees.
                </p>
              )}
            </div>
          )}

          {/* Grove Header */}
          <div className="mb-6 sm:mb-8 text-center">
            {isEditingName ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 mb-4">
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
                  className="text-2xl sm:text-4xl font-light bg-bg-dark border border-firefly-dim/50 rounded px-3 py-2 text-text-soft focus:outline-none focus:border-firefly-glow text-center min-h-[44px]"
                  autoFocus
                  maxLength={100}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRenameGrove}
                    className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setGroveName(grove.name)
                      setIsEditingName(false)
                    }}
                    className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 bg-bg-dark hover:bg-border-subtle text-text-muted rounded text-sm transition-soft"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
                <h1 className="text-2xl sm:text-4xl font-light text-text-soft">
                  {grove.name}
                </h1>
                <Tooltip content="Rename your grove">
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-text-muted hover:text-firefly-glow transition-soft min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Rename your grove"
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
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {burstSnoozed ? (
                <button
                  onClick={unsnoozeBursts}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 rounded-lg text-sm font-medium transition-soft"
                  aria-label="Bursts snoozed for 3 hours - click to wake them"
                >
                  <span>😴</span>
                  <span className="hidden xs:inline">Bursts Snoozed</span>
                  <span className="xs:hidden">Snoozed</span>
                </button>
              ) : (
                <>
                  {burstMemories.length > 0 && (
                    <button
                      onClick={generateBurst}
                      className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-firefly-dim/20 hover:bg-firefly-dim/30 border border-firefly-dim/40 text-firefly-glow rounded-lg text-sm font-medium transition-soft"
                      aria-label="Generate another firefly burst of random memories"
                    >
                      <span>✨</span>
                      <span className="hidden xs:inline">Get Another Burst</span>
                      <span className="xs:hidden">Burst</span>
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setShowAudioSparks(true)}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-firefly-glow hover:bg-firefly-bright text-bg-darker rounded-lg text-sm font-medium transition-soft"
                aria-label="Record audio sparks for your branches"
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
          <div className="mb-6 sm:mb-8">
            {grove.status === 'past_due' && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 text-warning-text mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-warning-text font-medium mb-1 text-sm sm:text-base">Payment Issue</div>
                    <div className="text-text-muted text-xs sm:text-sm">
                      Your payment method needs attention. Please update your billing information to continue using all features.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {grove.status === 'canceled' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 text-error-text mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-error-text font-medium mb-1 text-sm sm:text-base">Subscription Canceled</div>
                    <div className="text-text-muted text-xs sm:text-sm mb-3">
                      Your grove is view-only. Reactivate your subscription to create new trees and memories.
                    </div>
                    <button
                      onClick={() => router.push('/billing')}
                      className="min-h-[44px] px-4 py-2.5 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 relative z-10">
            {/* Existing Trees */}
            {grove.trees?.map((tree) => (
              <button
                key={tree.id}
                onClick={() => {
                  const url = pendingNestPhoto
                    ? `/tree/${tree.id}?pendingNestPhoto=${pendingNestPhoto}`
                    : `/tree/${tree.id}`
                  router.push(url)
                }}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg hover:bg-bg-dark transition-soft cursor-pointer group min-h-[120px] sm:min-h-[140px]"
                aria-label={`View ${tree.name} tree with ${tree._count.branches} ${tree._count.branches === 1 ? 'branch' : 'branches'}`}
              >
                {/* Simple Olive Tree SVG */}
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 80 80"
                  className="sm:w-[80px] sm:h-[80px] group-hover:scale-110 transition-transform"
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
              </button>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: grove.treeLimit - treeCount }).map((_, index) => (
              <Tooltip
                key={`empty-${index}`}
                content={grove.status === 'canceled' ? 'Reactivate your subscription to plant new trees' : 'Click to plant a new tree'}
              >
                <button
                  onClick={() => {
                    if (grove.status !== 'canceled') {
                      const url = pendingNestPhoto
                        ? `/grove/new-tree?pendingNestPhoto=${pendingNestPhoto}`
                        : '/grove/new-tree'
                      router.push(url)
                    }
                  }}
                  disabled={grove.status === 'canceled'}
                  className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 border-dashed transition-soft min-h-[120px] sm:min-h-[140px] w-full ${
                    grove.status === 'canceled'
                      ? 'border-border-subtle cursor-not-allowed opacity-50'
                      : 'border-border-subtle hover:border-firefly-dim/50 cursor-pointer group'
                  }`}
                  aria-label="Plant a new tree"
                >
                  {/* Empty Tree Outline */}
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 80 80"
                    className="sm:w-[80px] sm:h-[80px] group-hover:scale-110 transition-transform opacity-30"
                  >
                    <rect x="36" y="50" width="8" height="25" fill="currentColor" className="text-text-muted" />
                    <ellipse cx="40" cy="40" rx="20" ry="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-text-muted" />
                  </svg>

                  <div className="text-center">
                    <div className="text-sm text-text-muted">
                      Available
                    </div>
                  </div>
                </button>
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
            <div className="mt-8 sm:mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl text-text-soft">
                  Rooted Legacy Trees
                </h2>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full self-start sm:self-auto">
                  Don't use tree slots
                </span>
              </div>
              <p className="text-text-muted text-sm mb-4 sm:mb-6">
                Legacy trees from the Open Grove that you care for and manage. These don't count against your tree limit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {grove.rootedPersons.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => {
                      const url = pendingNestPhoto
                        ? `/tree/${person.id}?pendingNestPhoto=${pendingNestPhoto}`
                        : `/tree/${person.id}`
                      router.push(url)
                    }}
                    className="bg-bg-dark border border-purple-500/30 rounded-lg p-3 sm:p-4 hover:border-purple-400/50 transition-soft cursor-pointer min-h-[100px] w-full text-left"
                    aria-label={`View ${person.name} rooted legacy tree with ${person.memoryCount} ${person.memoryCount === 1 ? 'memory' : 'memories'}`}
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
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shared Branches from Other Groves */}
          {sharedBranches.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl text-text-soft mb-2">
                  Shared with You
                </h2>
                <p className="text-text-muted text-sm">
                  Branches you've been invited to from other groves
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedBranches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => router.push(`/branch/${branch.id}`)}
                    className="bg-bg-dark border border-blue-500/30 rounded-lg p-4 hover:border-blue-400/50 transition-soft cursor-pointer w-full text-left"
                    aria-label={`View shared branch ${branch.title} from ${branch.owner.name} with ${branch._count.entries} ${branch._count.entries === 1 ? 'memory' : 'memories'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg text-text-soft font-medium flex-1">
                        {branch.title}
                      </h3>
                      <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded ml-2 whitespace-nowrap">
                        Shared
                      </span>
                    </div>

                    {branch.description && (
                      <p className="text-sm text-text-muted mb-2 line-clamp-2">
                        {branch.description}
                      </p>
                    )}

                    <div className="mb-3 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <span>🏡</span>
                        <span>
                          {branch.owner.grove?.name || `${branch.owner.name}'s Grove`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span>👤</span>
                        <span>Owner: {branch.owner.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        💫 {branch._count.entries} {branch._count.entries === 1 ? 'memory' : 'memories'}
                      </span>
                      {branch.person?.isLegacy && (
                        <span className="text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                          Legacy
                        </span>
                      )}
                    </div>

                    {branch.entries.length > 0 && (
                      <div className="mt-2 text-xs text-text-muted/70">
                        Last update: {new Date(branch.entries[0].createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </button>
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

'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import MemoryCard from '@/components/MemoryCard'
import MemoryModal from '@/components/MemoryModal'
import BranchSettingsModal from '@/components/BranchSettingsModal'
import UndoBanner from '@/components/UndoBanner'

interface Entry {
  id: string
  text: string
  visibility: string
  mediaUrl: string | null
  audioUrl: string | null
  createdAt: string
  author: {
    id: string
    name: string
  }
}

interface Branch {
  id: string
  title: string
  description: string | null
  personStatus: string
  birthDate: string | null
  deathDate: string | null
  legacyEnteredAt: string | null
  owner: {
    id: string
    name: string
  }
  person?: {
    id: string
    name: string
    isLegacy: boolean
    birthDate: string | null
    deathDate: string | null
    discoveryEnabled: boolean
    memoryLimit: number | null
    memoryCount: number
    trusteeId: string | null
    ownerId: string | null
    moderatorId: string | null
    trusteeExpiresAt: string | null
  }
  entries: Entry[]
}

export default function BranchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const branchId = params.branchId as string

  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewMemory, setShowNewMemory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUndoBanner, setShowUndoBanner] = useState(false)
  const [lastCreatedEntry, setLastCreatedEntry] = useState<{
    id: string
    createdAt: Date
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingBranch, setEditingBranch] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [adoptionPrompt, setAdoptionPrompt] = useState<string | null>(null)
  const [showAdoptionPrompt, setShowAdoptionPrompt] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && branchId) {
      fetchBranch()
    }
  }, [status, branchId])

  const fetchBranch = async () => {
    try {
      const res = await fetch(`/api/branches/${branchId}`)
      if (res.ok) {
        const data = await res.json()
        setBranch(data)
      } else {
        router.push('/grove')
      }
    } catch (error) {
      console.error('Failed to fetch branch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMemory = async (data: {
    text: string
    visibility: string
    legacyFlag: boolean
    mediaUrl?: string
    audioUrl?: string
  }) => {
    if (submitting) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/branches/${branchId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        // Successful creation - show undo banner
        setLastCreatedEntry({
          id: result.id,
          createdAt: new Date(result.createdAt),
        })
        setShowUndoBanner(true)

        // Check for memory status (50-memory adoption prompt)
        if (result.memoryStatus?.showAdoptionPrompt && result.memoryStatus.adoptionMessage) {
          setAdoptionPrompt(result.memoryStatus.adoptionMessage)
          setShowAdoptionPrompt(true)
        }

        await fetchBranch()
        setShowNewMemory(false)
      } else if (res.status === 409 && result.error === 'duplicate') {
        // Duplicate detected
        const confirm = window.confirm(
          `${result.message}\n\nDo you want to add it anyway?`
        )

        if (confirm) {
          // User confirmed - bypass duplicate check (we'll need to add a force parameter)
          const forceRes = await fetch(`/api/branches/${branchId}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, forceDuplicate: true }),
          })

          if (forceRes.ok) {
            const forceResult = await forceRes.json()
            setLastCreatedEntry({
              id: forceResult.id,
              createdAt: new Date(forceResult.createdAt),
            })
            setShowUndoBanner(true)
            await fetchBranch()
            setShowNewMemory(false)
          }
        }
      } else if (res.status === 403 && result.error === 'memory_limit_reached') {
        // Memory limit reached
        const adopt = window.confirm(
          `${result.message}\n\nWould you like to adopt this tree into your grove now?`
        )
        if (adopt) {
          router.push('/billing')
        }
      } else {
        alert(result.error || 'Failed to create memory')
      }
    } catch (error) {
      console.error('Failed to create memory:', error)
      alert('Failed to create memory')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUndo = async () => {
    setShowUndoBanner(false)
    setLastCreatedEntry(null)
    await fetchBranch() // Refresh to remove the undone entry
  }

  const handleDismissUndo = () => {
    setShowUndoBanner(false)
    setLastCreatedEntry(null)
  }

  const handleWithdraw = async (entryId: string) => {
    await fetchBranch() // Refresh to remove withdrawn entry
  }

  const handleHide = async (entryId: string) => {
    await fetchBranch() // Refresh to remove hidden entry
  }

  const handleEditBranch = () => {
    setEditTitle(branch?.title || '')
    setEditDescription(branch?.description || '')
    setEditingBranch(true)
  }

  const handleSaveBranch = async () => {
    if (!editTitle.trim()) {
      alert('Branch title cannot be empty')
      return
    }

    try {
      const res = await fetch(`/api/branches/${branchId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      })

      if (res.ok) {
        await fetchBranch()
        setEditingBranch(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update branch')
      }
    } catch (error) {
      console.error('Failed to update branch:', error)
      alert('Failed to update branch')
    }
  }

  const handleCancelEdit = () => {
    setEditingBranch(false)
    setEditTitle('')
    setEditDescription('')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading branch...</div>
      </div>
    )
  }

  if (!session || !branch) {
    return null
  }

  const livingPrompts = [
    "Describe a small thing that made you laugh today.",
    "What's a smell that brings you back?",
    "Tell me about a time you felt truly seen.",
    "What did they teach you without meaning to?",
    "Capture a quiet moment you don't want to forget.",
  ]

  const legacyPrompts = [
    "What's a story they told that you never want to forget?",
    "Describe a moment when their presence changed everything.",
    "What did their hands look like? What did they create?",
    "What would you want them to know, if you could tell them now?",
    "Share a memory that makes you smile through the tears.",
    "What's something they said that you still carry with you?",
    "Describe the way they made you feel safe.",
  ]

  const isLegacy = branch?.personStatus === 'legacy'
  const promptList = isLegacy ? legacyPrompts : livingPrompts
  const randomPrompt = promptList[Math.floor(Math.random() * promptList.length)]

  return (
    <div className="min-h-screen">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push('/grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Grove
          </button>

          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1
                    className={`text-3xl font-light ${
                      branch.personStatus === 'legacy'
                        ? 'text-[var(--legacy-text)]'
                        : 'text-text-soft'
                    }`}
                  >
                    {branch.title}
                  </h1>
                  {branch.owner.id === (session.user as any)?.id && (
                    <button
                      onClick={handleEditBranch}
                      className="text-text-muted hover:text-firefly-dim transition-soft"
                      title="Edit branch name"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                {branch.personStatus === 'legacy' && (() => {
                  // Use person dates if available (Person-based legacy), otherwise use branch dates (old legacy branches)
                  const birthDate = branch.person?.birthDate || branch.birthDate
                  const deathDate = branch.person?.deathDate || branch.deathDate

                  const formatDate = (dateStr: string) => {
                    const date = new Date(dateStr)
                    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  }

                  return (
                    <>
                      {birthDate && deathDate && (
                        <div className="text-text-muted text-sm mb-2">
                          {formatDate(birthDate)} — {formatDate(deathDate)}
                        </div>
                      )}
                      <p className="text-[var(--legacy-silver)] text-sm italic mb-3">
                        "Their light still flickers in every story we remember."
                      </p>
                    </>
                  )
                })()}
                {!branch.personStatus && branch.description && (
                  <p className="text-text-muted">{branch.description}</p>
                )}
              </div>
              {branch.owner.id === (session.user as any)?.id && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-text-muted hover:text-text-soft transition-soft"
                  title="Manage heirs and settings"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className={`rounded-lg p-6 mb-8 ${
            isLegacy
              ? 'bg-[var(--legacy-amber)]/5 border border-[var(--legacy-amber)]/30'
              : 'bg-bg-dark border border-firefly-dim/30'
          }`}>
            <p className={`text-sm italic mb-4 ${
              isLegacy ? 'text-[var(--legacy-text)]' : 'text-text-muted'
            }`}>
              "{randomPrompt}"
            </p>
            <button
              onClick={() => setShowNewMemory(true)}
              className={`w-full py-3 rounded font-medium transition-soft ${
                isLegacy
                  ? 'bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/40'
                  : 'bg-firefly-dim hover:bg-firefly-glow text-bg-dark'
              }`}
            >
              {isLegacy ? 'Light a Memory' : 'Add Memory'}
            </button>
          </div>

          <div className="space-y-6">
            {branch.entries.length === 0 ? (
              <div className={`text-center py-12 ${isLegacy ? 'text-[var(--legacy-text)]' : 'text-text-muted'}`}>
                {isLegacy ? (
                  <>
                    Every light in the Grove begins with one memory.<br />
                    Add your first below and let {branch.title.split(' ')[0]}'s story glow.
                  </>
                ) : (
                  'No memories yet. Add your first one above.'
                )}
              </div>
            ) : (
              branch.entries.map((entry) => (
                <MemoryCard
                  key={entry.id}
                  entry={entry}
                  branchOwnerId={branch.owner.id}
                  onWithdraw={handleWithdraw}
                  onHide={handleHide}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showNewMemory && (
        <MemoryModal
          onClose={() => setShowNewMemory(false)}
          onSave={handleCreateMemory}
          prompt={randomPrompt}
        />
      )}

      {showSettings && (
        <BranchSettingsModal
          branchId={branchId}
          onClose={() => setShowSettings(false)}
          onBranchUpdate={fetchBranch}
        />
      )}

      {showUndoBanner && lastCreatedEntry && (
        <UndoBanner
          entryId={lastCreatedEntry.id}
          createdAt={lastCreatedEntry.createdAt}
          onUndo={handleUndo}
          onDismiss={handleDismissUndo}
        />
      )}

      {showAdoptionPrompt && adoptionPrompt && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-bg-dark border border-[var(--legacy-amber)]/50 rounded-lg max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🌟</div>
              <h2 className="text-2xl text-[var(--legacy-text)] mb-4 font-light">
                A Growing Light
              </h2>
              <p className="text-text-soft whitespace-pre-line leading-relaxed">
                {adoptionPrompt}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAdoptionPrompt(false)}
                className="flex-1 py-3 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
              >
                Not Now
              </button>
              <button
                onClick={() => {
                  setShowAdoptionPrompt(false)
                  router.push('/billing')
                }}
                className="flex-1 py-3 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft"
              >
                Adopt This Tree
              </button>
            </div>

            <p className="text-text-muted text-xs text-center mt-4">
              You can continue adding up to 100 memories in the Open Grove
            </p>
          </div>
        </div>
      )}

      {editingBranch && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl text-text-soft mb-6">Edit Branch</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="Enter branch name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
                  placeholder="Add a description"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBranch}
                  className="flex-1 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

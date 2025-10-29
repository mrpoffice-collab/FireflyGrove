'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import MemoryCard from '@/components/MemoryCard'
import MemoryModal from '@/components/MemoryModal'
import BranchSettingsModal from '@/components/BranchSettingsModal'
import UndoBanner from '@/components/UndoBanner'
import { getActiveChallenge, getRandomSpark, getRandomSparkExcluding, SparkCollection } from '@/lib/sparks'

interface Entry {
  id: string
  text: string
  visibility: string
  mediaUrl: string | null
  videoUrl: string | null
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
  isPublicView?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export default function BranchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const branchId = params.branchId as string

  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showNewMemory, setShowNewMemory] = useState(false)
  const [prePopulatedPhoto, setPrePopulatedPhoto] = useState<{url: string, mediaType?: string, nestItemId?: string} | undefined>()
  const [showSettings, setShowSettings] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
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
  const [currentSpark, setCurrentSpark] = useState('')

  // Challenge Sparks
  const [challengeCollection, setChallengeCollection] = useState<SparkCollection | null>(null)
  const [currentChallengeSpark, setCurrentChallengeSpark] = useState('')

  // My Sparks (custom user sparks)
  const [customSparks, setCustomSparks] = useState<Array<{id: string, text: string}>>([])
  const [currentCustomSpark, setCurrentCustomSpark] = useState('')
  const [customSparksLoading, setCustomSparksLoading] = useState(true)

  // Person editing
  const [editingPerson, setEditingPerson] = useState(false)
  const [personName, setPersonName] = useState('')
  const [personBirthDate, setPersonBirthDate] = useState('')
  const [personDeathDate, setPersonDeathDate] = useState('')
  const [updatingPerson, setUpdatingPerson] = useState(false)
  const [deletingPerson, setDeletingPerson] = useState(false)

  useEffect(() => {
    // Load branch data regardless of auth status (API will handle public access)
    if (status !== 'loading' && branchId) {
      fetchBranch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, branchId])

  // Check for nest photo in URL params (from "Hatch from Nest")
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const nestPhotoParam = params.get('nestPhoto')

      if (nestPhotoParam) {
        try {
          const photoData = JSON.parse(decodeURIComponent(nestPhotoParam))
          setPrePopulatedPhoto(photoData)
          setShowNewMemory(true)

          // Clean up URL
          window.history.replaceState({}, '', `/branch/${branchId}`)
        } catch (error) {
          console.error('Failed to parse nest photo data:', error)
        }
      }
    }
  }, [branchId])

  // Initialize spark when branch data is loaded
  useEffect(() => {
    if (branch) {
      const isLegacy = branch.personStatus === 'legacy'
      const legacySparks = [
        "What's a story they told that you never want to forget?",
        "Describe a moment when their presence changed everything.",
        "What did their hands look like? What did they create?",
        "What would you want them to know, if you could tell them now?",
        "Share a memory that makes you smile through the tears.",
        "What's something they said that you still carry with you?",
        "Describe the way they made you feel safe.",
      ]
      const livingSparks = [
        "Describe a small thing that made you laugh today.",
        "What's a smell that brings you back?",
        "Tell me about a time you felt truly seen.",
        "What did they teach you without meaning to?",
        "Capture a quiet moment you don't want to forget.",
      ]
      const sparkList = isLegacy ? legacySparks : livingSparks
      if (!currentSpark) {
        setCurrentSpark(sparkList[Math.floor(Math.random() * sparkList.length)])
      }
    }
  }, [branch, currentSpark])

  // Initialize challenge sparks
  useEffect(() => {
    const activeChallenge = getActiveChallenge()
    if (activeChallenge && !challengeCollection) {
      setChallengeCollection(activeChallenge)
      const spark = getRandomSpark(activeChallenge)
      setCurrentChallengeSpark(spark.text)
    }
  }, [challengeCollection])

  // Fetch custom sparks
  useEffect(() => {
    async function fetchCustomSparks() {
      try {
        const response = await fetch('/api/sparks')
        if (response.ok) {
          const data = await response.json()
          // Filter to only user's custom sparks (not global ones)
          const userSparks = data.filter((spark: any) => !spark.isGlobal)
          setCustomSparks(userSparks)
          if (userSparks.length > 0 && !currentCustomSpark) {
            setCurrentCustomSpark(userSparks[0].text)
          }
        }
      } catch (error) {
        console.error('Error fetching custom sparks:', error)
      } finally {
        setCustomSparksLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchCustomSparks()
    }
  }, [status, currentCustomSpark])

  const fetchBranch = async (page = 1, append = false) => {
    try {
      const res = await fetch(`/api/branches/${branchId}?page=${page}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        if (append && branch) {
          // Append new entries to existing ones
          setBranch({
            ...data,
            entries: [...branch.entries, ...data.entries],
          })
        } else {
          setBranch(data)
        }
        // Set isAdmin from response if available
        if (data.isAdmin !== undefined) {
          setIsAdmin(data.isAdmin)
        }
      } else if (res.status === 401) {
        // Unauthorized - redirect to login for private branches
        router.push('/login')
      } else {
        // Other errors - go to grove or open grove
        router.push('/open-grove')
      }
    } catch (error) {
      console.error('Failed to fetch branch:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = async () => {
    if (!branch?.pagination?.hasMore || loadingMore) return

    setLoadingMore(true)
    const nextPage = (branch.pagination?.page || 1) + 1
    await fetchBranch(nextPage, true)
  }

  // Handle dropping media from The Nest
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const nestItemData = e.dataTransfer.getData('nestItem')
      if (nestItemData) {
        const nestItem = JSON.parse(nestItemData)
        setPrePopulatedPhoto({
          url: nestItem.photoUrl || nestItem.videoUrl,
          mediaType: nestItem.mediaType,
          nestItemId: nestItem.id,
        })
        setShowNewMemory(true)
      }
    } catch (error) {
      console.error('Failed to handle nest photo drop:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
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

  const handleEditPerson = () => {
    if (!branch?.person) return
    setPersonName(branch.person.name)
    // Extract just the date part without timezone conversion
    setPersonBirthDate(branch.person.birthDate ? branch.person.birthDate.split('T')[0] : '')
    setPersonDeathDate(branch.person.deathDate ? branch.person.deathDate.split('T')[0] : '')
    setEditingPerson(true)
  }

  const handleSavePerson = async () => {
    if (!branch?.person || !personName.trim()) {
      alert('Memorial name cannot be empty')
      return
    }

    setUpdatingPerson(true)

    try {
      const res = await fetch(`/api/persons/${branch.person.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personName.trim(),
          birthDate: personBirthDate || null,
          deathDate: personDeathDate || null,
        }),
      })

      if (res.ok) {
        await fetchBranch()
        setEditingPerson(false)
        alert('Memorial information updated successfully')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update memorial')
      }
    } catch (error) {
      console.error('Failed to update person:', error)
      alert('Failed to update memorial information')
    } finally {
      setUpdatingPerson(false)
    }
  }

  const handleCancelPersonEdit = () => {
    setEditingPerson(false)
    setPersonName('')
    setPersonBirthDate('')
    setPersonDeathDate('')
  }

  const handleDeletePerson = async () => {
    if (!branch?.person) return

    // Check if there are any memories
    if (branch.entries.length > 0) {
      alert('Cannot delete memorial tree with memories. Please delete all memories first.')
      return
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${branch.person.name}"?\n\nThis will permanently delete the memorial tree. This cannot be undone.`
    )

    if (!confirmed) return

    setDeletingPerson(true)

    try {
      const res = await fetch(`/api/persons/${branch.person.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Memorial tree deleted successfully')
        router.push('/grove')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete memorial')
      }
    } catch (error) {
      console.error('Failed to delete person:', error)
      alert('Failed to delete memorial tree')
    } finally {
      setDeletingPerson(false)
    }
  }

  const refreshSpark = () => {
    if (!branch) return

    const isLegacy = branch.personStatus === 'legacy'
    const legacySparks = [
      "What's a story they told that you never want to forget?",
      "Describe a moment when their presence changed everything.",
      "What did their hands look like? What did they create?",
      "What would you want them to know, if you could tell them now?",
      "Share a memory that makes you smile through the tears.",
      "What's something they said that you still carry with you?",
      "Describe the way they made you feel safe.",
    ]
    const livingSparks = [
      "Describe a small thing that made you laugh today.",
      "What's a smell that brings you back?",
      "Tell me about a time you felt truly seen.",
      "What did they teach you without meaning to?",
      "Capture a quiet moment you don't want to forget.",
    ]
    const sparkList = isLegacy ? legacySparks : livingSparks

    const newSpark = sparkList[Math.floor(Math.random() * sparkList.length)]
    // Make sure we get a different spark if possible
    if (sparkList.length > 1 && newSpark === currentSpark) {
      const filtered = sparkList.filter(s => s !== currentSpark)
      setCurrentSpark(filtered[Math.floor(Math.random() * filtered.length)])
    } else {
      setCurrentSpark(newSpark)
    }
  }

  const refreshChallengeSpark = () => {
    if (!challengeCollection) return

    const spark = getRandomSparkExcluding(challengeCollection, currentChallengeSpark)
    setCurrentChallengeSpark(spark.text)
  }

  const refreshCustomSpark = () => {
    if (customSparks.length === 0) return

    const availableSparks = customSparks.filter(s => s.text !== currentCustomSpark)
    if (availableSparks.length === 0 && customSparks.length > 0) {
      // If only one spark or we've cycled through all, start over
      setCurrentCustomSpark(customSparks[0].text)
    } else if (availableSparks.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSparks.length)
      setCurrentCustomSpark(availableSparks[randomIndex].text)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading branch...</div>
      </div>
    )
  }

  if (!branch) {
    return null
  }

  const isLegacy = branch.personStatus === 'legacy'
  const isPublicView = branch.isPublicView || false
  const isAuthenticated = status === 'authenticated' && session

  return (
    <div className="min-h-screen" onDrop={handleDrop} onDragOver={handleDragOver}>
      <Header userName={session?.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Public viewers go back to Open Grove, authenticated users to their grove */}
          <button
            onClick={() => router.push(isPublicView ? '/open-grove' : '/grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to {isPublicView ? 'Open Grove' : 'Grove'}
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
                  {/* Memory Limit Badge (Open Grove only) */}
                  {branch.person?.memoryLimit !== null && branch.person?.memoryLimit !== undefined && (
                    (() => {
                      const count = branch.person.memoryCount || 0
                      const limit = branch.person.memoryLimit
                      const percent = Math.round((count / limit) * 100)
                      const isUrgent = percent >= 95
                      const isWarning = percent >= 90

                      return (
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          isUrgent
                            ? 'bg-red-900/30 text-red-400 border border-red-500/50'
                            : isWarning
                            ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50'
                            : 'bg-blue-900/30 text-blue-400 border border-blue-500/50'
                        }`}>
                          {count}/{limit} memories ({percent}%)
                        </span>
                      )
                    })()
                  )}
                  {/* Only show edit buttons for authenticated owners */}
                  {!isPublicView && isAuthenticated && branch.owner.id === (session.user as any)?.id && (
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
                  {!isPublicView && isAuthenticated && branch.person && (
                    <>
                      <button
                        onClick={handleEditPerson}
                        className="text-text-muted hover:text-[var(--legacy-amber)] transition-soft"
                        title="Edit memorial information"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </button>
                      {branch.entries.length === 0 && (
                        <button
                          onClick={handleDeletePerson}
                          disabled={deletingPerson}
                          className="text-text-muted hover:text-red-400 transition-soft disabled:opacity-50"
                          title="Delete memorial tree"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
                {branch.personStatus === 'legacy' && (() => {
                  // Use person dates if available (Person-based legacy), otherwise use branch dates (old legacy branches)
                  const birthDate = branch.person?.birthDate || branch.birthDate
                  const deathDate = branch.person?.deathDate || branch.deathDate

                  const formatDate = (dateStr: string) => {
                    // Parse date string directly without timezone conversion
                    const datePart = dateStr.split('T')[0]
                    const [year, month, day] = datePart.split('-')
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
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
              {/* Only show settings button for authenticated owners */}
              {!isPublicView && isAuthenticated && branch.owner.id === (session.user as any)?.id && (
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

          {/* Story Sparks Section - Only for authenticated users */}
          {isAuthenticated && (
            <div className="mb-8">
              <h3 className={`text-lg font-medium mb-4 ${
                isLegacy ? 'text-[var(--legacy-text)]' : 'text-text-soft'
              }`}>
                Story Sparks
              </h3>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Story Spark - Rotating helpful prompts */}
              <div className={`rounded-lg p-4 ${
                isLegacy
                  ? 'bg-[var(--legacy-amber)]/5 border border-[var(--legacy-amber)]/30'
                  : 'bg-bg-dark border border-firefly-dim/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <h4 className={`text-sm font-medium ${
                      isLegacy ? 'text-[var(--legacy-text)]' : 'text-text-soft'
                    }`}>
                      Story Spark
                    </h4>
                  </div>
                  <button
                    onClick={refreshSpark}
                    className={`p-1 rounded transition-soft ${
                      isLegacy
                        ? 'text-[var(--legacy-amber)] hover:bg-[var(--legacy-amber)]/10'
                        : 'text-firefly-dim hover:bg-firefly-dim/10'
                    }`}
                    title="Get a different spark"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <p className={`text-xs italic mb-4 line-clamp-3 ${
                  isLegacy ? 'text-[var(--legacy-text)]/80' : 'text-text-muted'
                }`}>
                  "{currentSpark}"
                </p>
                <button
                  onClick={() => setShowNewMemory(true)}
                  className={`w-full py-2 text-sm rounded font-medium transition-soft ${
                    isLegacy
                      ? 'bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/40'
                      : 'bg-firefly-dim hover:bg-firefly-glow text-bg-dark'
                  }`}
                >
                  Light a Memory
                </button>
              </div>

              {/* Challenge Sparks - Admin/seasonal challenges */}
              {challengeCollection ? (
                <div className={`rounded-lg p-4 ${
                  isLegacy
                    ? 'bg-[var(--legacy-amber)]/5 border border-[var(--legacy-amber)]/30'
                    : 'bg-bg-dark border border-firefly-dim/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{challengeCollection.icon}</span>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className={`text-sm font-medium ${
                            isLegacy ? 'text-[var(--legacy-text)]' : 'text-text-soft'
                          }`}>
                            {challengeCollection.name}
                          </h4>
                          <span
                            className={`text-xs cursor-help ${
                              isLegacy ? 'text-[var(--legacy-text)]/60' : 'text-text-muted'
                            }`}
                            title={challengeCollection.description}
                          >
                            ⓘ
                          </span>
                        </div>
                        <p className={`text-xs ${
                          isLegacy ? 'text-[var(--legacy-text)]/60' : 'text-text-muted'
                        }`}>
                          Challenge Spark
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={refreshChallengeSpark}
                      className={`p-1 rounded transition-soft ${
                        isLegacy
                          ? 'text-[var(--legacy-amber)] hover:bg-[var(--legacy-amber)]/10'
                          : 'text-firefly-dim hover:bg-firefly-dim/10'
                      }`}
                      title="Get a different challenge spark"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs italic mb-4 line-clamp-3 ${
                    isLegacy ? 'text-[var(--legacy-text)]/80' : 'text-text-muted'
                  }`}>
                    "{currentChallengeSpark}"
                  </p>
                  <button
                    onClick={() => {
                      setCurrentSpark(currentChallengeSpark)
                      setShowNewMemory(true)
                    }}
                    className={`w-full py-2 text-sm rounded font-medium transition-soft ${
                      isLegacy
                        ? 'bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/40'
                        : 'bg-firefly-dim hover:bg-firefly-glow text-bg-dark'
                    }`}
                  >
                    Light a Memory
                  </button>
                </div>
              ) : (
                <div className={`rounded-lg p-4 ${
                  isLegacy
                    ? 'bg-[var(--legacy-amber)]/5 border border-[var(--legacy-amber)]/30'
                    : 'bg-bg-dark border border-firefly-dim/30'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🎯</span>
                    <h4 className={`text-sm font-medium ${
                      isLegacy ? 'text-[var(--legacy-text)]' : 'text-text-soft'
                    }`}>
                      Challenge Sparks
                    </h4>
                  </div>
                  <p className={`text-xs italic mb-4 line-clamp-3 ${
                    isLegacy ? 'text-[var(--legacy-text)]/80' : 'text-text-muted'
                  }`}>
                    "No active challenge at the moment. Check back soon!"
                  </p>
                  <button
                    disabled
                    className={`w-full py-2 text-sm rounded font-medium transition-soft opacity-50 cursor-not-allowed ${
                      isLegacy
                        ? 'bg-[var(--legacy-amber)]/20 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/40'
                        : 'bg-firefly-dim text-bg-dark'
                    }`}
                  >
                    No Active Challenge
                  </button>
                </div>
              )}

              {/* My Sparks - User's custom sparks */}
              <div className={`rounded-lg p-4 ${
                isLegacy
                  ? 'bg-[var(--legacy-amber)]/5 border border-[var(--legacy-amber)]/30'
                  : 'bg-bg-dark border border-firefly-dim/30'
              }`}>
                {customSparksLoading ? (
                  <div className="text-center py-8">
                    <p className="text-text-muted text-xs">Loading...</p>
                  </div>
                ) : customSparks.length === 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🪰</span>
                      <h4 className={`text-sm font-medium ${
                        isLegacy ? 'text-[var(--legacy-text)]' : 'text-text-soft'
                      }`}>
                        My Sparks
                      </h4>
                    </div>
                    <p className={`text-xs italic mb-4 line-clamp-3 ${
                      isLegacy ? 'text-[var(--legacy-text)]/80' : 'text-text-muted'
                    }`}>
                      "Create your own custom story sparks and save them for later"
                    </p>
                    <button
                      disabled
                      title="Custom spark upload coming soon!"
                      className={`w-full py-2 text-sm rounded font-medium transition-soft opacity-50 cursor-not-allowed ${
                        isLegacy
                          ? 'bg-[var(--legacy-amber)]/20 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/40'
                          : 'bg-firefly-dim text-bg-dark'
                      }`}
                    >
                      Create My First Spark
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🪰</span>
                        <h4 className={`text-sm font-medium ${
                          isLegacy ? 'text-[var(--legacy-text)]' : 'text-text-soft'
                        }`}>
                          My Sparks
                        </h4>
                      </div>
                      <button
                        onClick={refreshCustomSpark}
                        className={`p-1 rounded transition-soft ${
                          isLegacy
                            ? 'text-[var(--legacy-amber)] hover:bg-[var(--legacy-amber)]/10'
                            : 'text-firefly-dim hover:bg-firefly-dim/10'
                        }`}
                        title="Get a different spark"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    <p className={`text-xs italic mb-4 line-clamp-3 ${
                      isLegacy ? 'text-[var(--legacy-text)]/80' : 'text-text-muted'
                    }`}>
                      "{currentCustomSpark}"
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setCurrentSpark(currentCustomSpark)
                          setShowNewMemory(true)
                        }}
                        className={`w-full py-2 text-sm rounded font-medium transition-soft ${
                          isLegacy
                            ? 'bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/40'
                            : 'bg-firefly-dim hover:bg-firefly-glow text-bg-dark'
                        }`}
                      >
                        Light a Memory
                      </button>
                      <button
                        disabled
                        title="Custom spark management coming soon!"
                        className={`w-full py-1 text-xs rounded transition-soft opacity-50 cursor-not-allowed ${
                          isLegacy
                            ? 'text-[var(--legacy-text)]/60'
                            : 'text-text-muted'
                        }`}
                      >
                        Manage My Sparks ({customSparks.length})
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>
          )}

          {/* Public viewer CTA - Only show to non-authenticated users */}
          {isPublicView && !isAuthenticated && (
            <div className="mb-8">
              <div className="bg-[var(--legacy-amber)]/10 border border-[var(--legacy-amber)]/30 rounded-lg p-6 text-center">
                <h3 className="text-[var(--legacy-text)] font-medium mb-2">
                  Preserve This Memory
                </h3>
                <p className="text-text-muted text-sm mb-4">
                  Create a free account to adopt this memorial into your grove and add unlimited memories
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-soft rounded font-medium transition-soft border border-border-subtle"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="px-6 py-3 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft"
                  >
                    Create Free Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Memory Limit Warning Banner */}
          {branch.person?.memoryLimit !== null && branch.person?.memoryLimit !== undefined && (() => {
            const count = branch.person.memoryCount || 0
            const limit = branch.person.memoryLimit
            const percent = Math.round((count / limit) * 100)
            const remaining = limit - count

            if (percent >= 90) {
              return (
                <div className={`rounded-lg p-4 mb-6 ${
                  percent >= 100
                    ? 'bg-red-900/20 border-2 border-red-500/50'
                    : percent >= 95
                    ? 'bg-red-900/10 border border-red-500/40'
                    : 'bg-yellow-900/10 border border-yellow-500/40'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {percent >= 100 ? '🚫' : percent >= 95 ? '⚠️' : '💡'}
                    </span>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${
                        percent >= 100 ? 'text-red-400' : percent >= 95 ? 'text-red-300' : 'text-yellow-300'
                      }`}>
                        {percent >= 100
                          ? 'Memory Limit Reached'
                          : `Only ${remaining} ${remaining === 1 ? 'Memory' : 'Memories'} Remaining`
                        }
                      </h3>
                      <p className="text-sm text-text-muted mb-3">
                        {percent >= 100
                          ? `This tree has reached its ${limit} memory limit. Adopt this tree into your private grove for unlimited storage.`
                          : `This tree is at ${percent}% capacity (${count}/${limit}). Consider adopting it into your private grove for unlimited memories.`
                        }
                      </p>
                      <button
                        onClick={() => {
                          // For now, just show info. In production, this would trigger adoption flow
                          alert('Adoption feature: This would open the adoption dialog to move this tree into your private grove, removing the memory limit.')
                        }}
                        className={`text-sm px-4 py-2 rounded font-medium transition-soft ${
                          percent >= 100
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-bg-dark'
                        }`}
                      >
                        Adopt Tree for Unlimited Memories
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })()}

          {/* Trustee Expiration Warning */}
          {branch.person?.trusteeExpiresAt && (() => {
            const expiresAt = new Date(branch.person.trusteeExpiresAt)
            const now = new Date()
            const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const isExpired = daysUntilExpiry < 0
            const isUrgent = daysUntilExpiry <= 7 && daysUntilExpiry > 0
            const isWarning = daysUntilExpiry <= 30 && daysUntilExpiry > 7

            if (isExpired || isUrgent || isWarning) {
              return (
                <div className={`rounded-lg p-4 mb-6 ${
                  isExpired
                    ? 'bg-red-900/20 border-2 border-red-500/50'
                    : isUrgent
                    ? 'bg-orange-900/10 border border-orange-500/40'
                    : 'bg-blue-900/10 border border-blue-500/40'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {isExpired ? '⏰' : isUrgent ? '⚠️' : 'ℹ️'}
                    </span>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${
                        isExpired ? 'text-red-400' : isUrgent ? 'text-orange-300' : 'text-blue-300'
                      }`}>
                        {isExpired
                          ? `Trustee Period Expired ${Math.abs(daysUntilExpiry)} Days Ago`
                          : isUrgent
                          ? `Trustee Period Expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'Day' : 'Days'}`
                          : `Trustee Period Expires in ${daysUntilExpiry} Days`
                        }
                      </h3>
                      <p className="text-sm text-text-muted mb-3">
                        {isExpired
                          ? 'Your temporary trustee period has ended. Adopt this tree into your private grove to maintain permanent access and add unlimited memories.'
                          : 'Your trustee period for this Open Grove tree is expiring soon. Adopt it into your private grove for permanent ownership and unlimited memories.'
                        }
                      </p>
                      <button
                        onClick={() => {
                          alert('Adoption feature: This would open the adoption dialog.')
                        }}
                        className={`text-sm px-4 py-2 rounded font-medium transition-soft ${
                          isExpired || isUrgent
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Adopt Tree to Your Grove
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })()}

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
              <>
                {branch.entries.map((entry) => (
                  <MemoryCard
                    key={entry.id}
                    entry={entry}
                    branchOwnerId={branch.owner.id}
                    onWithdraw={handleWithdraw}
                    onHide={handleHide}
                  />
                ))}

                {/* Load More Button */}
                {branch.pagination?.hasMore && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow disabled:bg-gray-600 disabled:cursor-not-allowed text-bg-dark rounded-lg font-medium transition-soft"
                    >
                      {loadingMore ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More ({branch.pagination.total - branch.entries.length} remaining)
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Pagination Info */}
                {branch.pagination && branch.entries.length > 0 && (
                  <div className="text-center text-text-muted text-sm pt-4">
                    Showing {branch.entries.length} of {branch.pagination.total} memories
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showNewMemory && (
        <MemoryModal
          onClose={() => {
            setShowNewMemory(false)
            setPrePopulatedPhoto(undefined)
          }}
          onSave={handleCreateMemory}
          spark={currentSpark}
          onRefreshSpark={refreshSpark}
          currentBranchId={branchId}
          prePopulatedPhoto={prePopulatedPhoto}
          isAdmin={isAdmin}
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

      {editingPerson && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-bg-dark border border-[var(--legacy-amber)]/50 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl text-[var(--legacy-text)] mb-6">Edit Memorial Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Memorial Name
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-[var(--legacy-amber)] transition-soft"
                  placeholder="Enter memorial name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Birth Date (optional)
                </label>
                <input
                  type="date"
                  value={personBirthDate}
                  onChange={(e) => setPersonBirthDate(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-[var(--legacy-amber)] transition-soft"
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Death Date (optional)
                </label>
                <input
                  type="date"
                  value={personDeathDate}
                  onChange={(e) => setPersonDeathDate(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-[var(--legacy-amber)] transition-soft"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancelPersonEdit}
                  className="flex-1 py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePerson}
                  disabled={updatingPerson}
                  className="flex-1 py-2 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                >
                  {updatingPerson ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

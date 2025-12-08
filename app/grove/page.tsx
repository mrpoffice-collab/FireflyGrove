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
import HeirsGlowGuide from '@/components/glow-guides/HeirsGlowGuide'
import TreesVsBranchesGlowGuide from '@/components/glow-guides/TreesVsBranchesGlowGuide'
import SharingGlowGuide from '@/components/glow-guides/SharingGlowGuide'
import MultipleTreesGlowGuide from '@/components/glow-guides/MultipleTreesGlowGuide'
import BranchesOrganizationGlowGuide from '@/components/glow-guides/BranchesOrganizationGlowGuide'
import HeirConditionsGlowGuide from '@/components/glow-guides/HeirConditionsGlowGuide'
import MultipleHeirsGlowGuide from '@/components/glow-guides/MultipleHeirsGlowGuide'
import NestGlowGuide from '@/components/glow-guides/NestGlowGuide'
import GlowGuideReminder from '@/components/GlowGuideReminder'
import { getPlanById } from '@/lib/plans'
import { getGlowGuideManager } from '@/lib/glowGuideManager'
import { getGuideMetadata } from '@/lib/glowGuideMetadata'
import type { GlowGuideName } from '@/lib/glowGuideManager'
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
  treeId?: string
  treeName?: string
  sourceType?: 'tree' | 'person'
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
  // Version check - if you see this in console, deployment is live
  console.log('🔥 Firefly Grove v2025.01.12 - Burst fixes deployed')

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
  const [burstTriggered, setBurstTriggered] = useState(false)

  // Audio Sparks state
  const [showAudioSparks, setShowAudioSparks] = useState(false)

  // Treasure Chest state
  const [showTreasure, setShowTreasure] = useState(false)
  const [treasureGlowTrail, setTreasureGlowTrail] = useState(0)
  const [showTreasureWelcome, setShowTreasureWelcome] = useState(false)
  const [hasSeenTreasureWelcome, setHasSeenTreasureWelcome] = useState(false)

  // Discovery modals state
  const [showHeirsWelcome, setShowHeirsWelcome] = useState(false)
  const [showTreesWelcome, setShowTreesWelcome] = useState(false)
  const [showSharingWelcome, setShowSharingWelcome] = useState(false)
  const [showMultipleTrees, setShowMultipleTrees] = useState(false)
  const [showBranchesOrg, setShowBranchesOrg] = useState(false)
  const [showHeirConditions, setShowHeirConditions] = useState(false)
  const [showMultipleHeirs, setShowMultipleHeirs] = useState(false)
  const [showNestGuide, setShowNestGuide] = useState(false)

  // Glow Guide Reminder state
  const [guideToRemind, setGuideToRemind] = useState<{
    slug: string
    title: string
    guideName: GlowGuideName
  } | null>(null)

  // View mode state - trees view or all branches view
  const [viewMode, setViewMode] = useState<'trees' | 'branches'>('trees')
  const [expandedTrees, setExpandedTrees] = useState<Set<string>>(new Set())

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
      // Usage: /grove?preview=treasureWelcome or ?preview=heirsWelcome, etc.
      const preview = urlParams.get('preview')
      if (preview === 'treasureWelcome') {
        setShowTreasureWelcome(true)
        setHasSeenTreasureWelcome(true)
        // Clean up URL
        window.history.replaceState({}, '', '/grove')
      }

      // Check for discovery modal preview
      const glowGuideManager = getGlowGuideManager()
      const previewModal = glowGuideManager.checkPreview()
      if (previewModal === 'heirs') {
        setShowHeirsWelcome(true)
      } else if (previewModal === 'trees-branches') {
        setShowTreesWelcome(true)
      } else if (previewModal === 'sharing') {
        setShowSharingWelcome(true)
      } else if (previewModal === 'multiple-trees') {
        setShowMultipleTrees(true)
      } else if (previewModal === 'branches-organization') {
        setShowBranchesOrg(true)
      } else if (previewModal === 'heir-conditions') {
        setShowHeirConditions(true)
      } else if (previewModal === 'multiple-heirs') {
        setShowMultipleHeirs(true)
      } else if (previewModal === 'nest') {
        setShowNestGuide(true)
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

  // Smart redirect: if user has exactly 1 tree with 1 branch, go straight to branch
  useEffect(() => {
    if (!grove || loading || typeof window === 'undefined') return

    // Check if user explicitly wants to stay on grove (via URL param)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('stay') === 'true') return

    // Check if this is first visit or returning user who prefers grove view
    const preferGroveView = localStorage.getItem('preferGroveView')
    if (preferGroveView === 'true') return

    // Count total trees and branches
    const totalTrees = (grove.trees?.length || 0) + (grove.persons?.length || 0) + (grove.rootedPersons?.length || 0)
    const allBranches = grove.allBranches || []

    // Smart redirect: exactly 1 branch total -> go straight there
    if (totalTrees === 1 && allBranches.length === 1) {
      router.push(`/branch/${allBranches[0].id}`)
    }
  }, [grove, loading, router])

  // Check for discovery modal triggers after grove is loaded
  useEffect(() => {
    if (!grove || typeof window === 'undefined') return

    const glowGuideManager = getGlowGuideManager()

    // Calculate total memory count across all trees
    const totalMemories =
      (grove.trees?.reduce((sum, t) => sum + t.memoryCount, 0) || 0) +
      (grove.persons?.reduce((sum, p) => sum + p.memoryCount, 0) || 0) +
      (grove.rootedPersons?.reduce((sum, p) => sum + p.memoryCount, 0) || 0)

    // Check heirs count (would need API endpoint - for now assume 0 if not set)
    // This is the MOST CRITICAL modal - triggers after 3 memories
    // Using aggressive mode to show on every visit during development
    if (totalMemories >= 3 && glowGuideManager.canShow('heirs', true)) {
      // Check if user has heirs set up
      fetch('/api/heirs/count')
        .then(res => res.json())
        .then(data => {
          if (data.count === 0) {
            setShowHeirsWelcome(true)
          }
        })
        .catch(() => {
          // If API fails, show modal anyway as it's critical
          setShowHeirsWelcome(true)
        })
    }

    // Calculate total tree count (includes all tree types)
    const totalTreeCount = (grove.trees?.length || 0) + (grove.persons?.length || 0) + (grove.rootedPersons?.length || 0)

    // Trees vs Branches Welcome - Show if no trees and first time
    if (totalTreeCount === 0 && glowGuideManager.canShow('trees-branches', true)) {
      setShowTreesWelcome(true)
    }

    // Sharing Welcome - Show after 5 memories if no collaborators
    if (totalMemories >= 5 && glowGuideManager.canShow('sharing', true)) {
      // Check if user has invited anyone
      fetch('/api/collaborators/count')
        .then(res => res.json())
        .then(data => {
          if (data.count === 0) {
            setShowSharingWelcome(true)
          }
        })
        .catch(() => {
          // Silent fail - not as critical as heirs modal
        })
    }

    // Multiple Trees - Show when user has 1 tree but 20+ memories
    if (totalTreeCount === 1 && totalMemories >= 20 && glowGuideManager.canShow('multiple-trees')) {
      setTimeout(() => setShowMultipleTrees(true), 500)
    }

    // Branches Organization - Show when user has 1 tree with 30+ memories
    if (totalTreeCount >= 1 && totalMemories >= 30 && glowGuideManager.canShow('branches-organization')) {
      setTimeout(() => setShowBranchesOrg(true), 500)
    }

    // Heir Conditions - Show when user has 1+ heirs but hasn't set up conditions
    fetch('/api/heirs/count')
      .then(res => res.json())
      .then(data => {
        if (data.count >= 1 && glowGuideManager.canShow('heir-conditions')) {
          setTimeout(() => setShowHeirConditions(true), 500)
        }
      })
      .catch(() => {})

    // Multiple Heirs - Show when user has 10+ memories but only 1 heir
    fetch('/api/heirs/count')
      .then(res => res.json())
      .then(data => {
        if (data.count === 1 && totalMemories >= 10 && glowGuideManager.canShow('multiple-heirs')) {
          setTimeout(() => setShowMultipleHeirs(true), 500)
        }
      })
      .catch(() => {})

    // Nest Guide - Show when user has 20+ memories but never used The Nest
    if (totalMemories >= 20 && glowGuideManager.canShow('nest')) {
      setTimeout(() => setShowNestGuide(true), 500)
    }
  }, [grove])

  // Trigger burst after all popups are closed
  useEffect(() => {
    // Check if any popups are currently showing
    const anyPopupShowing =
      showTreasureWelcome ||
      showTreasure ||
      showHeirsWelcome ||
      showTreesWelcome ||
      showSharingWelcome ||
      showMultipleTrees ||
      showBranchesOrg ||
      showHeirConditions ||
      showMultipleHeirs ||
      showNestGuide ||
      showAudioSparks ||
      guideToRemind !== null

    // Burst is now user-triggered only via "Show Memory Burst" button
    // No auto-trigger to reduce friction during normal navigation
  }, [
    showTreasureWelcome,
    showTreasure,
    showHeirsWelcome,
    showTreesWelcome,
    showSharingWelcome,
    showMultipleTrees,
    showBranchesOrg,
    showHeirConditions,
    showMultipleHeirs,
    showNestGuide,
    showAudioSparks,
    guideToRemind,
    burstSnoozed,
    showBurst,
    burstTriggered,
    grove,
  ])

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

  // Handle discovery modal closes
  const handleHeirsWelcomeClose = (showReminder: boolean = false) => {
    const manager = getGlowGuideManager()
    manager.markShown('heirs')
    setShowHeirsWelcome(false)

    if (showReminder && !manager.hadReminderShown('heirs')) {
      const metadata = getGuideMetadata('heirs')
      setGuideToRemind({
        slug: metadata.slug,
        title: metadata.title,
        guideName: 'heirs',
      })
      manager.markDismissedWithReminder('heirs')
    }
  }

  const handleHeirsWelcomeAction = () => {
    // Close modal first
    handleHeirsWelcomeClose()

    // Heirs are set per-branch, so route to first available branch
    // Priority: regular branches > person branches > rooted persons
    if (grove?.trees && grove.trees.length > 0 && grove.trees[0].id) {
      // Route to first tree to select a branch
      router.push(`/tree/${grove.trees[0].id}?openHeirs=true`)
    } else if (grove?.persons && grove.persons.length > 0 && grove.persons[0].id) {
      // Route to first person tree
      router.push(`/tree/${grove.persons[0].id}?openHeirs=true`)
    } else if (grove?.allBranches && grove.allBranches.length > 0) {
      // Route directly to first branch with heirs tab open
      router.push(`/branch/${grove.allBranches[0].id}?tab=heirs`)
    } else {
      // No branches yet - guide them to create a tree first
      alert('First, plant a tree and create a branch. Then you can choose keepers for that branch.')
    }
  }

  const handleTreesWelcomeClose = (showReminder: boolean = false) => {
    const manager = getGlowGuideManager()
    manager.markShown('trees-branches')
    setShowTreesWelcome(false)

    if (showReminder && !manager.hadReminderShown('trees-branches')) {
      const metadata = getGuideMetadata('trees-branches')
      setGuideToRemind({
        slug: metadata.slug,
        title: metadata.title,
        guideName: 'trees-branches',
      })
      manager.markDismissedWithReminder('trees-branches')
    }
  }

  const handleTreesWelcomeAction = () => {
    // Navigate to create tree page
    router.push('/grove/new-tree')
  }

  const handleSharingWelcomeClose = (showReminder: boolean = false) => {
    const manager = getGlowGuideManager()
    manager.markShown('sharing')
    setShowSharingWelcome(false)

    if (showReminder && !manager.hadReminderShown('sharing')) {
      const metadata = getGuideMetadata('sharing')
      setGuideToRemind({
        slug: metadata.slug,
        title: metadata.title,
        guideName: 'sharing',
      })
      manager.markDismissedWithReminder('sharing')
    }
  }

  const handleSharingWelcomeAction = () => {
    // Close modal first
    handleSharingWelcomeClose()

    // Route to first available branch with sharing settings open
    if (grove?.allBranches && grove.allBranches.length > 0) {
      router.push(`/branch/${grove.allBranches[0].id}?openSharing=true`)
    } else if (grove?.trees && grove.trees.length > 0 && grove.trees[0].id) {
      // If no branches yet, route to first tree
      router.push(`/tree/${grove.trees[0].id}`)
    } else {
      // No branches or trees yet
      alert('First, plant a tree and create a branch. Then you can invite others to tend it with you.')
    }
  }

  // New guide handlers
  const handleMultipleTreesClose = (showReminder: boolean = false) => {
    const manager = getGlowGuideManager()
    manager.markShown('multiple-trees')
    setShowMultipleTrees(false)

    if (showReminder && !manager.hadReminderShown('multiple-trees')) {
      const metadata = getGuideMetadata('multiple-trees')
      setGuideToRemind({
        slug: metadata.slug,
        title: metadata.title,
        guideName: 'multiple-trees',
      })
      manager.markDismissedWithReminder('multiple-trees')
    }
  }

  const handleMultipleTreesAction = () => {
    handleMultipleTreesClose()
    router.push('/grove/new-tree')
  }

  const handleBranchesOrgClose = (showReminder: boolean = false) => {
    const manager = getGlowGuideManager()
    manager.markShown('branches-organization')
    setShowBranchesOrg(false)

    if (showReminder && !manager.hadReminderShown('branches-organization')) {
      const metadata = getGuideMetadata('branches-organization')
      setGuideToRemind({
        slug: metadata.slug,
        title: metadata.title,
        guideName: 'branches-organization',
      })
      manager.markDismissedWithReminder('branches-organization')
    }
  }

  const handleBranchesOrgAction = () => {
    handleBranchesOrgClose()
    // Route to knowledge bank article about branch organization
    router.push('/knowledge/organizing-with-branches')
  }

  const handleHeirConditionsClose = (showReminder: boolean = false) => {
    const manager = getGlowGuideManager()
    manager.markShown('heir-conditions')
    setShowHeirConditions(false)

    if (showReminder && !manager.hadReminderShown('heir-conditions')) {
      const metadata = getGuideMetadata('heir-conditions')
      setGuideToRemind({
        slug: metadata.slug,
        title: metadata.title,
        guideName: 'heir-conditions',
      })
      manager.markDismissedWithReminder('heir-conditions')
    }
  }

  const handleHeirConditionsAction = () => {
    handleHeirConditionsClose()
    // Route to first branch with heirs tab
    if (grove?.allBranches && grove.allBranches.length > 0) {
      router.push(`/branch/${grove.allBranches[0].id}?tab=heirs`)
    }
  }

  const handleMultipleHeirsClose = (showReminder: boolean = false) => {
    const manager = getGlowGuideManager()
    manager.markShown('multiple-heirs')
    setShowMultipleHeirs(false)

    if (showReminder && !manager.hadReminderShown('multiple-heirs')) {
      const metadata = getGuideMetadata('multiple-heirs')
      setGuideToRemind({
        slug: metadata.slug,
        title: metadata.title,
        guideName: 'multiple-heirs',
      })
      manager.markDismissedWithReminder('multiple-heirs')
    }
  }

  const handleMultipleHeirsAction = () => {
    handleMultipleHeirsClose()
    // Route to first branch with heirs tab
    if (grove?.allBranches && grove.allBranches.length > 0) {
      router.push(`/branch/${grove.allBranches[0].id}?tab=heirs`)
    }
  }

  const handleNestGuideClose = (showReminder: boolean = false) => {
    const manager = getGlowGuideManager()
    manager.markShown('nest')
    setShowNestGuide(false)

    if (showReminder && !manager.hadReminderShown('nest')) {
      const metadata = getGuideMetadata('nest')
      setGuideToRemind({
        slug: metadata.slug,
        title: metadata.title,
        guideName: 'nest',
      })
      manager.markDismissedWithReminder('nest')
    }
  }

  const handleNestGuideAction = () => {
    handleNestGuideClose()
    router.push('/nest')
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

    // Not snoozed, but DON'T trigger burst yet
    // Will be triggered after all popups are dismissed
    setBurstSnoozed(false)
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
    setBurstTriggered(false) // Allow burst to trigger again
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

      {/* Glow Guides */}
      {showHeirsWelcome && (
        <HeirsGlowGuide
          onClose={handleHeirsWelcomeClose}
          onAction={handleHeirsWelcomeAction}
        />
      )}

      {showTreesWelcome && (
        <TreesVsBranchesGlowGuide
          onClose={handleTreesWelcomeClose}
          onAction={handleTreesWelcomeAction}
        />
      )}

      {showSharingWelcome && (
        <SharingGlowGuide
          onClose={handleSharingWelcomeClose}
          onAction={handleSharingWelcomeAction}
        />
      )}

      {showMultipleTrees && (
        <MultipleTreesGlowGuide
          onClose={handleMultipleTreesClose}
          onAction={handleMultipleTreesAction}
        />
      )}

      {showBranchesOrg && (
        <BranchesOrganizationGlowGuide
          onClose={handleBranchesOrgClose}
          onAction={handleBranchesOrgAction}
        />
      )}

      {showHeirConditions && (
        <HeirConditionsGlowGuide
          onClose={handleHeirConditionsClose}
          onAction={handleHeirConditionsAction}
        />
      )}

      {showMultipleHeirs && (
        <MultipleHeirsGlowGuide
          onClose={handleMultipleHeirsClose}
          onAction={handleMultipleHeirsAction}
        />
      )}

      {showNestGuide && (
        <NestGlowGuide
          onClose={handleNestGuideClose}
          onAction={handleNestGuideAction}
        />
      )}

      {/* Glow Guide Reminder */}
      {guideToRemind && (
        <GlowGuideReminder
          guideSlug={guideToRemind.slug}
          guideTitle={guideToRemind.title}
          show={true}
          onClose={() => setGuideToRemind(null)}
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
                <Tooltip content="Click to restart Firefly Bursts">
                  <button
                    onClick={unsnoozeBursts}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 rounded-lg text-sm font-medium transition-soft"
                    aria-label="Click to restart Firefly Bursts"
                  >
                    <span>🔄</span>
                    <span className="hidden xs:inline">Restart Bursts</span>
                    <span className="xs:hidden">Restart</span>
                  </button>
                </Tooltip>
              ) : (
                <>
                  {(burstMemories.length > 0 || burstTriggered) && (
                    <Tooltip content="Show me memories from my past">
                      <button
                        onClick={() => {
                          setBurstTriggered(false)
                          generateBurst()
                        }}
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-firefly-dim/20 hover:bg-firefly-dim/30 border border-firefly-dim/40 text-firefly-glow rounded-lg text-sm font-medium transition-soft"
                        aria-label="Show me memories from my past"
                      >
                        <span>✨</span>
                        <span className="hidden xs:inline">Show Memory Burst</span>
                        <span className="xs:hidden">Burst</span>
                      </button>
                    </Tooltip>
                  )}
                </>
              )}
              <Tooltip content="Capture quick voice memories">
                <button
                  onClick={() => setShowAudioSparks(true)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-firefly-glow hover:bg-firefly-bright text-bg-darker rounded-lg text-sm font-medium transition-soft"
                  aria-label="Record audio sparks for your branches"
                >
                  <span>🎙️</span>
                  <span>Audio Sparks</span>
                </button>
              </Tooltip>
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

          {/* Recent Branches - Quick Access */}
          {grove.allBranches && grove.allBranches.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg text-text-soft font-medium flex items-center gap-2">
                  <span>⚡</span>
                  <span>Quick Access</span>
                </h2>
                <button
                  onClick={() => {
                    localStorage.setItem('preferGroveView', 'true')
                  }}
                  className="text-xs text-text-muted hover:text-text-soft transition-soft"
                >
                  Always show grove
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
                {[...grove.allBranches]
                  .filter(b => b.lastMemoryDate || b._count.entries > 0)
                  .sort((a, b) => {
                    if (!a.lastMemoryDate && !b.lastMemoryDate) return 0
                    if (!a.lastMemoryDate) return 1
                    if (!b.lastMemoryDate) return -1
                    return new Date(b.lastMemoryDate).getTime() - new Date(a.lastMemoryDate).getTime()
                  })
                  .slice(0, 5)
                  .map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => router.push(`/branch/${branch.id}`)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-bg-dark border border-border-subtle rounded-lg hover:border-firefly-dim/50 transition-soft text-left min-w-[140px] sm:min-w-0"
                    >
                      <span className="text-lg">{branch.personStatus === 'legacy' ? '🕯️' : '🌿'}</span>
                      <div className="min-w-0">
                        <div className="text-sm text-text-soft font-medium truncate max-w-[120px] sm:max-w-[150px]">
                          {branch.title}
                        </div>
                        <div className="text-xs text-text-muted">
                          {branch._count.entries} memories
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Shared Branches - Quick Access (moved from bottom) */}
          {sharedBranches.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg text-text-soft font-medium mb-3 flex items-center gap-2">
                <span>🤝</span>
                <span>Shared with You</span>
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
                {sharedBranches.slice(0, 5).map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => router.push(`/branch/${branch.id}`)}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-bg-dark border border-blue-500/30 rounded-lg hover:border-blue-400/50 transition-soft text-left min-w-[140px] sm:min-w-0"
                  >
                    <span className="text-lg">{branch.person?.isLegacy ? '🕯️' : '🌿'}</span>
                    <div className="min-w-0">
                      <div className="text-sm text-text-soft font-medium truncate max-w-[120px] sm:max-w-[150px]">
                        {branch.title}
                      </div>
                      <div className="text-xs text-text-muted truncate max-w-[120px] sm:max-w-[150px]">
                        from {branch.owner.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-bg-dark border border-border-subtle rounded-lg p-1">
              <button
                onClick={() => setViewMode('trees')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-soft ${
                  viewMode === 'trees'
                    ? 'bg-firefly-dim/30 text-firefly-glow'
                    : 'text-text-muted hover:text-text-soft'
                }`}
              >
                🌲 Trees
              </button>
              <button
                onClick={() => setViewMode('branches')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-soft ${
                  viewMode === 'branches'
                    ? 'bg-firefly-dim/30 text-firefly-glow'
                    : 'text-text-muted hover:text-text-soft'
                }`}
              >
                🌿 All Branches
              </button>
            </div>
            {viewMode === 'trees' && grove.status !== 'canceled' && (
              <button
                onClick={() => {
                  const url = pendingNestPhoto
                    ? `/grove/new-tree?pendingNestPhoto=${pendingNestPhoto}`
                    : '/grove/new-tree'
                  router.push(url)
                }}
                disabled={isAtCapacity}
                className="px-3 py-1.5 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + New Tree
              </button>
            )}
          </div>

          {/* All Branches View */}
          {viewMode === 'branches' && grove.allBranches && (
            <div className="mb-8">
              {grove.allBranches.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-lg">
                  <div className="text-4xl mb-3">🌿</div>
                  <p className="text-text-muted">No branches yet. Create a tree first!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grove.allBranches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => router.push(`/branch/${branch.id}`)}
                      className="bg-bg-dark border border-border-subtle rounded-lg p-4 hover:border-firefly-dim/50 transition-soft text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{branch.personStatus === 'legacy' ? '🕯️' : '🌿'}</span>
                        {branch.personStatus === 'legacy' && (
                          <span className="text-xs bg-[var(--legacy-amber)]/20 text-[var(--legacy-text)] px-2 py-0.5 rounded">
                            Legacy
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg text-text-soft font-medium mb-1">{branch.title}</h3>
                      <p className="text-xs text-text-muted mb-2">
                        in {branch.treeName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>💫 {branch._count.entries} memories</span>
                        {branch.lastMemoryDate && (
                          <span>Last: {new Date(branch.lastMemoryDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trees Grid with Firefly Background - Olive Grove Style */}
          {viewMode === 'trees' && (
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
            {grove.trees?.map((tree) => {
              const isExpanded = expandedTrees.has(tree.id)
              const treeBranches = grove.allBranches?.filter(b => b.treeId === tree.id) || []

              return (
                <div key={tree.id} className="relative">
                  <div
                    className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg hover:bg-bg-dark transition-soft group min-h-[120px] sm:min-h-[140px] ${isExpanded ? 'bg-bg-dark' : ''}`}
                  >
                    {/* Tree Icon - Click to navigate */}
                    <button
                      onClick={() => {
                        const url = pendingNestPhoto
                          ? `/tree/${tree.id}?pendingNestPhoto=${pendingNestPhoto}`
                          : `/tree/${tree.id}`
                        router.push(url)
                      }}
                      className="cursor-pointer"
                      aria-label={`View ${tree.name} tree with ${tree._count.branches} ${tree._count.branches === 1 ? 'branch' : 'branches'}`}
                    >
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 80 80"
                        className="sm:w-[80px] sm:h-[80px] group-hover:scale-110 transition-transform"
                      >
                        <rect x="36" y="50" width="8" height="25" fill="#8B7355" />
                        <ellipse cx="40" cy="35" rx="20" ry="15" fill="#9ca986" opacity="0.8" />
                        <ellipse cx="30" cy="40" rx="15" ry="12" fill="#9ca986" opacity="0.9" />
                        <ellipse cx="50" cy="40" rx="15" ry="12" fill="#9ca986" opacity="0.9" />
                        <ellipse cx="40" cy="45" rx="18" ry="10" fill="#b8c5a6" opacity="0.7" />
                        <ellipse cx="35" cy="32" rx="8" ry="6" fill="#c5d4b3" opacity="0.5" />
                      </svg>
                    </button>

                    <div className="text-center">
                      <div className="text-sm font-medium text-text-soft group-hover:text-firefly-glow transition-soft line-clamp-2 mb-1">
                        {tree.name}
                      </div>
                      {/* Expandable branches button */}
                      {tree._count.branches > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedTrees(prev => {
                              const next = new Set(prev)
                              if (next.has(tree.id)) {
                                next.delete(tree.id)
                              } else {
                                next.add(tree.id)
                              }
                              return next
                            })
                          }}
                          className="text-xs text-text-muted hover:text-firefly-glow transition-soft flex items-center gap-1 mx-auto"
                        >
                          <span>{tree._count.branches} {tree._count.branches === 1 ? 'branch' : 'branches'}</span>
                          <svg
                            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      ) : (
                        <div className="text-xs text-text-muted">No branches</div>
                      )}
                    </div>
                  </div>

                  {/* Expanded branches dropdown */}
                  {isExpanded && treeBranches.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-bg-darker border border-border-subtle rounded-lg shadow-lg p-2 space-y-1">
                      {treeBranches.map(branch => (
                        <button
                          key={branch.id}
                          onClick={() => router.push(`/branch/${branch.id}`)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-firefly-dim/20 transition-soft flex items-center gap-2"
                        >
                          <span>{branch.personStatus === 'legacy' ? '🕯️' : '🌿'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-text-soft truncate">{branch.title}</div>
                            <div className="text-xs text-text-muted">{branch._count.entries} memories</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

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
          )}

          {viewMode === 'trees' && (grove.trees?.length || 0) === 0 && (
            <div className="text-center mt-8 p-8 bg-bg-dark border border-border-subtle rounded-lg">
              <p className="text-text-muted mb-4">
                Click an empty tree slot above to plant your first tree
              </p>
            </div>
          )}

          {/* Rooted Legacy Trees Section */}
          {viewMode === 'trees' && grove.rootedPersons && grove.rootedPersons.length > 0 && (
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

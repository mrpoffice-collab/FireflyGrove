/**
 * Glow Guide Manager
 *
 * Manages all Glow Guides throughout the user journey.
 * Ensures guides show at the right time without overwhelming users.
 *
 * Guardrails:
 * - One guide per session maximum
 * - Each guide shows only once (localStorage tracking)
 * - Milestone-based triggers (not random)
 * - Preview mode for testing: ?preview=guideName
 */

export type GlowGuideName =
  // Original 6
  | 'trees-branches'
  | 'heirs'
  | 'sharing'
  | 'voice-memories'
  | 'photo-memories'
  | 'nest'
  // Core Memory Features (8)
  | 'audio-sparks'
  | 'firefly-bursts'
  | 'memory-threading'
  | 'story-sparks'
  | 'glowing-memories'
  | 'memory-editing'
  | 'memory-visibility'
  | 'memory-scheduling'
  // Products (7)
  | 'greeting-cards'
  | 'soundart'
  | 'forever-kit'
  | 'memory-book'
  | 'spark-collections'
  | 'treasure-milestones'
  | 'compass'
  // Organization (6)
  | 'multiple-trees'
  | 'branches-organization'
  | 'moving-memories'
  | 'transplanting-trees'
  | 'rooting-trees'
  | 'open-grove'
  // Collaboration/Sharing (5)
  | 'co-authoring'
  | 'approval-workflow'
  | 'branch-permissions'
  | 'member-removal'
  | 'shareable-links'
  // Legacy (4)
  | 'heir-conditions'
  | 'multiple-heirs'
  | 'moderator-role'
  | 'legacy-transfer'
  // Account & Settings (4)
  | 'subscription-tiers'
  | 'storage-limits'
  | 'import-features'
  | 'privacy-settings'
  // Mobile (3)
  | 'mobile-app'
  | 'mobile-photo-upload'
  | 'voice-capture-mobile'

interface GlowGuideState {
  seenGuides: GlowGuideName[]
  lastShownAt: number | null
  sessionGuideShown: boolean
  dismissedWithReminder: Set<GlowGuideName>
}

const STORAGE_KEY = 'fireflyGlowGuideState'
const MIN_SESSION_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours in ms

export class GlowGuideManager {
  private state: GlowGuideState

  constructor() {
    this.state = this.loadState()
    this.cleanupSession()
  }

  /**
   * Load state from localStorage
   */
  private loadState(): GlowGuideState {
    if (typeof window === 'undefined') {
      return {
        seenGuides: [],
        lastShownAt: null,
        sessionGuideShown: false,
        dismissedWithReminder: new Set(),
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          seenGuides: parsed.seenGuides || [],
          lastShownAt: parsed.lastShownAt || null,
          sessionGuideShown: false, // Always reset on page load
          dismissedWithReminder: new Set(parsed.dismissedWithReminder || []),
        }
      }
    } catch (e) {
      console.error('Failed to load glow guide state:', e)
    }

    return {
      seenGuides: [],
      lastShownAt: null,
      sessionGuideShown: false,
      dismissedWithReminder: new Set(),
    }
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        seenGuides: this.state.seenGuides,
        lastShownAt: this.state.lastShownAt,
        dismissedWithReminder: Array.from(this.state.dismissedWithReminder),
      }))
    } catch (e) {
      console.error('Failed to save glow guide state:', e)
    }
  }

  /**
   * Reset session flag if enough time has passed
   */
  private cleanupSession(): void {
    if (!this.state.lastShownAt) return

    const now = Date.now()
    const timeSince = now - this.state.lastShownAt

    if (timeSince >= MIN_SESSION_INTERVAL) {
      this.state.sessionGuideShown = false
    }
  }

  /**
   * Check if a guide should be shown
   *
   * @param aggressive - If true, ignores session limits (for testing/development)
   */
  canShow(guideName: GlowGuideName, aggressive = false): boolean {
    // In aggressive mode, only check if seen before
    if (aggressive) {
      return !this.state.seenGuides.includes(guideName)
    }

    // Never show more than one guide per session
    if (this.state.sessionGuideShown) {
      return false
    }

    // Never show a guide twice
    if (this.state.seenGuides.includes(guideName)) {
      return false
    }

    return true
  }

  /**
   * Check for preview mode in URL
   */
  checkPreview(): GlowGuideName | null {
    if (typeof window === 'undefined') return null

    const params = new URLSearchParams(window.location.search)
    const preview = params.get('preview')

    if (preview && this.isValidGuideName(preview)) {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
      return preview as GlowGuideName
    }

    return null
  }

  /**
   * Validate guide name
   */
  private isValidGuideName(name: string): boolean {
    const validNames: GlowGuideName[] = [
      'trees-branches', 'heirs', 'sharing', 'voice-memories', 'photo-memories', 'nest',
      'audio-sparks', 'firefly-bursts', 'memory-threading', 'story-sparks',
      'glowing-memories', 'memory-editing', 'memory-visibility', 'memory-scheduling',
      'greeting-cards', 'soundart', 'forever-kit', 'memory-book', 'spark-collections',
      'treasure-milestones', 'compass', 'multiple-trees', 'branches-organization',
      'moving-memories', 'transplanting-trees', 'rooting-trees', 'open-grove',
      'co-authoring', 'approval-workflow', 'branch-permissions', 'member-removal',
      'shareable-links', 'heir-conditions', 'multiple-heirs', 'moderator-role',
      'legacy-transfer', 'subscription-tiers', 'storage-limits', 'import-features',
      'privacy-settings', 'mobile-app', 'mobile-photo-upload', 'voice-capture-mobile',
    ]
    return validNames.includes(name as GlowGuideName)
  }

  /**
   * Mark a guide as shown
   */
  markShown(guideName: GlowGuideName): void {
    if (!this.state.seenGuides.includes(guideName)) {
      this.state.seenGuides.push(guideName)
    }
    this.state.lastShownAt = Date.now()
    this.state.sessionGuideShown = true
    this.saveState()
  }

  /**
   * Mark a guide as dismissed with reminder shown
   */
  markDismissedWithReminder(guideName: GlowGuideName): void {
    this.state.dismissedWithReminder.add(guideName)
    this.saveState()
  }

  /**
   * Check if user has seen a specific guide
   */
  hasSeen(guideName: GlowGuideName): boolean {
    return this.state.seenGuides.includes(guideName)
  }

  /**
   * Check if reminder was shown for this guide
   */
  hadReminderShown(guideName: GlowGuideName): boolean {
    return this.state.dismissedWithReminder.has(guideName)
  }

  /**
   * Reset all glow guide state (for testing)
   */
  reset(): void {
    this.state = {
      seenGuides: [],
      lastShownAt: null,
      sessionGuideShown: false,
      dismissedWithReminder: new Set(),
    }
    this.saveState()
  }

  /**
   * Reset a specific guide (for testing)
   */
  resetGuide(guideName: GlowGuideName): void {
    this.state.seenGuides = this.state.seenGuides.filter(g => g !== guideName)
    this.state.dismissedWithReminder.delete(guideName)
    this.saveState()
  }
}

// Singleton instance
let glowGuideManager: GlowGuideManager | null = null

export function getGlowGuideManager(): GlowGuideManager {
  if (!glowGuideManager) {
    glowGuideManager = new GlowGuideManager()
  }
  return glowGuideManager
}

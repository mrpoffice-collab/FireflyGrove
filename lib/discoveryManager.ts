/**
 * DiscoveryManager
 *
 * Manages progressive discovery modals throughout the user journey.
 * Ensures modals show at the right time without overwhelming users.
 *
 * Guardrails:
 * - One modal per session maximum
 * - Each modal shows only once (localStorage tracking)
 * - Milestone-based triggers (not random)
 * - Preview mode for testing: ?preview=modalName
 */

export type DiscoveryModalName =
  | 'treesWelcome'
  | 'heirsWelcome'
  | 'sharingWelcome'
  | 'voiceWelcome'
  | 'photoWelcome'
  | 'nestWelcome'
  | 'treasureWelcome'

interface DiscoveryState {
  seenModals: DiscoveryModalName[]
  lastShownAt: number | null
  sessionModalShown: boolean
}

const STORAGE_KEY = 'fireflyDiscoveryState'
const MIN_SESSION_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours in ms

export class DiscoveryManager {
  private state: DiscoveryState

  constructor() {
    this.state = this.loadState()
    this.cleanupSession()
  }

  /**
   * Load state from localStorage
   */
  private loadState(): DiscoveryState {
    if (typeof window === 'undefined') {
      return {
        seenModals: [],
        lastShownAt: null,
        sessionModalShown: false,
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          seenModals: parsed.seenModals || [],
          lastShownAt: parsed.lastShownAt || null,
          sessionModalShown: false, // Always reset on page load
        }
      }
    } catch (e) {
      console.error('Failed to load discovery state:', e)
    }

    return {
      seenModals: [],
      lastShownAt: null,
      sessionModalShown: false,
    }
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        seenModals: this.state.seenModals,
        lastShownAt: this.state.lastShownAt,
      }))
    } catch (e) {
      console.error('Failed to save discovery state:', e)
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
      this.state.sessionModalShown = false
    }
  }

  /**
   * Check if a modal should be shown
   */
  canShow(modalName: DiscoveryModalName): boolean {
    // Never show more than one modal per session
    if (this.state.sessionModalShown) {
      return false
    }

    // Never show a modal twice
    if (this.state.seenModals.includes(modalName)) {
      return false
    }

    return true
  }

  /**
   * Check for preview mode in URL
   */
  checkPreview(): DiscoveryModalName | null {
    if (typeof window === 'undefined') return null

    const params = new URLSearchParams(window.location.search)
    const preview = params.get('preview')

    if (preview && this.isValidModalName(preview)) {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
      return preview as DiscoveryModalName
    }

    return null
  }

  /**
   * Validate modal name
   */
  private isValidModalName(name: string): boolean {
    const validNames: DiscoveryModalName[] = [
      'treesWelcome',
      'heirsWelcome',
      'sharingWelcome',
      'voiceWelcome',
      'photoWelcome',
      'nestWelcome',
      'treasureWelcome',
    ]
    return validNames.includes(name as DiscoveryModalName)
  }

  /**
   * Mark a modal as shown
   */
  markShown(modalName: DiscoveryModalName): void {
    if (!this.state.seenModals.includes(modalName)) {
      this.state.seenModals.push(modalName)
    }
    this.state.lastShownAt = Date.now()
    this.state.sessionModalShown = true
    this.saveState()
  }

  /**
   * Check if user has seen a specific modal
   */
  hasSeen(modalName: DiscoveryModalName): boolean {
    return this.state.seenModals.includes(modalName)
  }

  /**
   * Reset all discovery state (for testing)
   */
  reset(): void {
    this.state = {
      seenModals: [],
      lastShownAt: null,
      sessionModalShown: false,
    }
    this.saveState()
  }

  /**
   * Reset a specific modal (for testing)
   */
  resetModal(modalName: DiscoveryModalName): void {
    this.state.seenModals = this.state.seenModals.filter(m => m !== modalName)
    this.saveState()
  }
}

// Singleton instance
let discoveryManager: DiscoveryManager | null = null

export function getDiscoveryManager(): DiscoveryManager {
  if (!discoveryManager) {
    discoveryManager = new DiscoveryManager()
  }
  return discoveryManager
}

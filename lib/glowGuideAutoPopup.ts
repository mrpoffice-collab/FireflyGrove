/**
 * Glow Guide Auto-Popup System
 *
 * This system triggers Glow Guides automatically to drive user engagement.
 * Designed to be "almost annoyingly" frequent to ensure users discover features.
 */

export interface GlowGuidePopupConfig {
  slug: string
  priority: number // Higher = more likely to show
  minSessionsBeforeShow: number // Minimum sessions before this guide appears
  maxTimesShown: number // Maximum times to show this guide
  cooldownMinutes: number // Minutes to wait before showing again
  triggers: PopupTrigger[]
}

export type PopupTrigger =
  | 'page-load'           // Show on any page load
  | 'idle-30s'            // Show after 30 seconds of inactivity
  | 'scroll-50'           // Show after scrolling 50% down page
  | 'return-visit'        // Show on return visit (not first session)
  | 'feature-unused'      // Show if user hasn't used the feature
  | 'time-on-site-2m'     // Show after 2 minutes on site
  | 'random-interval'     // Show at random intervals (5-15 minutes)

/**
 * Default popup configurations for all Glow Guides
 * Organized by strategic importance
 */
export const glowGuidePopupConfigs: GlowGuidePopupConfig[] = [
  // HIGH PRIORITY - Core engagement features (show early and often)
  {
    slug: 'audio-sparks-quick-capture',
    priority: 10,
    minSessionsBeforeShow: 0,
    maxTimesShown: 5,
    cooldownMinutes: 30,
    triggers: ['page-load', 'idle-30s', 'feature-unused'],
  },
  {
    slug: 'firefly-bursts-rediscover-memories',
    priority: 10,
    minSessionsBeforeShow: 1,
    maxTimesShown: 4,
    cooldownMinutes: 60,
    triggers: ['return-visit', 'idle-30s'],
  },
  {
    slug: 'the-nest-bulk-photo-uploads',
    priority: 9,
    minSessionsBeforeShow: 0,
    maxTimesShown: 3,
    cooldownMinutes: 45,
    triggers: ['page-load', 'feature-unused'],
  },
  {
    slug: 'inviting-family-members',
    priority: 9,
    minSessionsBeforeShow: 1,
    maxTimesShown: 4,
    cooldownMinutes: 120,
    triggers: ['return-visit', 'time-on-site-2m'],
  },

  // MEDIUM PRIORITY - Important features (show moderately)
  {
    slug: 'story-sparks-writing-prompts',
    priority: 7,
    minSessionsBeforeShow: 2,
    maxTimesShown: 3,
    cooldownMinutes: 90,
    triggers: ['idle-30s', 'random-interval'],
  },
  {
    slug: 'memory-threading-replies',
    priority: 7,
    minSessionsBeforeShow: 2,
    maxTimesShown: 3,
    cooldownMinutes: 90,
    triggers: ['scroll-50', 'feature-unused'],
  },
  {
    slug: 'choosing-keepers-heirs',
    priority: 8,
    minSessionsBeforeShow: 3,
    maxTimesShown: 5,
    cooldownMinutes: 180,
    triggers: ['return-visit', 'time-on-site-2m'],
  },

  // PRODUCTS - Show when users are engaged
  {
    slug: 'greeting-cards-memory-sharing',
    priority: 6,
    minSessionsBeforeShow: 5,
    maxTimesShown: 2,
    cooldownMinutes: 240,
    triggers: ['time-on-site-2m', 'random-interval'],
  },
  {
    slug: 'soundart-audio-wave-art',
    priority: 6,
    minSessionsBeforeShow: 5,
    maxTimesShown: 2,
    cooldownMinutes: 240,
    triggers: ['time-on-site-2m', 'random-interval'],
  },
  {
    slug: 'memorial-video-maker',
    priority: 6,
    minSessionsBeforeShow: 4,
    maxTimesShown: 2,
    cooldownMinutes: 240,
    triggers: ['time-on-site-2m'],
  },

  // LOWER PRIORITY - Advanced features (show to experienced users)
  {
    slug: 'multiple-trees-organization',
    priority: 4,
    minSessionsBeforeShow: 10,
    maxTimesShown: 2,
    cooldownMinutes: 360,
    triggers: ['random-interval'],
  },
  {
    slug: 'branch-permissions-access-control',
    priority: 4,
    minSessionsBeforeShow: 15,
    maxTimesShown: 2,
    cooldownMinutes: 360,
    triggers: ['random-interval'],
  },

  // Add default configs for remaining guides (lower priority)
  ...['glowing-memories-reactions', 'memory-editing-enhancement', 'memory-visibility-privacy',
      'memory-scheduling-future-release', 'recording-voice-memories', 'adding-photos-to-memories',
      'understanding-trees-and-branches', 'forever-kit-export-backup', 'memory-book-pdf-compilation',
      'spark-collections-organize-prompts', 'treasure-chest-milestones', 'compass-memory-intentions',
      'branches-organization-structure', 'moving-memories-reorganize', 'transplanting-trees-grove-transfer',
      'rooting-trees-family-connections', 'open-grove-public-memorials', 'co-authoring-joint-memories',
      'approval-workflow-review-contributions', 'member-removal-managing-collaborators',
      'shareable-links-quick-access', 'heir-conditions-release-timing', 'multiple-heirs-redundancy-planning',
      'moderator-role-trustee', 'legacy-transfer-immediate-handoff', 'subscription-tiers-plans',
      'storage-limits-management', 'import-features-migration', 'privacy-settings-account-control',
      'mobile-app-download', 'mobile-photo-upload-camera-integration', 'voice-capture-mobile-convenience'
  ].map(slug => ({
    slug,
    priority: 3,
    minSessionsBeforeShow: 5,
    maxTimesShown: 2,
    cooldownMinutes: 360,
    triggers: ['random-interval' as PopupTrigger],
  })),
]

/**
 * Local storage keys for tracking
 */
const STORAGE_KEYS = {
  sessionCount: 'fg_session_count',
  popupHistory: 'fg_popup_history',
  lastPopupTime: 'fg_last_popup_time',
  currentSession: 'fg_current_session',
}

export interface PopupHistory {
  slug: string
  timestamp: number
  timesShown: number
}

/**
 * Get user's session count
 */
export function getSessionCount(): number {
  if (typeof window === 'undefined') return 0
  const count = localStorage.getItem(STORAGE_KEYS.sessionCount)
  return count ? parseInt(count, 10) : 0
}

/**
 * Increment session count
 */
export function incrementSessionCount(): void {
  if (typeof window === 'undefined') return
  const count = getSessionCount() + 1
  localStorage.setItem(STORAGE_KEYS.sessionCount, count.toString())
}

/**
 * Get popup history for a specific guide
 */
export function getPopupHistory(slug: string): PopupHistory | null {
  if (typeof window === 'undefined') return null
  const history = localStorage.getItem(STORAGE_KEYS.popupHistory)
  if (!history) return null

  const allHistory: Record<string, PopupHistory> = JSON.parse(history)
  return allHistory[slug] || null
}

/**
 * Record that a popup was shown
 */
export function recordPopupShown(slug: string): void {
  if (typeof window === 'undefined') return

  const history = localStorage.getItem(STORAGE_KEYS.popupHistory)
  const allHistory: Record<string, PopupHistory> = history ? JSON.parse(history) : {}

  const existing = allHistory[slug]
  allHistory[slug] = {
    slug,
    timestamp: Date.now(),
    timesShown: existing ? existing.timesShown + 1 : 1,
  }

  localStorage.setItem(STORAGE_KEYS.popupHistory, JSON.stringify(allHistory))
  localStorage.setItem(STORAGE_KEYS.lastPopupTime, Date.now().toString())
}

/**
 * Check if enough time has passed since last popup
 */
export function canShowAnyPopup(minMinutes: number = 5): boolean {
  if (typeof window === 'undefined') return false

  const lastTime = localStorage.getItem(STORAGE_KEYS.lastPopupTime)
  if (!lastTime) return true

  const minutesSince = (Date.now() - parseInt(lastTime, 10)) / 1000 / 60
  return minutesSince >= minMinutes
}

/**
 * Check if a specific guide can be shown
 */
export function canShowGuide(config: GlowGuidePopupConfig): boolean {
  if (typeof window === 'undefined') return false

  const sessionCount = getSessionCount()
  if (sessionCount < config.minSessionsBeforeShow) return false

  const history = getPopupHistory(config.slug)
  if (history) {
    // Check if max times shown
    if (history.timesShown >= config.maxTimesShown) return false

    // Check cooldown
    const minutesSince = (Date.now() - history.timestamp) / 1000 / 60
    if (minutesSince < config.cooldownMinutes) return false
  }

  return canShowAnyPopup()
}

/**
 * Get next guide to show based on current trigger
 */
export function getNextGuideToShow(trigger: PopupTrigger): string | null {
  const eligibleConfigs = glowGuidePopupConfigs
    .filter(config =>
      config.triggers.includes(trigger) &&
      canShowGuide(config)
    )
    .sort((a, b) => b.priority - a.priority)

  if (eligibleConfigs.length === 0) return null

  // Add some randomness to avoid always showing the same guide
  const topConfigs = eligibleConfigs.slice(0, 3)
  const randomIndex = Math.floor(Math.random() * topConfigs.length)
  return topConfigs[randomIndex].slug
}

/**
 * Initialize session tracking
 */
export function initializeGlowGuideSession(): void {
  if (typeof window === 'undefined') return

  const currentSession = sessionStorage.getItem(STORAGE_KEYS.currentSession)
  if (!currentSession) {
    // New session
    incrementSessionCount()
    sessionStorage.setItem(STORAGE_KEYS.currentSession, Date.now().toString())
  }
}

/**
 * Reset all popup tracking (for testing/admin)
 */
export function resetPopupTracking(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEYS.sessionCount)
  localStorage.removeItem(STORAGE_KEYS.popupHistory)
  localStorage.removeItem(STORAGE_KEYS.lastPopupTime)
  sessionStorage.removeItem(STORAGE_KEYS.currentSession)
}

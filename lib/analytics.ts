/**
 * Privacy-Respecting Analytics Helper
 *
 * Tracks user behavior and feature usage WITHOUT storing personal content.
 *
 * Examples:
 * - ✅ Track: User created a branch
 * - ✅ Track: User attempted to send a card but abandoned
 * - ✅ Track: User used heart waveform style
 * - ❌ DON'T Track: The content of the branch
 * - ❌ DON'T Track: What they wrote in the card
 * - ❌ DON'T Track: The audio file contents
 */

interface TrackEventOptions {
  eventType: string
  category: string
  action: string
  metadata?: Record<string, any>
  sessionId?: string
  durationMs?: number
  isError?: boolean
  errorMessage?: string
  isSuccess?: boolean
  isAbandoned?: boolean
}

/**
 * Track an analytics event (Client-side)
 * Use this in React components
 */
export async function trackEvent(options: TrackEventOptions) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    })
  } catch (error) {
    // Fail silently - don't break the user experience if analytics fails
    console.debug('Analytics tracking failed:', error)
  }
}

/**
 * Server-side analytics tracking
 * Use this in API routes
 */
export async function trackEventServer(
  prisma: any,
  userId: string | null,
  options: Omit<TrackEventOptions, 'sessionId'>
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId,
        eventType: options.eventType,
        category: options.category,
        action: options.action,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        durationMs: options.durationMs,
        isError: options.isError ?? false,
        errorMessage: options.errorMessage,
        isSuccess: options.isSuccess ?? true,
        isAbandoned: options.isAbandoned ?? false,
      },
    })
  } catch (error) {
    // Fail silently
    console.debug('Server analytics tracking failed:', error)
  }
}

// Predefined event types for consistency
export const AnalyticsEvents = {
  // Branches
  BRANCH_CREATED: 'branch_created',
  BRANCH_VIEWED: 'branch_viewed',
  BRANCH_UPDATED: 'branch_updated',
  BRANCH_DELETED: 'branch_deleted',
  BRANCH_ARCHIVED: 'branch_archived',

  // Trees
  TREE_CREATED: 'tree_created',
  TREE_TRANSPLANTED: 'tree_transplanted',
  TREE_ROOTED: 'tree_rooted',
  TREE_ADOPTED: 'tree_adopted',

  // Memories/Entries
  MEMORY_CREATED: 'memory_created',
  MEMORY_UPLOADED: 'memory_uploaded',
  MEMORY_SHARED: 'memory_shared',
  MEMORY_DELETED: 'memory_deleted',

  // Cards
  CARD_DESIGNER_OPENED: 'card_designer_opened',
  CARD_STARTED: 'card_started',
  CARD_TEMPLATE_SELECTED: 'card_template_selected',
  CARD_SENTIMENT_SELECTED: 'card_sentiment_selected',
  CARD_PHOTO_ADDED: 'card_photo_added',
  CARD_CHECKOUT_STARTED: 'card_checkout_started',
  CARD_ABANDONED: 'card_abandoned',
  CARD_SENT: 'card_sent',
  CARD_VIEWED: 'card_viewed',

  // Soundwave Art
  SOUNDWAVE_STARTED: 'soundwave_started',
  SOUNDWAVE_AUDIO_UPLOADED: 'soundwave_audio_uploaded',
  SOUNDWAVE_STYLE_CHANGED: 'soundwave_style_changed',
  SOUNDWAVE_CUSTOMIZED: 'soundwave_customized',
  SOUNDWAVE_DOWNLOADED: 'soundwave_downloaded',
  SOUNDWAVE_CHECKOUT_STARTED: 'soundwave_checkout_started',
  SOUNDWAVE_ABANDONED: 'soundwave_abandoned',

  // Memorial Tributes
  TRIBUTE_STARTED: 'tribute_started',
  TRIBUTE_GENERATED: 'tribute_generated',
  TRIBUTE_DOWNLOADED: 'tribute_downloaded',

  // Auth
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Grove
  GROVE_CREATED: 'grove_created',
  GROVE_STATUS_CHECKED: 'grove_status_checked',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  FEATURE_FAILED: 'feature_failed',
} as const

export const AnalyticsCategories = {
  BRANCHES: 'branches',
  TREES: 'trees',
  MEMORIES: 'memories',
  CARDS: 'cards',
  SOUNDWAVE: 'soundwave',
  TRIBUTES: 'tributes',
  AUTH: 'auth',
  GROVE: 'grove',
  ERRORS: 'errors',
} as const

export const AnalyticsActions = {
  CREATED: 'created',
  VIEWED: 'viewed',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STARTED: 'started',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  FAILED: 'failed',
  DOWNLOADED: 'downloaded',
  UPLOADED: 'uploaded',
  SHARED: 'shared',
  CHECKOUT: 'checkout',
} as const

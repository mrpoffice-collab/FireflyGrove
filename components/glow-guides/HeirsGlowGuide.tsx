'use client'

/**
 * Glow Guide Metadata
 * Used by automation to generate Knowledge Bank articles
 */
export const glowGuideMetadata = {
  id: 'heirs',
  slug: 'choosing-your-keepers',
  title: 'Choosing Your Keepers',
  subtitle: 'Pass the Light',
  icon: '🕯️',
  category: 'LEGACY',
  tags: ['heirs', 'legacy', 'keepers', 'inheritance', 'planning'],
  difficulty: 'BEGINNER',
  timeToRead: 3,
  relatedArticles: ['legacy-release-conditions', 'multiple-heirs', 'moderator-role'],
  trigger: 'User has created 3+ memories but 0 heirs set',
  cta: 'Choose My Keepers',
  ctaAction: 'Opens branch settings with heir configuration',
}

interface HeirsGlowGuideProps {
  onClose: (showReminder?: boolean) => void
  onAction?: () => void
}

export default function HeirsGlowGuide({ onClose, onAction }: HeirsGlowGuideProps) {
  const handleChooseKeepers = () => {
    if (onAction) onAction()
    onClose(false) // No reminder when taking action
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-5 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block text-5xl sm:text-6xl mb-3 sm:mb-4 animate-pulse">🕯️</div>
          <h2 className="text-2xl sm:text-3xl font-light text-firefly-glow mb-2">
            Pass the Light
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Your memories deserve keepers</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed text-sm sm:text-base">
            You've planted three memories in your grove. These stories hold light that shouldn't fade when you're gone.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-text-soft">
          <p className="leading-relaxed text-sm sm:text-base">
            Choose who will receive your memories when you pass. They'll become keepers of your stories,
            ensuring the light you've captured continues to glow for generations.
          </p>

          <p className="text-xs sm:text-sm text-text-muted italic text-center">
            Your keepers won't have access until you decide. This is about peace of mind,
            knowing your stories will find the right hands.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <button
            onClick={handleChooseKeepers}
            className="w-full py-2.5 sm:py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-base sm:text-lg"
          >
            Choose My Keepers
          </button>
          <button
            onClick={() => onClose(true)}
            className="text-text-muted hover:text-text-soft text-sm transition-soft py-2"
          >
            Maybe later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/choosing-your-keepers"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about keepers →
          </a>
        </div>
      </div>
    </div>
  )
}

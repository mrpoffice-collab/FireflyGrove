'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'memory-visibility',
  slug: 'memory-visibility-privacy',
  title: 'Memory Visibility: Private vs Shared',
  subtitle: 'Control Who Sees What',
  icon: '👁️',
  category: 'CORE_FEATURES',
  tags: ['visibility', 'privacy', 'sharing', 'control', 'permissions'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['privacy-settings', 'sharing-memories', 'branch-permissions'],
  trigger: 'Creating first memory in shared branch',
  cta: 'Learn About Visibility',
  ctaAction: 'Opens visibility explanation overlay',
}

interface MemoryVisibilityGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MemoryVisibilityGlowGuide({ onClose, onAction }: MemoryVisibilityGlowGuideProps) {
  const handleLearn = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">👁️</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Control Who Sees What
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Privacy meets sharing</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            This branch has other members. You can choose what they see — now and after you're gone.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Not every memory is meant for everyone. Some are just for you. Some are gifts for family now. Some are treasures for heirs later.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">🔒</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Private memories</strong>
                <br />
                Only you can see these. Perfect for processing grief, planning surprises, or personal reflection.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">👨‍👩‍👧‍👦</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Shared now</strong>
                <br />
                Visible to branch members immediately. Great for ongoing family storytelling.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">⏰</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Revealed later</strong>
                <br />
                Set conditions for when heirs receive access — perfect for legacy planning.
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            You can change visibility settings anytime, even after saving.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleLearn}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Understand Visibility
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            I've got it
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/memory-visibility-privacy"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Memory Visibility →
          </a>
        </div>
      </div>
    </div>
  )
}

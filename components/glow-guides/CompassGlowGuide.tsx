'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'compass',
  slug: 'compass-intention-setting',
  title: 'Compass: Set Your Memory Intentions',
  subtitle: 'Guide Your Journey',
  icon: '🧭',
  category: 'PRODUCTS',
  tags: ['compass', 'goals', 'intentions', 'reflection', 'planning'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 3,
  relatedArticles: ['legacy-planning', 'memory-practice', 'spark-collections-prompt-organization'],
  trigger: 'First visit to /compass',
  cta: 'Set Your First Intention',
  ctaAction: 'Opens compass intention creator',
}

interface CompassGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function CompassGlowGuide({ onClose, onAction }: CompassGlowGuideProps) {
  const handleSet = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">🧭</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Guide Your Journey
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Where will your memory practice take you?</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've started preserving memories. Now, set an intention for what you want to create.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Your Compass helps you set goals, track progress, and stay focused on what matters most in your memory preservation journey.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Clear intentions</strong>
                <br />
                "Record 50 childhood memories" or "Complete Dad's life story by his birthday"
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">📊</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Track your progress</strong>
                <br />
                Visual progress bars and milestones keep you motivated
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Gentle reminders</strong>
                <br />
                Stay on track with optional nudges toward your goals
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            Set as many intentions as you want, or keep it simple with just one focus.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSet}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Set Your First Intention
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            Explore first
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/compass-intention-setting"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Compass →
          </a>
        </div>
      </div>
    </div>
  )
}

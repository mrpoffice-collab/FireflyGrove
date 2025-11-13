'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'treasure-chest-milestone',
  slug: 'treasure-chest-milestones',
  title: 'Treasure Chest Milestones: Celebrate Your Journey',
  subtitle: 'Unlock Special Rewards',
  icon: '🎊',
  category: 'PRODUCTS',
  tags: ['treasure-chest', 'milestones', 'achievements', 'streaks', 'rewards'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['treasure-chest-daily', 'daily-memory-practice', 'reflection-practice'],
  trigger: 'After 7 day streak, milestone reached',
  cta: 'View Your Milestone',
  ctaAction: 'Opens milestone celebration',
}

interface TreasureChestMilestoneGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function TreasureChestMilestoneGlowGuide({ onClose, onAction }: TreasureChestMilestoneGlowGuideProps) {
  const handleView = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">🎊</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Unlock Special Rewards
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Your consistency is paying off</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've reached a milestone in your memory practice. Time to open something special.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Your Treasure Chest grows richer as you show up for yourself. Milestones unlock unique reflections, insights, and surprises.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">🔥</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Streak rewards</strong>
                <br />
                7, 30, 100 days — each milestone brings something meaningful
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🎁</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Memory insights</strong>
                <br />
                See patterns in your reflections, themes that emerge, growth over time
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✨</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Shareable achievements</strong>
                <br />
                Celebrate publicly or keep your journey private — your choice
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            The real treasure? The habit you're building and the memories you're preserving.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleView}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            View Your Milestone
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            Save for later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/treasure-chest-milestones"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Milestones →
          </a>
        </div>
      </div>
    </div>
  )
}

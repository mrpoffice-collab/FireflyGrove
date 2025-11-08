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
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🎊</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Unlock Special Rewards
          </h2>
          <p className="text-text-muted text-sm">Your consistency is paying off</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've reached a milestone in your memory practice. Time to open something special.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Your Treasure Chest grows richer as you show up for yourself. Milestones unlock unique reflections, insights, and surprises.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔥</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Streak rewards</strong>
                <br />
                7, 30, 100 days — each milestone brings something meaningful
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Memory insights</strong>
                <br />
                See patterns in your reflections, themes that emerge, growth over time
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✨</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Shareable achievements</strong>
                <br />
                Celebrate publicly or keep your journey private — your choice
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            The real treasure? The habit you're building and the memories you're preserving.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleView}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            View Your Milestone
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Save for later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/treasure-chest-milestones"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Milestones →
          </a>
        </div>
      </div>
    </div>
  )
}

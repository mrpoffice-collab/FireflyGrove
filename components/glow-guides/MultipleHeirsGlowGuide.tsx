'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'multiple-heirs',
  slug: 'multiple-heirs-redundancy-planning',
  title: 'Multiple Heirs: Redundancy & Fairness',
  subtitle: 'More Than One Keeper',
  icon: '👨‍👩‍👧‍👦',
  category: 'LEGACY',
  tags: ['heirs', 'multiple', 'redundancy', 'fairness', 'keepers'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 3,
  relatedArticles: ['heir-conditions-release-timing', 'heirs-keepers', 'legacy-transfer'],
  trigger: '1 heir set, been active 30 days',
  cta: 'Add Another Keeper',
  ctaAction: 'Opens heir addition flow',
}

interface MultipleHeirsGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MultipleHeirsGlowGuide({ onClose, onAction }: MultipleHeirsGlowGuideProps) {
  const handleAdd = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">👨‍👩‍👧‍👦</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            More Than One Keeper
          </h2>
          <p className="text-text-muted text-sm">Redundancy, fairness, and peace of mind</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've chosen one keeper. Have you considered adding more?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Multiple heirs protect your legacy and honor different relationships. It's not about playing favorites — it's about ensuring nothing is lost.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Redundancy</strong>
                <br />
                If one person can't fulfill the role, another can step up
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">⚖️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Different trees, different heirs</strong>
                <br />
                Give your marriage tree to your spouse, childhood tree to siblings
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💝</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Shared inheritance</strong>
                <br />
                All your children receive the same memories — no one left out
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            You can set different conditions for each heir — ultimate flexibility.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Add Another Keeper
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            One is enough for now
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/multiple-heirs-redundancy-planning"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Multiple Heirs →
          </a>
        </div>
      </div>
    </div>
  )
}

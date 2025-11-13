'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'legacy-transfer',
  slug: 'legacy-transfer-immediate-handoff',
  title: 'Legacy Transfer: Immediate Handoff',
  subtitle: 'Transfer Ownership Now',
  icon: '🎁',
  category: 'LEGACY',
  tags: ['transfer', 'handoff', 'ownership', 'gifting', 'immediate'],
  difficulty: 'ADVANCED',
  timeToRead: 3,
  relatedArticles: ['transplanting-trees-grove-transfer', 'heir-conditions-release-timing', 'multiple-heirs-redundancy-planning'],
  trigger: 'Tree with heir, never used transfer',
  cta: 'Learn About Transfer',
  ctaAction: 'Opens transfer guide',
}

interface LegacyTransferGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function LegacyTransferGlowGuide({ onClose, onAction }: LegacyTransferGlowGuideProps) {
  const handleLearn = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">🎁</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Transfer Ownership Now
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Don't wait — give it today</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Sometimes the best time to pass on a legacy isn't after you're gone — it's right now.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Legacy Transfer gives full ownership to someone else immediately. Different from heirs (who wait) or moderators (who help) — this is a complete handoff.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">💝</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Gift their own story</strong>
                <br />
                You built Mom's tree? Transfer ownership so she controls it
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🏥</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">End-of-life planning</strong>
                <br />
                Transfer now while you can guide them through how to maintain it
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔄</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Simplify estate</strong>
                <br />
                Handle legacy transfers while living, not in probate
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            Transfer is permanent — make sure you're ready to let go completely.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleLearn}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Learn About Transfer
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            Not ready yet
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/legacy-transfer-immediate-handoff"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Legacy Transfer →
          </a>
        </div>
      </div>
    </div>
  )
}

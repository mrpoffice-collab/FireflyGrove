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
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🎁</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Transfer Ownership Now
          </h2>
          <p className="text-text-muted text-sm">Don't wait — give it today</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Sometimes the best time to pass on a legacy isn't after you're gone — it's right now.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Legacy Transfer gives full ownership to someone else immediately. Different from heirs (who wait) or moderators (who help) — this is a complete handoff.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">💝</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Gift their own story</strong>
                <br />
                You built Mom's tree? Transfer ownership so she controls it
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🏥</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">End-of-life planning</strong>
                <br />
                Transfer now while you can guide them through how to maintain it
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔄</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Simplify estate</strong>
                <br />
                Handle legacy transfers while living, not in probate
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Transfer is permanent — make sure you're ready to let go completely.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLearn}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Learn About Transfer
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Not ready yet
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/legacy-transfer-immediate-handoff"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Legacy Transfer →
          </a>
        </div>
      </div>
    </div>
  )
}

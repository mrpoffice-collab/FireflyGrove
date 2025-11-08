'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'heir-conditions',
  slug: 'heir-conditions-release-timing',
  title: 'Heir Conditions: When They Receive Access',
  subtitle: 'Control the Timing of Release',
  icon: '⏳',
  category: 'LEGACY',
  tags: ['heirs', 'conditions', 'timing', 'legacy', 'release'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 3,
  relatedArticles: ['heirs-keepers', 'memory-scheduling-future-release', 'legacy-transfer'],
  trigger: 'Set heir, but no conditions',
  cta: 'Set Release Conditions',
  ctaAction: 'Opens conditions configurator',
}

interface HeirConditionsGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function HeirConditionsGlowGuide({ onClose, onAction }: HeirConditionsGlowGuideProps) {
  const handleSet = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">⏳</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Control the Timing of Release
          </h2>
          <p className="text-text-muted text-sm">When will they receive your legacy?</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've chosen a keeper. Now decide when they get access to what you've preserved.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Heir conditions let you orchestrate the perfect moment — ensuring your legacy arrives when they're ready, when it matters most, or simply when you're gone.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🕊️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Upon passing</strong>
                <br />
                Traditional — they receive everything after you're no longer here
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎂</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Specific age or date</strong>
                <br />
                Release when they turn 18, 25, or on a meaningful anniversary
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎓</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Life milestone</strong>
                <br />
                Graduation, marriage, first child — you manually trigger the release
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Different branches can have different conditions — total flexibility.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSet}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Set Release Conditions
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Decide later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/heir-conditions-release-timing"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Heir Conditions →
          </a>
        </div>
      </div>
    </div>
  )
}

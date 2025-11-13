'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'multiple-trees',
  slug: 'multiple-trees-organization',
  title: 'Multiple Trees: Organize by Life',
  subtitle: 'Each Story Deserves Its Own Space',
  icon: '🌳',
  category: 'ORGANIZATION',
  tags: ['trees', 'organization', 'structure', 'planning', 'separation'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 2,
  relatedArticles: ['trees-vs-branches', 'memory-organization', 'branch-strategies'],
  trigger: 'Created 1 tree, been active 7 days',
  cta: 'Plant Another Tree',
  ctaAction: 'Opens tree creation flow',
}

interface MultipleTreesGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MultipleTreesGlowGuide({ onClose, onAction }: MultipleTreesGlowGuideProps) {
  const handlePlant = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">🌳</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Each Story Deserves Its Own Space
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Grow your grove</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Your first tree is growing beautifully. Ready to plant more?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Different parts of your life deserve different trees. Separate your own story from Mom's legacy. Keep your marriage memories distinct from childhood tales.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">👤</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Organize by person</strong>
                <br />
                Create trees for each family member — their story, their way
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">💍</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Organize by relationship</strong>
                <br />
                Your marriage, your children, your career — each gets its own space
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">⏳</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Organize by time period</strong>
                <br />
                Childhood tree, college years tree, retirement adventures tree
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            Trees can have different privacy settings, heirs, and purposes — total flexibility.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handlePlant}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Plant Another Tree
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            Not yet
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/multiple-trees-organization"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Multiple Trees →
          </a>
        </div>
      </div>
    </div>
  )
}

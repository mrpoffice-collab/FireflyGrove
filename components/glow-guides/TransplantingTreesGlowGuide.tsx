'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'transplanting-trees',
  slug: 'transplanting-trees-grove-transfer',
  title: 'Transplanting Trees: Move Between Groves',
  subtitle: 'Share or Consolidate Entire Trees',
  icon: '🌲',
  category: 'ORGANIZATION',
  tags: ['transplanting', 'trees', 'transfer', 'sharing', 'consolidation'],
  difficulty: 'ADVANCED',
  timeToRead: 3,
  relatedArticles: ['multiple-trees-organization', 'legacy-transfer', 'rooting-trees'],
  trigger: 'Multiple groves exist',
  cta: 'Learn About Transplanting',
  ctaAction: 'Opens transplanting guide',
}

interface TransplantingTreesGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function TransplantingTreesGlowGuide({ onClose, onAction }: TransplantingTreesGlowGuideProps) {
  const handleLearn = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🌲</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Share or Consolidate Entire Trees
          </h2>
          <p className="text-text-muted text-sm">Move trees between groves</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Sometimes a tree needs to move — to a family grove, to consolidate, or to gift someone their story.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Transplanting lets you move entire trees between groves while keeping everything intact — all memories, branches, permissions, and connections.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🤝</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Share ownership</strong>
                <br />
                Move a tree to a family grove so everyone can contribute and preserve it
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Gift complete stories</strong>
                <br />
                Transfer Mom's tree to her so she owns and manages her own legacy
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📚</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Consolidate collections</strong>
                <br />
                Bring scattered family trees together into one cohesive grove
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Transplanting requires permission from both grove owners — protection for everyone.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLearn}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Learn About Transplanting
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Not relevant yet
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/transplanting-trees-grove-transfer"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Transplanting Trees →
          </a>
        </div>
      </div>
    </div>
  )
}

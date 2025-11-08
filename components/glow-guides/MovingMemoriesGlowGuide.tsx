'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'moving-memories',
  slug: 'moving-memories-reorganization',
  title: 'Moving Memories: Reorganize as You Grow',
  subtitle: 'Flexibility to Rearrange',
  icon: '📦',
  category: 'ORGANIZATION',
  tags: ['moving', 'reorganization', 'flexibility', 'branches', 'management'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 2,
  relatedArticles: ['branches-organization-strategies', 'multiple-trees-organization', 'memory-editing-enhancement'],
  trigger: '20+ memories, never moved one',
  cta: 'Move a Memory',
  ctaAction: 'Opens memory move interface',
}

interface MovingMemoriesGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MovingMemoriesGlowGuide({ onClose, onAction }: MovingMemoriesGlowGuideProps) {
  const handleMove = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">📦</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Flexibility to Rearrange
          </h2>
          <p className="text-text-muted text-sm">Nothing is permanent</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Put something in the wrong place? Realized a better organization? You can move memories anytime.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            As your grove grows, you'll discover better ways to organize. Moving memories lets you refine your structure without losing anything.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔄</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Between branches</strong>
                <br />
                Realized a memory fits better elsewhere? Move it with one click.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🌲</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Between trees</strong>
                <br />
                Started in the wrong tree? Transfer memories to where they belong.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔗</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Keep connections</strong>
                <br />
                Moving preserves threads, replies, and all connections
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            You can move multiple memories at once when reorganizing large sections.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleMove}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Move a Memory
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Everything's good for now
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/moving-memories-reorganization"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Moving Memories →
          </a>
        </div>
      </div>
    </div>
  )
}

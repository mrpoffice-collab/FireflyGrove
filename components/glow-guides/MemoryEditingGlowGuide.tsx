'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'memory-editing',
  slug: 'memory-editing-enhancement',
  title: 'Memory Editing: Enrich Your Stories',
  subtitle: 'Memories Can Grow',
  icon: '✏️',
  category: 'CORE_FEATURES',
  tags: ['editing', 'updating', 'enriching', 'details', 'improvement'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['creating-memories', 'adding-details', 'memory-versioning'],
  trigger: 'Viewing own memory, never edited',
  cta: 'Edit This Memory',
  ctaAction: 'Opens memory editor',
}

interface MemoryEditingGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MemoryEditingGlowGuide({ onClose, onAction }: MemoryEditingGlowGuideProps) {
  const handleEdit = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">✏️</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Memories Can Grow
          </h2>
          <p className="text-text-muted text-sm">Add details as you remember them</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Did you remember something else? Notice a typo? Want to add a photo? You can edit anytime.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Memories aren't frozen in time — they're living documents. As you recall new details or find old photos, come back and enrich what you've preserved.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🧩</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Layer in details</strong>
                <br />
                Add names, dates, locations, or context as you remember them
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📸</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Add media anytime</strong>
                <br />
                Find an old photo? Add it. Want to record your voice telling it? Go ahead.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔍</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Fix and polish</strong>
                <br />
                Correct typos, clarify confusing parts, or expand on what matters most
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Don't worry about perfection on the first try. You can always come back.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleEdit}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Edit This Memory
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Not right now
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/memory-editing-enhancement"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Memory Editing →
          </a>
        </div>
      </div>
    </div>
  )
}

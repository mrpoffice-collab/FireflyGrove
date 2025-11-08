'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'co-authoring',
  slug: 'co-authoring-joint-memories',
  title: 'Co-Authoring: Write Memories Together',
  subtitle: 'Shared Experiences, Shared Stories',
  icon: '✍️',
  category: 'COLLABORATION',
  tags: ['co-authoring', 'collaboration', 'shared', 'joint', 'together'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 2,
  relatedArticles: ['memory-threading-replies', 'sharing-memories', 'family-collaboration'],
  trigger: 'Invited to branch, never co-authored',
  cta: 'Add a Joint Memory',
  ctaAction: 'Opens co-authoring memory creator',
}

interface CoAuthoringGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function CoAuthoringGlowGuide({ onClose, onAction }: CoAuthoringGlowGuideProps) {
  const handleCreate = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">✍️</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Shared Experiences, Shared Stories
          </h2>
          <p className="text-text-muted text-sm">Write memories together</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You're part of this tree now. Want to add a memory you both experienced?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Co-authoring lets multiple people contribute to a single memory — perfect for shared experiences, family events, or memories told from multiple perspectives.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">👥</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Multiple voices</strong>
                <br />
                Each person adds their part — richer together than alone
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎭</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Different perspectives</strong>
                <br />
                Same event, different viewpoints — the full picture emerges
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">⚡</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Real-time collaboration</strong>
                <br />
                Write together or take turns — it's flexible and fun
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Co-authored memories show who contributed what — credit where credit's due.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Add a Joint Memory
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
            href="/knowledge/co-authoring-joint-memories"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Co-Authoring →
          </a>
        </div>
      </div>
    </div>
  )
}

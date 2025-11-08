'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'memory-threading',
  slug: 'memory-threading-replies',
  title: 'Memory Threading: Join the Conversation',
  subtitle: 'Add Your Voice to Their Story',
  icon: '💬',
  category: 'CORE_FEATURES',
  tags: ['threading', 'replies', 'conversation', 'collaboration', 'family-dialogue'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['co-authoring', 'sharing-memories', 'family-collaboration'],
  trigger: 'Viewing someone else\'s memory, never replied',
  cta: 'Add a Reply',
  ctaAction: 'Opens reply composer',
}

interface MemoryThreadingGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MemoryThreadingGlowGuide({ onClose, onAction }: MemoryThreadingGlowGuideProps) {
  const handleReply = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">💬</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Add Your Voice to Their Story
          </h2>
          <p className="text-text-muted text-sm">Memories spark conversations</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            This memory sparked something in you. Don't let that moment pass — add your perspective.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Threading lets you add context, share your version of events, or simply say "I remember that too."
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔗</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Connected stories</strong>
                <br />
                Your reply stays linked to the original memory forever
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎭</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Multiple perspectives</strong>
                <br />
                The same event through different eyes enriches everyone's understanding
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💝</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Living memories</strong>
                <br />
                Threads turn memories into conversations across time
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Add text, voice, or photos — your reply can be as simple or rich as you want.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleReply}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Add a Reply
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
            href="/knowledge/memory-threading-replies"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Memory Threading →
          </a>
        </div>
      </div>
    </div>
  )
}

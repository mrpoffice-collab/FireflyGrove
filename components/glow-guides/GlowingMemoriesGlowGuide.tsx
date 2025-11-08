'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'glowing-memories',
  slug: 'glowing-memories-reactions',
  title: 'Glowing Memories: React to Stories',
  subtitle: 'Show Your Appreciation',
  icon: '✨',
  category: 'CORE_FEATURES',
  tags: ['reactions', 'glowing', 'engagement', 'appreciation', 'favorites'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['memory-threading-replies', 'sharing-memories', 'family-collaboration'],
  trigger: 'Viewing shared branch, never glowed',
  cta: 'Glow This Memory',
  ctaAction: 'Adds glow reaction to current memory',
}

interface GlowingMemoriesGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function GlowingMemoriesGlowGuide({ onClose, onAction }: GlowingMemoriesGlowGuideProps) {
  const handleGlow = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">✨</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Show Your Appreciation
          </h2>
          <p className="text-text-muted text-sm">Let memories glow with your love</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            This memory touched you. Let the author know — give it a glow.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Glowing is our way of saying "this matters to me" — a gentle way to show appreciation without interrupting the intimacy of the memory.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">💛</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">More than a like</strong>
                <br />
                A glow says "this touched my heart" — deeper than a simple reaction
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔆</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Highlight what matters</strong>
                <br />
                Glowing memories rise to the top, helping families see what resonates most
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🌟</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Encourage storytellers</strong>
                <br />
                Knowing their memories touched someone inspires people to share more
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Glow as many memories as you want — there's no limit to appreciation.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGlow}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Glow This Memory
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Maybe later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/glowing-memories-reactions"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Glowing Memories →
          </a>
        </div>
      </div>
    </div>
  )
}

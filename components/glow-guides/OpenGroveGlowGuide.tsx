'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'open-grove',
  slug: 'open-grove-public-memorials',
  title: 'Open Grove: Public Memorial Space',
  subtitle: 'Share Legacy with the World',
  icon: '🌍',
  category: 'ORGANIZATION',
  tags: ['open-grove', 'public', 'memorials', 'discovery', 'community'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 3,
  relatedArticles: ['memory-visibility-privacy', 'shareable-links', 'legacy-planning'],
  trigger: 'Has legacy tree, not in Open Grove',
  cta: 'Add to Open Grove',
  ctaAction: 'Opens Open Grove submission',
}

interface OpenGroveGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function OpenGroveGlowGuide({ onClose, onAction }: OpenGroveGlowGuideProps) {
  const handleAdd = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🌍</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Share Legacy with the World
          </h2>
          <p className="text-text-muted text-sm">A public space for remembrance</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've preserved a beautiful legacy. Want to share it with people beyond your family?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Open Grove is our public memorial space where anyone can discover and honor remarkable lives. It's for those whose stories deserve to be found.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🕊️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Public memorials</strong>
                <br />
                Let friends, colleagues, and strangers pay respects and share memories
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔎</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Discoverable legacy</strong>
                <br />
                People searching for old friends or researching history can find this story
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Protected privacy</strong>
                <br />
                You control exactly what's public — keep private memories private
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Open Grove listings can be removed anytime — you're always in control.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Add to Open Grove
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Keep it private
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/open-grove-public-memorials"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Open Grove →
          </a>
        </div>
      </div>
    </div>
  )
}

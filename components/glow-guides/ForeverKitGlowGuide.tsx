'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'forever-kit',
  slug: 'forever-kit-export-backup',
  title: 'Forever Kit: Own Your Memories',
  subtitle: 'Export Everything, Anytime',
  icon: '📦',
  category: 'PRODUCTS',
  tags: ['export', 'backup', 'download', 'archive', 'ownership'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['memory-book', 'data-ownership', 'platform-independence'],
  trigger: '10+ memories, never exported',
  cta: 'Create Your First Forever Kit',
  ctaAction: 'Opens Forever Kit generator',
}

interface ForeverKitGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function ForeverKitGlowGuide({ onClose, onAction }: ForeverKitGlowGuideProps) {
  const handleCreate = () => {
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
            Export Everything, Anytime
          </h2>
          <p className="text-text-muted text-sm">Your memories, your files</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            We believe you should always own your memories. Export them whenever you want, in formats you can use anywhere.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            A Forever Kit is a complete package of your memories — text, audio, photos, everything — ready to download, archive, or take with you.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">💾</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Complete backup</strong>
                <br />
                Everything you've created, in organized folders with readable files
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔓</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Platform-independent</strong>
                <br />
                PDFs, audio files, images — formats that work anywhere, forever
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Shareable archives</strong>
                <br />
                Give family a USB drive of memories, or send digital packages
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Pro tip: Export regularly to keep an offline backup of your growing collection.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Create Forever Kit
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
            href="/knowledge/forever-kit-export-backup"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Forever Kit →
          </a>
        </div>
      </div>
    </div>
  )
}

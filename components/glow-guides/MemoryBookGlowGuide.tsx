'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'memory-book',
  slug: 'memory-book-pdf-compilation',
  title: 'Memory Book: Beautiful Printed Stories',
  subtitle: 'From Digital to Physical',
  icon: '📖',
  category: 'PRODUCTS',
  tags: ['book', 'pdf', 'printing', 'gifts', 'compilation'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['forever-kit-export-backup', 'greeting-cards-memory-sharing', 'legacy-planning'],
  trigger: 'Branch with 15+ memories',
  cta: 'Generate Preview',
  ctaAction: 'Creates memory book preview',
}

interface MemoryBookGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MemoryBookGlowGuide({ onClose, onAction }: MemoryBookGlowGuideProps) {
  const handleGenerate = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">📖</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            From Digital to Physical
          </h2>
          <p className="text-text-muted text-sm">Stories worth holding</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've gathered enough memories to create something beautiful. Let's make a book.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            A Memory Book transforms your digital collection into a professionally formatted, printable volume — perfect for gifts, coffee tables, or legacy preservation.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">✨</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Beautifully formatted</strong>
                <br />
                Automatic layouts, typography, and photo placement — looks professionally designed
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Perfect gifts</strong>
                <br />
                Print for birthdays, anniversaries, or as legacy keepsakes
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📝</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Organize your way</strong>
                <br />
                Chronological, thematic, or custom — you control what goes in
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Download as PDF to print yourself, or order professional binding through our partners.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Generate Preview
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Browse examples
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/memory-book-pdf-compilation"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Memory Books →
          </a>
        </div>
      </div>
    </div>
  )
}

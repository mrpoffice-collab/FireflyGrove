'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'greeting-cards',
  slug: 'greeting-cards-memory-sharing',
  title: 'Greeting Cards: Share Memories Beautifully',
  subtitle: 'Turn Memories into Keepsakes',
  icon: '💌',
  category: 'PRODUCTS',
  tags: ['cards', 'gifts', 'sharing', 'sympathy', 'celebration'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['memory-book', 'soundart', 'sharing-memories'],
  trigger: 'Visiting /cards for first time',
  cta: 'Create Your First Card',
  ctaAction: 'Opens card creator',
}

interface GreetingCardsGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function GreetingCardsGlowGuide({ onClose, onAction }: GreetingCardsGlowGuideProps) {
  const handleCreate = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">💌</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Turn Memories into Keepsakes
          </h2>
          <p className="text-text-muted text-sm">More meaningful than any Hallmark</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            The memories you've preserved can become beautiful cards — digital or printed, for any occasion.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Whether it's sympathy, celebration, or just "thinking of you" — a card with a real memory means infinitely more than store-bought words.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🕊️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Sympathy with substance</strong>
                <br />
                Share a memory of their loved one — something generic cards can never do
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎉</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Celebrations they'll keep</strong>
                <br />
                Birthdays, weddings, anniversaries — include a memory that connects
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📬</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Digital or printed</strong>
                <br />
                Send via email, social media, or order a physical card delivered to their door
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Choose from beautiful templates designed to let your memory shine.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Create Your First Card
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Browse templates first
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/greeting-cards-memory-sharing"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Greeting Cards →
          </a>
        </div>
      </div>
    </div>
  )
}

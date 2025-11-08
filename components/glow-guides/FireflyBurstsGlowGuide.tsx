'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'firefly-bursts',
  slug: 'firefly-bursts-memory-rediscovery',
  title: 'Firefly Bursts: Rediscover Your Memories',
  subtitle: 'Magic from What You Have Preserved',
  icon: '✨',
  category: 'CORE_FEATURES',
  tags: ['firefly-bursts', 'rediscovery', 'reflection', 'sharing', 'visualization'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['memory-visualization', 'sharing-bursts', 'reflection-practice'],
  trigger: 'User has 20+ memories but never generated a burst',
  cta: 'Create Your First Burst',
  ctaAction: 'Triggers burst generation',
}

interface FireflyBurstsGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function FireflyBurstsGlowGuide({ onClose, onAction }: FireflyBurstsGlowGuideProps) {
  const handleCreate = () => {
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
            Magic from What You've Preserved
          </h2>
          <p className="text-text-muted text-sm">Watch your memories come alive</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've captured many precious memories. Time to see them dance together.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Firefly Bursts take your memories and create a beautiful, shareable moment of reflection. Watch your words glow and fade like fireflies in the night.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🌟</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Unexpected rediscovery</strong>
                <br />
                See memories you'd forgotten, patterns you didn't notice
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Shareable moments</strong>
                <br />
                Send bursts to family or social media — beautiful and meaningful
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💭</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Reflection prompts</strong>
                <br />
                Each burst shows you what you've been thinking about lately
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Generate a new burst anytime — each one is unique and ephemeral.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Create Your First Burst
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
            href="/knowledge/firefly-bursts-memory-rediscovery"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Firefly Bursts →
          </a>
        </div>
      </div>
    </div>
  )
}

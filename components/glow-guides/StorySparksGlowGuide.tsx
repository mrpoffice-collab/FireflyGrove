'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'story-sparks',
  slug: 'story-sparks-writing-prompts',
  title: 'Story Sparks: Writing Prompts',
  subtitle: 'Never Face a Blank Page',
  icon: '📝',
  category: 'CORE_FEATURES',
  tags: ['sparks', 'prompts', 'writing', 'storytelling', 'inspiration'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['creating-memories', 'spark-collections', 'storytelling-tips'],
  trigger: 'Viewing sparks page, never used a prompt',
  cta: 'Use This Spark',
  ctaAction: 'Populates memory with prompt',
}

interface StorySparksGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function StorySparksGlowGuide({ onClose, onAction }: StorySparksGlowGuideProps) {
  const handleUseSpark = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">📝</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Never Face a Blank Page
          </h2>
          <p className="text-text-muted text-sm">Let prompts guide your stories</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            The hardest part of preserving memories? Knowing where to start. We've solved that.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Story Sparks are thoughtful questions designed to unlock memories you didn't even know you had.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🎯</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Curated questions</strong>
                <br />
                Each prompt is designed to spark specific, meaningful memories
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🌈</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Organized by theme</strong>
                <br />
                Childhood, career, family, love, loss — explore any area of life
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✍️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Make them your own</strong>
                <br />
                Use the prompt as-is or let it inspire your own direction
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Pro tip: Browse sparks when you have time, then write when inspiration strikes.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUseSpark}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Use This Spark
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Browse more
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/story-sparks-writing-prompts"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Story Sparks →
          </a>
        </div>
      </div>
    </div>
  )
}

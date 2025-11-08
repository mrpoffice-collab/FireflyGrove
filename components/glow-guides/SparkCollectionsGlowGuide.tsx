'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'spark-collections',
  slug: 'spark-collections-prompt-organization',
  title: 'Spark Collections: Organize Your Journey',
  subtitle: 'Curate Your Prompts',
  icon: '✨',
  category: 'PRODUCTS',
  tags: ['collections', 'prompts', 'organization', 'workflow', 'themes'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 2,
  relatedArticles: ['story-sparks-writing-prompts', 'audio-sparks-quick-capture', 'memory-organization'],
  trigger: 'Viewing /sparks, never created collection',
  cta: 'Create a Collection',
  ctaAction: 'Opens collection creator',
}

interface SparkCollectionsGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function SparkCollectionsGlowGuide({ onClose, onAction }: SparkCollectionsGlowGuideProps) {
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
            Curate Your Prompts
          </h2>
          <p className="text-text-muted text-sm">Build your own journey</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've been exploring our prompts. Ready to organize them your way?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Spark Collections let you group prompts by theme, create personal workflows, or design storytelling journeys for yourself or others.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">📚</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Themed collections</strong>
                <br />
                Group all your childhood prompts, relationship questions, or career reflections
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🗓️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Personal workflows</strong>
                <br />
                Create a 30-day challenge, anniversary project, or legacy writing plan
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💝</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Share with others</strong>
                <br />
                Send a collection to family as a storytelling gift or interview guide
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Collections can include our prompts, your own custom questions, or a mix of both.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Create a Collection
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Browse more sparks
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/spark-collections-prompt-organization"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Spark Collections →
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'branches-organization',
  slug: 'branches-organization-strategies',
  title: 'Branch Organization: Structure Your Stories',
  subtitle: 'Smart Ways to Organize Memories',
  icon: '🌿',
  category: 'ORGANIZATION',
  tags: ['branches', 'organization', 'structure', 'themes', 'chronological'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 2,
  relatedArticles: ['trees-vs-branches', 'multiple-trees-organization', 'memory-organization'],
  trigger: '3+ branches on one tree',
  cta: 'Learn Branch Strategies',
  ctaAction: 'Opens branch organization guide',
}

interface BranchesOrganizationGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function BranchesOrganizationGlowGuide({ onClose, onAction }: BranchesOrganizationGlowGuideProps) {
  const handleLearn = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">🌿</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Smart Ways to Organize Memories
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Structure that makes sense</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Your tree is branching out. Let's talk about how the pros organize their memories.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            There's no "right" way to organize branches, but some strategies work better than others. Find what feels natural for your story.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">📅</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">By decade or era</strong>
                <br />
                "1960s-1970s" | "College Years" | "The Florida Years"
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🎨</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">By theme</strong>
                <br />
                "Travel" | "Career" | "Relationships" | "Hobbies"
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">👥</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">By contributor</strong>
                <br />
                "Mom's memories" | "Sibling stories" | "Friend perspectives"
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            You can always reorganize later — branches can be renamed, merged, or moved.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleLearn}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Learn Branch Strategies
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            I'll figure it out
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/branches-organization-strategies"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Branch Organization →
          </a>
        </div>
      </div>
    </div>
  )
}

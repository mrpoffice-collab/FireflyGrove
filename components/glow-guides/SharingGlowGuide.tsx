'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'sharing',
  slug: 'inviting-family-members',
  title: 'Inviting Family Members',
  subtitle: 'Tend Your Grove Together',
  icon: '🤝',
  category: 'SHARING',
  tags: ['collaboration', 'sharing', 'family', 'invites', 'members'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['branch-permissions', 'co-authoring', 'managing-members'],
  trigger: 'User has 5+ memories but 0 collaborators invited',
  cta: 'Invite Someone to Garden',
  ctaAction: 'Opens sharing settings in first branch',
}

interface SharingGlowGuideProps {
  onClose: (showReminder?: boolean) => void
  onAction?: () => void
}

export default function SharingGlowGuide({ onClose, onAction }: SharingGlowGuideProps) {
  const handleInvite = () => {
    if (onAction) onAction()
    onClose(false) // No reminder when taking action
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-5 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block text-5xl sm:text-6xl mb-3 sm:mb-4 animate-pulse">🤝</div>
          <h2 className="text-2xl sm:text-3xl font-light text-firefly-glow mb-2">
            Tend Your Grove Together
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Stories grow richer with shared light</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed text-sm sm:text-base">
            You've been tending your grove with care. What if others who knew them could add their light too?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-text-soft">
          <p className="leading-relaxed text-sm sm:text-base">
            Invite family members to tend branches together. Each person brings their unique perspective,
            their own memories, their piece of the story. Your sister remembers stories you forgot. Your cousin has photos you've never seen.
          </p>

          <p className="text-xs sm:text-sm text-text-muted italic text-center">
            You control who sees what. Each branch can have different collaborators with different permissions.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <button
            onClick={handleInvite}
            className="w-full py-2.5 sm:py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-base sm:text-lg"
          >
            Invite Someone to Garden
          </button>
          <button
            onClick={() => onClose(true)}
            className="text-text-muted hover:text-text-soft text-sm transition-soft py-2"
          >
            I'll do this later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/inviting-family-members"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about collaboration →
          </a>
        </div>
      </div>
    </div>
  )
}

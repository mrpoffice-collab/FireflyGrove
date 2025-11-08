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

interface SharingWelcomeModalProps {
  onClose: () => void
  onAction?: () => void
}

export default function SharingWelcomeModal({ onClose, onAction }: SharingWelcomeModalProps) {
  const handleInvite = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🤝</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Tend Your Grove Together
          </h2>
          <p className="text-text-muted text-sm">Stories grow richer with shared light</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've been tending your grove with care. What if others who knew them could add their light too?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Invite family members to tend branches together. Each person brings their unique perspective,
            their own memories, their piece of the story.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">👥</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Every perspective matters</strong>
                <br />
                Your sister remembers stories you forgot. Your cousin has photos you've never seen.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📖</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Stories are better together</strong>
                <br />
                One memory sparks another. Conversations unfold. The full picture emerges.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💚</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Share the tending</strong>
                <br />
                Preservation is easier together. Everyone adds what they remember, when they remember it.
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            You control who sees what. Each branch can have different collaborators with different permissions.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleInvite}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Invite Someone to Garden
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            I'll do this later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/inviting-family-members"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about collaboration →
          </a>
        </div>
      </div>
    </div>
  )
}

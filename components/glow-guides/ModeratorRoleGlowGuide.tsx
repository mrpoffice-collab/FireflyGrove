'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'moderator-role',
  slug: 'moderator-role-trustee',
  title: 'Moderator Role: Your Trusted Helper',
  subtitle: 'Delegate Management During Life',
  icon: '⭐',
  category: 'LEGACY',
  tags: ['moderator', 'trustee', 'helper', 'delegation', 'management'],
  difficulty: 'ADVANCED',
  timeToRead: 3,
  relatedArticles: ['branch-permissions-access-control', 'heir-conditions-release-timing', 'approval-workflow-review-contributions'],
  trigger: 'Legacy tree, no moderator',
  cta: 'Appoint a Moderator',
  ctaAction: 'Opens moderator selection',
}

interface ModeratorRoleGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function ModeratorRoleGlowGuide({ onClose, onAction }: ModeratorRoleGlowGuideProps) {
  const handleAppoint = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">⭐</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Delegate Management During Life
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Trust someone to help now</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Building a legacy tree is a big job. Want someone to help you manage it while you're here?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            A Moderator is different from an heir — they help you manage your tree during your life, like a trusted co-pilot for your legacy work.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">🤝</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Helps during life</strong>
                <br />
                Approve memories, invite members, organize — while you're still here
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">👨‍⚕️</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Perfect for health challenges</strong>
                <br />
                If you're ill or aging, they keep things running when you can't
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔄</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Revocable trust</strong>
                <br />
                You can remove their role anytime — it's not permanent like an heir
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            Choose someone patient, organized, and trusted — a caretaker for your legacy.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAppoint}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Appoint a Moderator
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            I'll manage alone
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/moderator-role-trustee"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Moderators →
          </a>
        </div>
      </div>
    </div>
  )
}

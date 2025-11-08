'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'member-removal',
  slug: 'member-removal-managing-collaborators',
  title: 'Member Removal: Manage Your Circle',
  subtitle: 'Sometimes Relationships Change',
  icon: '👋',
  category: 'COLLABORATION',
  tags: ['removal', 'management', 'conflict', 'privacy', 'access'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 2,
  relatedArticles: ['branch-permissions-access-control', 'privacy-settings', 'memory-visibility-privacy'],
  trigger: 'Has members, never managed',
  cta: 'Learn About Managing Members',
  ctaAction: 'Opens member management guide',
}

interface MemberRemovalGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MemberRemovalGlowGuide({ onClose, onAction }: MemberRemovalGlowGuideProps) {
  const handleLearn = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">👋</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Sometimes Relationships Change
          </h2>
          <p className="text-text-muted text-sm">You're always in control</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Life happens. Conflicts arise. Privacy needs change. You can adjust who has access anytime.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Removing someone doesn't erase their contributions — it just revokes their access going forward. Your tree, your rules.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🚫</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Revoke access instantly</strong>
                <br />
                Remove someone's ability to view or contribute with one click
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💾</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Keep their memories</strong>
                <br />
                Their past contributions stay (unless you delete them separately)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔄</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Reversible</strong>
                <br />
                If relationships heal, you can always re-invite them later
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Common reasons: divorce, family conflict, changed privacy needs, or simply drift.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLearn}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Learn About Managing Members
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Everyone's good for now
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/member-removal-managing-collaborators"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Member Removal →
          </a>
        </div>
      </div>
    </div>
  )
}

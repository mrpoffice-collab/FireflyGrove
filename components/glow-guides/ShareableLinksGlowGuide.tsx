'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'shareable-links',
  slug: 'shareable-links-quick-access',
  title: 'Shareable Links: One-Time Access',
  subtitle: 'Share Without Adding Members',
  icon: '🔗',
  category: 'SHARING',
  tags: ['links', 'sharing', 'temporary', 'quick', 'access'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['memory-visibility-privacy', 'sharing-memories', 'branch-permissions-access-control'],
  trigger: 'Branch with memories, never shared link',
  cta: 'Create Shareable Link',
  ctaAction: 'Opens link generator',
}

interface ShareableLinksGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function ShareableLinksGlowGuide({ onClose, onAction }: ShareableLinksGlowGuideProps) {
  const handleCreate = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">🔗</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Share Without Adding Members
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Quick, temporary access</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Want to show someone a memory without making them a permanent member? Shareable links are perfect.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Generate secure links that give one-time or temporary access — great for showing non-users, sharing on social media, or quick previews.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">⏱️</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Time-limited access</strong>
                <br />
                Links expire after 24 hours, 7 days, or never — you choose
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Specific content</strong>
                <br />
                Share a single memory, a branch, or an entire tree
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔒</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">View-only access</strong>
                <br />
                Recipients can read but can't edit, comment, or download
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            You can revoke any link anytime, even before it expires.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleCreate}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Create Shareable Link
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            Not right now
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/shareable-links-quick-access"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Shareable Links →
          </a>
        </div>
      </div>
    </div>
  )
}

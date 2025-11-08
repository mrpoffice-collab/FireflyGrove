'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'branch-permissions',
  slug: 'branch-permissions-access-control',
  title: 'Branch Permissions: Fine-Tune Access',
  subtitle: 'Customize Who Can Do What',
  icon: '🔐',
  category: 'COLLABORATION',
  tags: ['permissions', 'access', 'control', 'roles', 'security'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 3,
  relatedArticles: ['approval-workflow-review-contributions', 'member-removal', 'memory-visibility-privacy'],
  trigger: 'Invited 2+ people, all same permission',
  cta: 'Customize Permissions',
  ctaAction: 'Opens permissions manager',
}

interface BranchPermissionsGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function BranchPermissionsGlowGuide({ onClose, onAction }: BranchPermissionsGlowGuideProps) {
  const handleCustomize = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🔐</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Customize Who Can Do What
          </h2>
          <p className="text-text-muted text-sm">Flexible access control</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've invited multiple people. Want to give different levels of access to different members?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Not everyone needs the same level of access. Permissions let you create viewers, contributors, and moderators based on trust and role.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">👁️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Viewer</strong>
                <br />
                Can read and glow memories, but can't add or edit anything
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✍️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Contributor</strong>
                <br />
                Can add memories and reply, with or without approval required
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">⭐</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Moderator</strong>
                <br />
                Can manage members, approve memories, and help you curate the tree
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Permissions can be adjusted anytime as relationships and trust evolve.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCustomize}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Customize Permissions
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Everyone's fine as-is
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/branch-permissions-access-control"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Branch Permissions →
          </a>
        </div>
      </div>
    </div>
  )
}

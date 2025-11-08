'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'approval-workflow',
  slug: 'approval-workflow-review-contributions',
  title: 'Approval Workflow: Curate Your Tree',
  subtitle: 'Review Before Publishing',
  icon: '✅',
  category: 'COLLABORATION',
  tags: ['approval', 'workflow', 'review', 'moderation', 'quality'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 2,
  relatedArticles: ['branch-permissions', 'member-removal', 'co-authoring-joint-memories'],
  trigger: 'First pending memory in owned branch',
  cta: 'Review Pending Memory',
  ctaAction: 'Opens approval interface',
}

interface ApprovalWorkflowGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function ApprovalWorkflowGlowGuide({ onClose, onAction }: ApprovalWorkflowGlowGuideProps) {
  const handleReview = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">✅</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Review Before Publishing
          </h2>
          <p className="text-text-muted text-sm">Quality control for your tree</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Someone wants to add a memory to your tree. You can review it before it goes live.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Approval workflows give you control over what appears in your trees — ensuring quality, accuracy, and appropriateness before memories are published.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">👀</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Preview contributions</strong>
                <br />
                See exactly what someone wants to add before it becomes visible
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✏️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Request changes</strong>
                <br />
                Send feedback for edits or clarifications before approving
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Protect privacy</strong>
                <br />
                Catch anything inappropriate or too personal before it's published
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            You can set different approval rules for different members based on trust.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleReview}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Review Pending Memory
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            I'll check later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/approval-workflow-review-contributions"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Approval Workflow →
          </a>
        </div>
      </div>
    </div>
  )
}

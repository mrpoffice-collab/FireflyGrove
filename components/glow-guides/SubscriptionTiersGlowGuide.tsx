'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'subscription-tiers',
  slug: 'subscription-tiers-plans',
  title: 'Subscription Tiers: Choose Your Plan',
  subtitle: 'Find the Right Fit',
  icon: '💎',
  category: 'ACCOUNT_SETTINGS',
  tags: ['subscription', 'plans', 'pricing', 'upgrade', 'limits'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['storage-limits', 'feature-comparison', 'billing-management'],
  trigger: 'Approaching tree limit',
  cta: 'View Plans',
  ctaAction: 'Opens pricing page',
}

interface SubscriptionTiersGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function SubscriptionTiersGlowGuide({ onClose, onAction }: SubscriptionTiersGlowGuideProps) {
  const handleView = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">💎</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Find the Right Fit
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Plans that grow with you</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You're growing your grove beautifully. Let's make sure you have the space you need.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Firefly Grove offers plans for every stage of your memory preservation journey — from casual preservers to serious legacy builders.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">🌱</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Seedling (Free)</strong>
                <br />
                1 tree, 100 memories, 500MB storage — perfect for getting started
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🌳</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Grove Keeper</strong>
                <br />
                5 trees, unlimited memories, 25GB storage — for serious preservers
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🌲</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Forest Guardian</strong>
                <br />
                Unlimited trees, priority support, 100GB+ storage — legacy builders
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            All plans include full access to products, exports, and heir planning features.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleView}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            View Plans
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            I'm good for now
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/subscription-tiers-plans"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Subscription Tiers →
          </a>
        </div>
      </div>
    </div>
  )
}

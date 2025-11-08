'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'storage-limits',
  slug: 'storage-limits-management',
  title: 'Storage Limits: Manage Your Space',
  subtitle: 'Optimize Your Media',
  icon: '💾',
  category: 'ACCOUNT_SETTINGS',
  tags: ['storage', 'limits', 'media', 'optimization', 'capacity'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 2,
  relatedArticles: ['subscription-tiers-plans', 'forever-kit-export-backup', 'media-optimization'],
  trigger: '50% storage used',
  cta: 'Manage Storage',
  ctaAction: 'Opens storage management',
}

interface StorageLimitsGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function StorageLimitsGlowGuide({ onClose, onAction }: StorageLimitsGlowGuideProps) {
  const handleManage = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">💾</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Optimize Your Media
          </h2>
          <p className="text-text-muted text-sm">Make room for more memories</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You're preserving a lot of media — photos, audio, videos. Let's talk about managing your space.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Storage limits exist to keep the platform sustainable, but there are smart ways to maximize what you have and tools to help you manage it.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">📊</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">See what's taking space</strong>
                <br />
                View storage breakdown by tree, branch, and media type
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🗜️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Optimize existing media</strong>
                <br />
                Compress photos and videos without losing visible quality
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📤</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Export and archive</strong>
                <br />
                Move old content to Forever Kits, keep active memories in the cloud
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Or upgrade your plan for more space — it's like adding rooms to your memory home.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleManage}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Manage Storage
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            I'll deal with it later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/storage-limits-management"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Storage Management →
          </a>
        </div>
      </div>
    </div>
  )
}

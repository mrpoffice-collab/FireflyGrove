'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'privacy-settings',
  slug: 'privacy-settings-account-control',
  title: 'Privacy Settings: Your Data, Your Rules',
  subtitle: 'Take Control of Your Privacy',
  icon: '🔒',
  category: 'ACCOUNT_SETTINGS',
  tags: ['privacy', 'settings', 'control', 'security', 'data'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 3,
  relatedArticles: ['memory-visibility-privacy', 'open-grove-public-memorials', 'data-ownership'],
  trigger: 'Never visited settings, active 7 days',
  cta: 'Review Privacy',
  ctaAction: 'Opens privacy settings',
}

interface PrivacySettingsGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function PrivacySettingsGlowGuide({ onClose, onAction }: PrivacySettingsGlowGuideProps) {
  const handleReview = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🔒</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Take Control of Your Privacy
          </h2>
          <p className="text-text-muted text-sm">Your data, your rules</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You're entrusting us with precious memories. Make sure your privacy settings match your comfort level.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Firefly Grove gives you granular control over every aspect of your privacy — from who can find you to how your data is used.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔍</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Discovery preferences</strong>
                <br />
                Control if strangers can find you through search or Open Grove
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Communication settings</strong>
                <br />
                Choose what notifications you receive and who can contact you
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🗂️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Data usage</strong>
                <br />
                Opt in or out of analytics, AI features, and service improvements
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            We're privacy-first by design — your memories are never sold or used for advertising.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleReview}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Review Privacy Settings
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Defaults are fine
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/privacy-settings-account-control"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Privacy Settings →
          </a>
        </div>
      </div>
    </div>
  )
}

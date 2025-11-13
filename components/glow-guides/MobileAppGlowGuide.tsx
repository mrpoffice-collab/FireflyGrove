'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'mobile-app',
  slug: 'mobile-app-download',
  title: 'Mobile App: Memory Preservation On-the-Go',
  subtitle: 'Take Firefly Grove Everywhere',
  icon: '📱',
  category: 'MOBILE',
  tags: ['mobile', 'app', 'download', 'ios', 'android'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['mobile-photo-upload', 'voice-capture-mobile', 'offline-access'],
  trigger: 'Mobile browser, been active 3+ sessions',
  cta: 'Download App',
  ctaAction: 'Redirects to app store',
}

interface MobileAppGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MobileAppGlowGuide({ onClose, onAction }: MobileAppGlowGuideProps) {
  const handleDownload = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">📱</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Take Firefly Grove Everywhere
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Better on the app</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've been using the mobile web version. The app is faster, smoother, and has features you can't get in a browser.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            The Firefly Grove mobile app is built specifically for capturing memories in the moment — when inspiration strikes and you're away from your desk.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">📸</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Instant camera access</strong>
                <br />
                Capture photos and videos directly from the app, upload in seconds
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🎙️</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Voice recording anywhere</strong>
                <br />
                Record memories while driving, walking, or lying in bed
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔔</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Push notifications</strong>
                <br />
                Get reminded of daily prompts, family activity, and special dates
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            Available for iOS and Android — same account, seamless sync.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Download App
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            Continue in browser
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/mobile-app-download"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about the Mobile App →
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'voice-capture-mobile',
  slug: 'voice-capture-mobile-convenience',
  title: 'Voice Capture on Mobile: Your Best Tool',
  subtitle: 'Record Anywhere, Anytime',
  icon: '🎤',
  category: 'MOBILE',
  tags: ['mobile', 'voice', 'recording', 'convenience', 'hands-free'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['recording-voice-memories', 'audio-sparks-quick-capture', 'mobile-app-download'],
  trigger: 'Mobile device, never recorded',
  cta: 'Record Your Voice',
  ctaAction: 'Opens mobile voice recorder',
}

interface VoiceCaptureMobileGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function VoiceCaptureMobileGlowGuide({ onClose, onAction }: VoiceCaptureMobileGlowGuideProps) {
  const handleRecord = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">🎤</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Record Anywhere, Anytime
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Your phone is your best memory tool</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You're on your phone — the perfect device for voice recording. Capture your thoughts before they slip away.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Mobile voice recording is hands-free, effortless, and perfect for those moments when typing would break the flow of memory.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">🚗</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">While driving or walking</strong>
                <br />
                Memories come at unexpected times — record them safely, hands-free
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">💭</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Stream of consciousness</strong>
                <br />
                Speaking is faster than typing — get your full thought out before you lose it
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🌙</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Late night reflections</strong>
                <br />
                In bed, in the dark, when you remember something — just speak it
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            Auto-transcribed to text, so your voice becomes searchable — best of both worlds.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRecord}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Record Your Voice
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
            href="/knowledge/voice-capture-mobile-convenience"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Mobile Voice Capture →
          </a>
        </div>
      </div>
    </div>
  )
}

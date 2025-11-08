'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'audio-sparks',
  slug: 'audio-sparks-quick-capture',
  title: 'Audio Sparks: Quick Voice Capture',
  subtitle: 'Capture Thoughts in Seconds',
  icon: '⚡',
  category: 'VOICE_AUDIO',
  tags: ['audio-sparks', 'voice', 'quick-capture', 'prompts', 'daily-practice'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['recording-voice-memories', 'audio-prompts', 'daily-memory-practice'],
  trigger: 'User has never used audio sparks feature',
  cta: 'Try Audio Sparks',
  ctaAction: 'Opens audio sparks sidebar',
}

interface AudioSparksGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function AudioSparksGlowGuide({ onClose, onAction }: AudioSparksGlowGuideProps) {
  const handleTryIt = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">⚡</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Capture Thoughts in Seconds
          </h2>
          <p className="text-text-muted text-sm">No memory too small to preserve</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Sometimes the best memories come in quick bursts — a thought while cooking, a moment with your pet, a sudden recollection.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Audio Sparks lets you capture these fleeting moments without opening a full memory form. Just click, speak, done.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🎯</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Prompted or freeform</strong>
                <br />
                Answer a daily question or just speak what's on your mind
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">⏱️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">15 seconds to 3 minutes</strong>
                <br />
                Quick enough to capture, long enough to matter
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📝</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Auto-transcribed</strong>
                <br />
                We'll turn your voice into searchable text automatically
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Perfect for daily practice — keep the muscle of remembering strong.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleTryIt}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Try Audio Sparks
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Maybe later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/audio-sparks-quick-capture"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Audio Sparks →
          </a>
        </div>
      </div>
    </div>
  )
}

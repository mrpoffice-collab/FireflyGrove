'use client'

interface VoiceMemoriesWelcomeModalProps {
  onClose: () => void
  onAction?: () => void
}

export default function VoiceMemoriesWelcomeModal({ onClose, onAction }: VoiceMemoriesWelcomeModalProps) {
  const handleRecordVoice = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🎙️</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Capture Your Voice
          </h2>
          <p className="text-text-muted text-sm">Future generations will hear you</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've been preserving memories with words. What if they could hear your voice too?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Voice recordings carry something text can't — the warmth of your tone, the pauses between thoughts,
            the laughter that punctuates your stories.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">💫</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">They'll hear you, not just read you</strong>
                <br />
                Your grandchildren will know your voice, your cadence, your way of telling a story
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🗣️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Easier than typing</strong>
                <br />
                Talk naturally. No need to polish or edit. Just speak from the heart.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✨</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Emotion that text can't capture</strong>
                <br />
                The catch in your voice when you remember. The joy. The tenderness.
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Record anywhere — at your computer or on your phone while memories are fresh.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRecordVoice}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Record a Voice Memory
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Not right now
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/recording-voice-memories"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about voice memories →
          </a>
        </div>
      </div>
    </div>
  )
}

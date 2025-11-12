'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'voice-memories',
  slug: 'recording-voice-memories',
  title: 'Recording Voice Memories',
  subtitle: 'Capture Your Voice',
  icon: '🎙️',
  category: 'VOICE_AUDIO',
  tags: ['voice', 'audio', 'recording', 'stories', 'memories'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['audio-sparks', 'audio-quality-tips', 'speech-to-text'],
  trigger: 'User has 10+ text memories but 0 audio memories',
  cta: 'Record a Memory',
  ctaAction: 'Opens new memory modal with audio tab',
}


interface VoiceMemoriesGlowGuideProps {
  onClose: (showReminder?: boolean) => void
  onAction?: () => void
}

export default function VoiceMemoriesGlowGuide({ onClose, onAction }: VoiceMemoriesGlowGuideProps) {
  const handleRecordVoice = () => {
    if (onAction) onAction()
    onClose(false) // No reminder when taking action
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-5 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block text-5xl sm:text-6xl mb-3 sm:mb-4 animate-pulse">🎙️</div>
          <h2 className="text-2xl sm:text-3xl font-light text-firefly-glow mb-2">
            Capture Your Voice
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Future generations will hear you</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed text-sm sm:text-base">
            You've been preserving memories with words. What if they could hear your voice too?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-text-soft">
          <p className="leading-relaxed text-sm sm:text-base">
            Voice recordings carry something text can't — the warmth of your tone, the pauses between thoughts,
            the laughter that punctuates your stories. Your grandchildren will know your voice.
          </p>

          <p className="text-xs sm:text-sm text-text-muted italic text-center">
            Record anywhere — at your computer or on your phone while memories are fresh.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <button
            onClick={handleRecordVoice}
            className="w-full py-2.5 sm:py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-base sm:text-lg"
          >
            Record a Voice Memory
          </button>
          <button
            onClick={() => onClose(true)}
            className="text-text-muted hover:text-text-soft text-sm transition-soft py-2"
          >
            Not right now
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/recording-voice-memories"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about voice memories →
          </a>
        </div>
      </div>
    </div>
  )
}

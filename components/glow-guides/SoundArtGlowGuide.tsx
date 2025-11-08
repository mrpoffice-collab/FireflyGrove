'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'soundart',
  slug: 'soundart-audio-wave-art',
  title: 'SoundArt: Turn Voice into Visual Beauty',
  subtitle: 'Their Voice as Art',
  icon: '🎨',
  category: 'PRODUCTS',
  tags: ['soundart', 'audio', 'visualization', 'gifts', 'memorials'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['recording-voice-memories', 'greeting-cards', 'memory-book'],
  trigger: 'Visiting /soundart, has audio memories',
  cta: 'Turn a Memory into Art',
  ctaAction: 'Opens SoundArt creator',
}

interface SoundArtGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function SoundArtGlowGuide({ onClose, onAction }: SoundArtGlowGuideProps) {
  const handleCreate = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🎨</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Their Voice as Art
          </h2>
          <p className="text-text-muted text-sm">See the sound of love</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You've preserved their voice. Now turn it into something you can see and touch.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            SoundArt transforms voice recordings into beautiful waveform visualizations — perfect for framing, gifting, or remembering.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🖼️</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Wall-worthy art</strong>
                <br />
                "I love you" in their actual voice, visualized as a stunning piece for your home
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Meaningful gifts</strong>
                <br />
                Give family members their loved one's voice as a visual keepsake
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📱</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Digital or printed</strong>
                <br />
                Download for phone wallpapers or order professional prints
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Customize colors, styles, and add text to make each piece uniquely meaningful.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Create SoundArt
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            See examples first
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/soundart-audio-wave-art"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about SoundArt →
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'mobile-photo-upload',
  slug: 'mobile-photo-upload-camera-integration',
  title: 'Mobile Photo Upload: Capture the Moment',
  subtitle: 'Your Camera, Your Memories',
  icon: '📷',
  category: 'MOBILE',
  tags: ['mobile', 'photos', 'camera', 'upload', 'capture'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['nest-photo-upload', 'mobile-app-download', 'photo-memories'],
  trigger: 'Mobile device, never used camera',
  cta: 'Take a Photo Now',
  ctaAction: 'Opens camera with memory creation',
}

interface MobilePhotoUploadGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MobilePhotoUploadGlowGuide({ onClose, onAction }: MobilePhotoUploadGlowGuideProps) {
  const handlePhoto = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">📷</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Your Camera, Your Memories
          </h2>
          <p className="text-text-muted text-sm">Capture life as it happens</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You're on your phone — the perfect device for capturing spontaneous moments. Let's use that camera.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Mobile photo capture lets you preserve moments instantly — no need to wait until you're at a computer to upload them later.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚡</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Instant capture</strong>
                <br />
                Take a photo and it's immediately part of your memory collection
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎯</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">In-the-moment context</strong>
                <br />
                Add notes while you remember why this moment matters
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Auto location tagging</strong>
                <br />
                Optionally preserve where the photo was taken
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Perfect for family gatherings, travel, and everyday moments you don't want to forget.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePhoto}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Take a Photo Now
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
            href="/knowledge/mobile-photo-upload-camera-integration"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Mobile Photo Upload →
          </a>
        </div>
      </div>
    </div>
  )
}

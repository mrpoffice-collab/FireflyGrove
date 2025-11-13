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
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">📷</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Your Camera, Your Memories
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Capture life as it happens</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You're on your phone — the perfect device for capturing spontaneous moments. Let's use that camera.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Mobile photo capture lets you preserve moments instantly — no need to wait until you're at a computer to upload them later.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚡</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Instant capture</strong>
                <br />
                Take a photo and it's immediately part of your memory collection
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">In-the-moment context</strong>
                <br />
                Add notes while you remember why this moment matters
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">📍</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Auto location tagging</strong>
                <br />
                Optionally preserve where the photo was taken
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            Perfect for family gatherings, travel, and everyday moments you don't want to forget.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handlePhoto}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Take a Photo Now
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            Maybe later
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/mobile-photo-upload-camera-integration"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Mobile Photo Upload →
          </a>
        </div>
      </div>
    </div>
  )
}

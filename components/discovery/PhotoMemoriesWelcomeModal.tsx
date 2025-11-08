'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'photo-memories',
  slug: 'adding-photos-to-memories',
  title: 'Adding Photos to Memories',
  subtitle: 'A Picture Holds a Thousand Stories',
  icon: '📸',
  category: 'PHOTOS_MEDIA',
  tags: ['photos', 'images', 'visual', 'media', 'nest'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['the-nest-bulk-uploads', 'hatching-photos', 'photo-organization'],
  trigger: 'User has 10+ text memories but 0 photos',
  cta: 'Add a Photo',
  ctaAction: 'Opens new memory modal with photo upload',
}


interface PhotoMemoriesWelcomeModalProps {
  onClose: () => void
  onAction?: () => void
}

export default function PhotoMemoriesWelcomeModal({ onClose, onAction }: PhotoMemoriesWelcomeModalProps) {
  const handleAddPhoto = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">📸</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            A Picture Holds a Thousand Stories
          </h2>
          <p className="text-text-muted text-sm">Visual memories spark deeper recall</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Your words paint beautiful pictures. Imagine pairing them with the actual photographs.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Photos don't just show what happened — they transport you back. The setting, the expressions,
            the details you'd forgotten until you saw them again.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">💫</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Photos spark deeper memories</strong>
                <br />
                One image can unlock stories you thought were lost
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🌿</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Visual context brings stories alive</strong>
                <br />
                Show them the place, the people, the moment in time
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Safe storage for precious images</strong>
                <br />
                Your photos are preserved, backed up, and ready to pass on
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Upload from your computer, phone, or use The Nest for bulk photo organization.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAddPhoto}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Add a Photo Memory
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
            href="/knowledge/adding-photos-to-memories"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about photo memories →
          </a>
        </div>
      </div>
    </div>
  )
}

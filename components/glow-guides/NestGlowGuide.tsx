'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'nest',
  slug: 'the-nest-bulk-photo-uploads',
  title: 'The Nest: Bulk Photo Uploads',
  subtitle: 'Organize Before You Hatch',
  icon: '🪺',
  category: 'PHOTOS_MEDIA',
  tags: ['nest', 'photos', 'bulk-upload', 'organization', 'workflow'],
  difficulty: 'BEGINNER',
  timeToRead: 3,
  relatedArticles: ['hatching-photos', 'photo-memories', 'organizing-photos'],
  trigger: 'User visits /nest for first time',
  cta: 'Upload Photos',
  ctaAction: 'Triggers file picker or focuses upload area',
}


interface NestGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function NestGlowGuide({ onClose, onAction }: NestGlowGuideProps) {
  const handleExploreNest = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">🥚</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Welcome to The Nest
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Your photo staging area</p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            The Nest is where photos wait before they become memories. Upload hundreds at once,
            then "hatch" them into memories when you're ready.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">📤</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Upload everything at once</strong>
                <br />
                Drag and drop entire photo albums. Get them into the system first, organize later.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔍</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Review before committing</strong>
                <br />
                Browse your photos, delete duplicates, decide what's worth keeping.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🐣</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Hatch into memories gradually</strong>
                <br />
                Transform photos into full memories with stories, when inspiration strikes.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-firefly-glow/10 to-transparent rounded-lg p-4 border border-firefly-glow/20">
            <p className="text-sm italic">
              <strong className="text-firefly-glow">Perfect for:</strong> Digitizing old photo albums,
              organizing inherited photos, or bulk uploads from your phone.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleExploreNest}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Upload Photos to Nest
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            I'll explore on my own
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/the-nest-bulk-photo-uploads"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about The Nest →
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'import-features',
  slug: 'import-features-migration',
  title: 'Import Features: Bring Your Existing Memories',
  subtitle: 'Start with What You Have',
  icon: '📥',
  category: 'ACCOUNT_SETTINGS',
  tags: ['import', 'migration', 'facebook', 'photos', 'bulk'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 3,
  relatedArticles: ['nest-photo-upload', 'getting-started', 'migration-guide'],
  trigger: 'New user, no memories yet',
  cta: 'Import from Facebook/Other',
  ctaAction: 'Opens import wizard',
}

interface ImportFeaturesGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function ImportFeaturesGlowGuide({ onClose, onAction }: ImportFeaturesGlowGuideProps) {
  const handleImport = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">📥</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Start with What You Have
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Don't start from scratch</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            You already have memories out there — Facebook posts, photo albums, journal entries. Bring them here.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Our import tools help you migrate existing content quickly, giving you a head start on building your legacy collection.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">📘</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Facebook import</strong>
                <br />
                Pull in posts, photos, and status updates from your Facebook timeline
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">📸</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Bulk photo upload</strong>
                <br />
                Drag entire folders of photos — we'll preserve dates and organize them
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">📝</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Text file import</strong>
                <br />
                Have journals or documents? Import Word, PDF, or plain text files
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            Imports preserve original dates, so your timeline stays authentic.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleImport}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Start Importing
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            I'll create from scratch
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/import-features-migration"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Import Features →
          </a>
        </div>
      </div>
    </div>
  )
}

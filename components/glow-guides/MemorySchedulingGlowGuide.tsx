'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'memory-scheduling',
  slug: 'memory-scheduling-future-release',
  title: 'Memory Scheduling: Time-Released Stories',
  subtitle: 'Deliver Memories at the Perfect Moment',
  icon: '⏰',
  category: 'CORE_FEATURES',
  tags: ['scheduling', 'timing', 'future', 'birthdays', 'surprises'],
  difficulty: 'INTERMEDIATE',
  timeToRead: 3,
  relatedArticles: ['memory-visibility-privacy', 'heir-conditions', 'legacy-planning'],
  trigger: 'Creating memory, never scheduled',
  cta: 'Schedule This Memory',
  ctaAction: 'Opens scheduling interface',
}

interface MemorySchedulingGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function MemorySchedulingGlowGuide({ onClose, onAction }: MemorySchedulingGlowGuideProps) {
  const handleSchedule = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse">⏰</div>
          <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-1">
            Deliver Memories at the Perfect Moment
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">Timing is everything</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Imagine your child opening a letter from you on their wedding day, or your grandchild receiving a story on their 18th birthday.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-text-soft">
          <p className="text-sm leading-relaxed">
            Scheduled memories let you be present in moments you might not be there for — delivering the right words at exactly the right time.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">🎂</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Birthday surprises</strong>
                <br />
                Schedule a memory to appear on their 21st, 40th, or 80th birthday
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">💒</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Life milestones</strong>
                <br />
                Release advice on wedding days, graduations, or when they become parents
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🌅</span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-firefly-glow">Future dates</strong>
                <br />
                Set any specific date — anniversaries, holidays, or moments that matter
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted italic text-center">
            You can schedule multiple versions of the same memory for different recipients.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSchedule}
            className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"
          >
            Schedule This Memory
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"
          >
            Share it now instead
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-4 pt-3 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/memory-scheduling-future-release"
            className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Memory Scheduling →
          </a>
        </div>
      </div>
    </div>
  )
}

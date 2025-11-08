'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'trees-branches',
  slug: 'understanding-trees-and-branches',
  title: 'Understanding Trees and Branches',
  subtitle: 'Welcome to Your Grove',
  icon: '🌳',
  category: 'GETTING_STARTED',
  tags: ['trees', 'branches', 'organization', 'getting-started', 'concepts'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['creating-first-memory', 'multiple-trees', 'branching-strategies'],
  trigger: 'User visits grove page with 0 trees',
  cta: 'Plant My First Tree',
  ctaAction: 'Routes to /grove/new-tree',
}

interface TreesVsBranchesWelcomeModalProps {
  onClose: () => void
  onAction?: () => void
}

export default function TreesVsBranchesWelcomeModal({ onClose, onAction }: TreesVsBranchesWelcomeModalProps) {
  const handlePlantTree = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🌳</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Welcome to Your Grove
          </h2>
          <p className="text-text-muted text-sm">Where memories grow like fireflies</p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Your grove is where you'll preserve the stories that matter. Think of it like a memory garden,
            organized by the people you cherish.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌳</span>
              <div>
                <p className="font-medium text-firefly-glow mb-1">Trees</p>
                <p className="text-sm leading-relaxed">
                  Each tree represents a person — Grandma, Dad, your childhood friend.
                  A place to gather all their light.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="font-medium text-firefly-glow mb-1">Branches</p>
                <p className="text-sm leading-relaxed">
                  Branches organize memories by theme — wisdom they shared, recipes they loved,
                  stories they told.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-medium text-firefly-glow mb-1">Memories</p>
                <p className="text-sm leading-relaxed">
                  The fireflies themselves — each story, photo, or voice recording you capture
                  and preserve.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-firefly-glow/10 to-transparent rounded-lg p-4 border border-firefly-glow/20">
            <p className="text-sm italic">
              <strong className="text-firefly-glow">Example:</strong> Create a tree for your grandmother,
              with branches like "Her Garden Wisdom," "Sunday Dinners," and "Stories She Told."
              Each memory you add becomes a firefly glowing in those branches.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePlantTree}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Plant My First Tree
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            I'll explore on my own
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/understanding-trees-and-branches"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about trees and branches →
          </a>
        </div>
      </div>
    </div>
  )
}

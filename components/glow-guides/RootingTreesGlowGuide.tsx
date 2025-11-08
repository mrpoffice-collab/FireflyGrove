'use client'

/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'rooting-trees',
  slug: 'rooting-trees-family-connections',
  title: 'Rooting Trees: Connect Family Heritage',
  subtitle: 'Link Stories Across Generations',
  icon: '🌱',
  category: 'ORGANIZATION',
  tags: ['rooting', 'family', 'connections', 'heritage', 'genealogy'],
  difficulty: 'ADVANCED',
  timeToRead: 3,
  relatedArticles: ['transplanting-trees-grove-transfer', 'multiple-trees-organization', 'legacy-planning'],
  trigger: '2+ people have trees',
  cta: 'Root Trees Together',
  ctaAction: 'Opens tree rooting interface',
}

interface RootingTreesGlowGuideProps {
  onClose: () => void
  onAction?: () => void
}

export default function RootingTreesGlowGuide({ onClose, onAction }: RootingTreesGlowGuideProps) {
  const handleRoot = () => {
    if (onAction) onAction()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">🌱</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Link Stories Across Generations
          </h2>
          <p className="text-text-muted text-sm">Build your family forest</p>
        </div>

        {/* Celebration */}
        <div className="bg-bg-dark/50 rounded-lg p-4 mb-6 border border-firefly-dim/30">
          <p className="text-text-soft text-center leading-relaxed">
            Your family has multiple trees growing. Ready to show how they connect?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Rooting lets you define family relationships between trees — parent/child, siblings, spouses — creating a visual map of your family's interconnected stories.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🌳</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Visual family map</strong>
                <br />
                See how everyone's story connects — parents, children, grandparents
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔍</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Cross-tree discovery</strong>
                <br />
                Find memories mentioning relatives, navigate between connected stories
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎯</span>
              <p className="text-sm leading-relaxed">
                <strong className="text-firefly-glow">Legacy planning</strong>
                <br />
                Set up inheritance chains — Grandma's tree flows to Mom's, then to yours
              </p>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Rooting is optional but powerful — it turns separate trees into a family forest.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRoot}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Root Trees Together
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Keep them separate
          </button>
        </div>

        {/* Link to Knowledge Bank */}
        <div className="mt-6 pt-4 border-t border-firefly-dim/20 text-center">
          <a
            href="/knowledge/rooting-trees-family-connections"
            className="text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"
          >
            Learn more about Rooting Trees →
          </a>
        </div>
      </div>
    </div>
  )
}

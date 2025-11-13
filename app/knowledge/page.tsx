'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { SkeletonList, SkeletonTitle } from '@/components/SkeletonLoader'
import { getAllKnowledgeArticles } from '@/lib/knowledgeContent'
import { getGlowGuide } from '@/lib/glowGuideRegistry'

const categoryLabels: Record<string, string> = {
  GETTING_STARTED: 'Getting Started',
  CORE_FEATURES: 'Core Features',
  PRODUCTS: 'Products & Services',
  ORGANIZATION: 'Organization',
  COLLABORATION: 'Sharing & Collaboration',
  LEGACY: 'Legacy & Heirs',
  ACCOUNT: 'Account & Settings',
  MOBILE: 'Mobile Features',
}

const categoryIcons: Record<string, string> = {
  GETTING_STARTED: '🌱',
  CORE_FEATURES: '✨',
  PRODUCTS: '🎁',
  ORGANIZATION: '📁',
  COLLABORATION: '🤝',
  LEGACY: '🕯️',
  ACCOUNT: '⚙️',
  MOBILE: '📱',
}

export default function KnowledgeBankPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeGuideSlug, setActiveGuideSlug] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Get all articles
  const allArticles = getAllKnowledgeArticles()

  // Filter articles based on search and category
  const filteredArticles = allArticles.filter((article) => {
    // Filter by category
    if (selectedCategory && article.category !== selectedCategory) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        article.title.toLowerCase().includes(query) ||
        article.subtitle.toLowerCase().includes(query) ||
        article.overview.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Group articles by category
  const groupedArticles = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = []
    }
    acc[article.category].push(article)
    return acc
  }, {} as Record<string, typeof allArticles>)

  const categories = Object.keys(groupedArticles).sort()

  // Get the active Glow Guide component
  const ActiveGlowGuide = activeGuideSlug ? getGlowGuide(activeGuideSlug) : null

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <SkeletonTitle />
          <SkeletonList count={6} />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-light text-firefly-glow mb-3 sm:mb-4 px-4">
            Knowledge Bank
          </h1>
          <p className="text-text-muted text-base sm:text-lg px-4">
            Interactive guides to help you discover every Firefly Grove feature
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-bg-elevated border border-firefly-dim/30 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-firefly-glow transition-soft text-base sm:text-lg"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-soft min-h-[44px] sm:min-h-0 ${
              selectedCategory === null
                ? 'bg-firefly-glow text-bg-dark'
                : 'bg-bg-elevated text-text-soft hover:bg-bg-dark border border-firefly-dim/30'
            }`}
          >
            All Topics
          </button>
          {Object.keys(categoryLabels).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-soft min-h-[44px] sm:min-h-0 ${
                selectedCategory === category
                  ? 'bg-firefly-glow text-bg-dark'
                  : 'bg-bg-elevated text-text-soft hover:bg-bg-dark border border-firefly-dim/30'
              }`}
            >
              {categoryIcons[category]} {categoryLabels[category]}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-6 text-text-muted">
            Found {filteredArticles.length} {filteredArticles.length === 1 ? 'guide' : 'guides'}
          </div>
        )}

        {/* Glow Guide Cards by Category */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl text-text-soft mb-2">No guides found</h3>
            <p className="text-text-muted">Try a different search term or category</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-xl sm:text-2xl font-light text-firefly-glow mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl">{categoryIcons[category]}</span>
                  <span>{categoryLabels[category] || category}</span>
                  <span className="text-xs sm:text-sm text-text-muted font-normal">
                    ({groupedArticles[category].length})
                  </span>
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedArticles[category].map((article) => (
                    <button
                      key={article.slug}
                      onClick={() => setActiveGuideSlug(article.slug)}
                      className="block bg-bg-elevated border-2 border-firefly-dim/30 rounded-lg p-6 hover:border-firefly-glow hover:shadow-lg hover:shadow-firefly-glow/10 transition-soft group text-left w-full"
                    >
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                          {article.icon}
                        </div>
                      </div>

                      <h3 className="text-base font-medium text-firefly-glow group-hover:text-firefly-glow/90 transition-soft mb-2 text-center">
                        {article.title}
                      </h3>

                      <p className="text-text-muted text-sm text-center mb-4">
                        {article.subtitle}
                      </p>

                      <div className="flex items-center justify-center gap-2 text-xs text-firefly-glow/70">
                        <span>✨</span>
                        <span>Launch Guide</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Footer */}
        <div className="mt-16 pt-8 border-t border-firefly-dim/20 text-center">
          <p className="text-text-muted mb-4">
            Can't find what you're looking for?
          </p>
          <a
            href="/feedback"
            className="text-firefly-glow hover:text-firefly-glow/80 transition-soft"
          >
            Send us feedback →
          </a>
        </div>
      </div>

      {/* Render Active Glow Guide Modal */}
      {ActiveGlowGuide && (
        <ActiveGlowGuide
          onClose={() => setActiveGuideSlug(null)}
          onAction={() => {
            // TODO: Navigate to the actual feature
            setActiveGuideSlug(null)
          }}
        />
      )}
    </div>
  )
}

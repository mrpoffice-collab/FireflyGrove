'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { SkeletonList, SkeletonTitle } from '@/components/SkeletonLoader'

interface KnowledgeArticle {
  id: string
  slug: string
  title: string
  subtitle: string | null
  category: string
  tags: string[]
  timeToRead: number
  difficulty: string
  featured: boolean
  isNew: boolean
  viewCount: number
}

const categoryLabels: Record<string, string> = {
  GETTING_STARTED: 'Getting Started',
  CORE_FEATURES: 'Core Features',
  SHARING: 'Sharing & Collaboration',
  LEGACY: 'Legacy & Heirs',
  PHOTOS_MEDIA: 'Photos & Media',
  VOICE_AUDIO: 'Voice & Audio',
  PRODUCTS: 'Products',
  ORGANIZATION: 'Organization',
  ACCOUNT_SETTINGS: 'Account & Settings',
  MOBILE: 'Mobile',
}

const categoryIcons: Record<string, string> = {
  GETTING_STARTED: '🌱',
  CORE_FEATURES: '✨',
  SHARING: '🤝',
  LEGACY: '🕯️',
  PHOTOS_MEDIA: '📸',
  VOICE_AUDIO: '🎙️',
  PRODUCTS: '🎁',
  ORGANIZATION: '🗂️',
  ACCOUNT_SETTINGS: '⚙️',
  MOBILE: '📱',
}

export default function KnowledgeBankPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    filterArticles()
  }, [searchQuery, selectedCategory, articles])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/knowledge/articles')
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
        setFilteredArticles(data)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterArticles = () => {
    let filtered = articles

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.subtitle?.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((article) => article.category === selectedCategory)
    }

    setFilteredArticles(filtered)
  }

  const groupedArticles = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = []
    }
    acc[article.category].push(article)
    return acc
  }, {} as Record<string, KnowledgeArticle[]>)

  const categories = Object.keys(groupedArticles).sort()

  if (status === 'loading' || loading) {
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
            Find answers, tips, and guides for every Firefly Grove feature
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <input
            type="text"
            placeholder="Search guides, tips, and features..."
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
            Found {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
          </div>
        )}

        {/* Articles by Category */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl text-text-soft mb-2">No articles found</h3>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  {groupedArticles[category].map((article) => (
                    <a
                      key={article.id}
                      href={`/knowledge/${article.slug}`}
                      className="block bg-bg-elevated border border-firefly-dim/30 rounded-lg p-4 sm:p-6 hover:border-firefly-glow transition-soft group"
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <h3 className="text-base sm:text-lg font-medium text-firefly-glow group-hover:text-firefly-glow/80 transition-soft flex-1">
                          {article.title}
                        </h3>
                        {article.isNew && (
                          <span className="ml-2 px-2 py-1 bg-firefly-glow/20 text-firefly-glow text-xs rounded-full flex-shrink-0">
                            New!
                          </span>
                        )}
                      </div>

                      {article.subtitle && (
                        <p className="text-text-muted text-sm mb-3 sm:mb-4 line-clamp-2">
                          {article.subtitle}
                        </p>
                      )}

                      <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-xs text-text-muted">
                        <span>{article.timeToRead} min read</span>
                        <span className="capitalize">{article.difficulty.toLowerCase()}</span>
                        {article.viewCount > 0 && (
                          <span>{article.viewCount} views</span>
                        )}
                      </div>

                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-bg-dark/50 text-text-muted text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
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
    </div>
  )
}

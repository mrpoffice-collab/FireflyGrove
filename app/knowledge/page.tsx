'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { SkeletonList, SkeletonTitle } from '@/components/SkeletonLoader'

// Import all Glow Guide components
import AudioSparksGlowGuide from '@/components/glow-guides/AudioSparksGlowGuide'
import NestGlowGuide from '@/components/glow-guides/NestGlowGuide'
import FireflyBurstsGlowGuide from '@/components/glow-guides/FireflyBurstsGlowGuide'
import MemoryThreadingGlowGuide from '@/components/glow-guides/MemoryThreadingGlowGuide'
import StorySparksGlowGuide from '@/components/glow-guides/StorySparksGlowGuide'
import GlowingMemoriesGlowGuide from '@/components/glow-guides/GlowingMemoriesGlowGuide'
import MemoryEditingGlowGuide from '@/components/glow-guides/MemoryEditingGlowGuide'
import MemoryVisibilityGlowGuide from '@/components/glow-guides/MemoryVisibilityGlowGuide'
import MemorySchedulingGlowGuide from '@/components/glow-guides/MemorySchedulingGlowGuide'
import TreesVsBranchesGlowGuide from '@/components/glow-guides/TreesVsBranchesGlowGuide'
import HeirsGlowGuide from '@/components/glow-guides/HeirsGlowGuide'
import SharingGlowGuide from '@/components/glow-guides/SharingGlowGuide'
import VoiceMemoriesGlowGuide from '@/components/glow-guides/VoiceMemoriesGlowGuide'
import PhotoMemoriesGlowGuide from '@/components/glow-guides/PhotoMemoriesGlowGuide'

interface GlowGuideCard {
  id: string
  title: string
  description: string
  icon: string
  category: string
  component: React.ComponentType<{ onClose: () => void; onAction?: () => void }>
}

const categoryLabels: Record<string, string> = {
  GETTING_STARTED: 'Getting Started',
  CORE_FEATURES: 'Core Features',
  SHARING: 'Sharing & Collaboration',
  LEGACY: 'Legacy & Heirs',
  PHOTOS_MEDIA: 'Photos & Media',
  VOICE_AUDIO: 'Voice & Audio',
}

const categoryIcons: Record<string, string> = {
  GETTING_STARTED: '🌱',
  CORE_FEATURES: '✨',
  SHARING: '🤝',
  LEGACY: '🕯️',
  PHOTOS_MEDIA: '📸',
  VOICE_AUDIO: '🎙️',
}

// Define all Glow Guides with metadata
const glowGuides: GlowGuideCard[] = [
  // Getting Started
  {
    id: 'trees-branches',
    title: 'Understanding Trees and Branches',
    description: 'Learn how to organize your family memories',
    icon: '🌳',
    category: 'GETTING_STARTED',
    component: TreesVsBranchesGlowGuide,
  },
  {
    id: 'heirs',
    title: 'Choosing Your Keepers',
    description: 'Select who will preserve your legacy',
    icon: '🕯️',
    category: 'GETTING_STARTED',
    component: HeirsGlowGuide,
  },
  // Core Features
  {
    id: 'audio-sparks',
    title: 'Audio Sparks: Quick Voice Capture',
    description: 'Capture thoughts in seconds with voice',
    icon: '⚡',
    category: 'CORE_FEATURES',
    component: AudioSparksGlowGuide,
  },
  {
    id: 'firefly-bursts',
    title: 'Firefly Bursts: Rediscover Memories',
    description: 'Get reminded of memories at the perfect time',
    icon: '🌟',
    category: 'CORE_FEATURES',
    component: FireflyBurstsGlowGuide,
  },
  {
    id: 'memory-threading',
    title: 'Memory Threading: Join the Conversation',
    description: 'Reply and build on family stories',
    icon: '🧵',
    category: 'CORE_FEATURES',
    component: MemoryThreadingGlowGuide,
  },
  {
    id: 'story-sparks',
    title: 'Story Sparks: Writing Prompts',
    description: 'Get inspired to share your stories',
    icon: '💭',
    category: 'CORE_FEATURES',
    component: StorySparksGlowGuide,
  },
  {
    id: 'glowing-memories',
    title: 'Glowing Memories: React to Stories',
    description: 'Show love with reactions and emojis',
    icon: '💚',
    category: 'CORE_FEATURES',
    component: GlowingMemoriesGlowGuide,
  },
  {
    id: 'memory-editing',
    title: 'Memory Editing: Enrich Your Stories',
    description: 'Add photos, audio, and rich formatting',
    icon: '✏️',
    category: 'CORE_FEATURES',
    component: MemoryEditingGlowGuide,
  },
  {
    id: 'memory-visibility',
    title: 'Memory Visibility: Private vs Shared',
    description: 'Control who sees each memory',
    icon: '👁️',
    category: 'CORE_FEATURES',
    component: MemoryVisibilityGlowGuide,
  },
  {
    id: 'memory-scheduling',
    title: 'Memory Scheduling: Time-Released Stories',
    description: 'Schedule memories for the future',
    icon: '⏰',
    category: 'CORE_FEATURES',
    component: MemorySchedulingGlowGuide,
  },
  // Sharing & Collaboration
  {
    id: 'sharing',
    title: 'Inviting Family Members',
    description: 'Bring your family into the Grove',
    icon: '🤝',
    category: 'SHARING',
    component: SharingGlowGuide,
  },
  // Photos & Media
  {
    id: 'nest',
    title: 'The Nest: Bulk Photo Uploads',
    description: 'Upload hundreds of photos at once',
    icon: '📸',
    category: 'PHOTOS_MEDIA',
    component: NestGlowGuide,
  },
  {
    id: 'photo-memories',
    title: 'Adding Photos to Memories',
    description: 'Enrich your stories with images',
    icon: '🖼️',
    category: 'PHOTOS_MEDIA',
    component: PhotoMemoriesGlowGuide,
  },
  // Voice & Audio
  {
    id: 'voice-memories',
    title: 'Recording Voice Memories',
    description: 'Preserve the sound of your voice',
    icon: '🎙️',
    category: 'VOICE_AUDIO',
    component: VoiceMemoriesGlowGuide,
  },
]

export default function KnowledgeBankPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeGuide, setActiveGuide] = useState<GlowGuideCard | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Filter guides based on search and category
  const filteredGuides = glowGuides.filter((guide) => {
    // Filter by category
    if (selectedCategory && guide.category !== selectedCategory) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        guide.title.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Group guides by category
  const groupedGuides = filteredGuides.reduce((acc, guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = []
    }
    acc[guide.category].push(guide)
    return acc
  }, {} as Record<string, GlowGuideCard[]>)

  const categories = Object.keys(groupedGuides).sort()

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
            Interactive guides to help you master every Firefly Grove feature
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <input
            type="text"
            placeholder="Search interactive guides..."
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
            Found {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'}
          </div>
        )}

        {/* Interactive Glow Guide Cards by Category */}
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
                    ({groupedGuides[category].length})
                  </span>
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedGuides[category].map((guide) => (
                    <button
                      key={guide.id}
                      onClick={() => setActiveGuide(guide)}
                      className="block bg-bg-elevated border-2 border-firefly-dim/30 rounded-lg p-6 hover:border-firefly-glow hover:shadow-lg hover:shadow-firefly-glow/10 transition-soft group text-left"
                    >
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                          {guide.icon}
                        </div>
                      </div>

                      <h3 className="text-base font-medium text-firefly-glow group-hover:text-firefly-glow/90 transition-soft mb-2 text-center">
                        {guide.title}
                      </h3>

                      <p className="text-text-muted text-sm text-center mb-4">
                        {guide.description}
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

      {/* Render Active Glow Guide */}
      {activeGuide && (() => {
        const GlowGuideComponent = activeGuide.component
        return <GlowGuideComponent onClose={() => setActiveGuide(null)} />
      })()}
    </div>
  )
}

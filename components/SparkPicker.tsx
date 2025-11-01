'use client'

import { useState, useEffect } from 'react'

interface Spark {
  id: string
  text: string
  category: string | null
  isGlobal: boolean
  usageCount: number
  collection: {
    id: string
    name: string
    icon: string | null
    userId: string | null
    isSharedWithGrove: boolean
  } | null
  user: {
    id: string
    name: string
  } | null
}

interface SparkPickerProps {
  onSelect: (sparkText: string, sparkId?: string) => void
  onClose: () => void
}

const QUICK_CATEGORIES = ['All', 'Childhood', 'Family', 'Relationships', 'Career', 'Hobbies']

export default function SparkPicker({ onSelect, onClose }: SparkPickerProps) {
  const [sparks, setSparks] = useState<Spark[]>([])
  const [filteredSparks, setFilteredSparks] = useState<Spark[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchSparks()
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredSparks(sparks)
    } else {
      setFilteredSparks(sparks.filter((s) => s.category === selectedCategory))
    }
  }, [selectedCategory, sparks])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/user/session')
      if (response.ok) {
        const data = await response.json()
        setCurrentUserId(data.id)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchSparks = async () => {
    try {
      const response = await fetch('/api/sparks')
      if (response.ok) {
        const data = await response.json()
        setSparks(data)
      }
    } catch (error) {
      console.error('Error fetching sparks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSparkSelect = async (spark: Spark) => {
    // Increment usage count
    try {
      await fetch(`/api/sparks/${spark.id}/use`, { method: 'POST' })
    } catch (error) {
      console.error('Error incrementing spark usage:', error)
    }

    onSelect(spark.text, spark.id)
  }

  const handleCustomSubmit = () => {
    if (customPrompt.trim()) {
      onSelect(customPrompt.trim())
    }
  }

  const handleSkip = () => {
    onSelect('What memory would you like to share?')
  }

  // Separate user's own sparks from shared sparks
  const mySparks = filteredSparks.filter(spark =>
    !spark.collection?.isSharedWithGrove || spark.collection?.userId === currentUserId
  )

  const sharedSparks = filteredSparks.filter(spark =>
    spark.collection?.isSharedWithGrove && spark.collection?.userId !== currentUserId
  )

  // Group sparks by collection
  const groupSparks = (sparkList: Spark[]) => {
    return sparkList.reduce((acc, spark) => {
      const collectionName = spark.collection?.name || 'Uncategorized'
      if (!acc[collectionName]) {
        acc[collectionName] = {
          icon: spark.collection?.icon || null,
          sparks: [],
          creatorName: spark.user?.name || 'Unknown'
        }
      }
      acc[collectionName].sparks.push(spark)
      return acc
    }, {} as Record<string, { icon: string | null; sparks: Spark[]; creatorName: string }>)
  }

  const groupedMySparks = groupSparks(mySparks)
  const groupedSharedSparks = groupSparks(sharedSparks)

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-2xl font-light text-text-soft mb-2">Choose a Memory Spark</h2>
          <p className="text-text-muted">
            Pick a prompt to inspire your memory, or write your own
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Category Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-soft ${
                  selectedCategory === cat
                    ? 'bg-firefly-dim text-bg-dark'
                    : 'bg-bg-elevated border border-border-subtle text-text-muted hover:border-firefly-dim'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Custom Prompt Input */}
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full mb-4 px-4 py-3 bg-bg-elevated border border-border-subtle hover:border-firefly-dim rounded-lg text-text-muted hover:text-text-soft transition-soft text-left"
            >
              + Write your own custom prompt
            </button>
          ) : (
            <div className="mb-4 p-4 bg-bg-elevated border border-firefly-dim rounded-lg">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="What would you like to remember about?"
                className="w-full px-3 py-2 bg-bg-dark border border-border-subtle rounded text-text-soft placeholder:text-placeholder focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 resize-none mb-3"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customPrompt.trim()}
                  className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Use This Prompt
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomPrompt('')
                  }}
                  className="px-4 py-2 bg-bg-dark border border-border-subtle hover:border-border-default text-text-muted rounded transition-soft"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Sparks Grid */}
          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading sparks...</div>
          ) : filteredSparks.length === 0 ? (
            <div className="text-center py-12 bg-bg-elevated border border-border-subtle rounded-xl">
              <p className="text-text-muted mb-4">
                {sparks.length === 0
                  ? 'No active spark collections. Visit "Manage Spark Collections" to activate some prompts.'
                  : 'No sparks found in this category.'}
              </p>
              {sparks.length === 0 ? (
                <a
                  href="/spark-collections"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft"
                >
                  Manage Collections
                </a>
              ) : (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft"
                >
                  View All Sparks
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* My Sparks Section */}
              {Object.keys(groupedMySparks).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-firefly-dim/30">
                    <h2 className="text-lg font-medium text-firefly-glow">My Sparks</h2>
                    <span className="text-xs text-text-muted">
                      ({Object.values(groupedMySparks).reduce((sum, g) => sum + g.sparks.length, 0)} prompts)
                    </span>
                  </div>
                  <div className="space-y-6">
                    {Object.entries(groupedMySparks).map(([collectionName, { icon, sparks: collectionSparks }]) => (
                      <div key={collectionName}>
                        {/* Collection Header */}
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border-subtle">
                          {icon && <span className="text-xl">{icon}</span>}
                          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
                            {collectionName}
                          </h3>
                          <span className="text-xs text-text-muted ml-auto">
                            {collectionSparks.length} {collectionSparks.length === 1 ? 'prompt' : 'prompts'}
                          </span>
                        </div>

                        {/* Collection Sparks */}
                        <div className="grid gap-3">
                          {collectionSparks.map((spark) => (
                            <button
                              key={spark.id}
                              onClick={() => handleSparkSelect(spark)}
                              className="text-left p-4 bg-bg-elevated border border-border-subtle hover:border-firefly-dim rounded-lg transition-soft group"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-text-soft group-hover:text-firefly-glow transition-soft">
                                  {spark.text}
                                </p>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {spark.isGlobal && (
                                    <span className="px-2 py-1 bg-green-500/10 text-success-text rounded text-xs">
                                      Popular
                                    </span>
                                  )}
                                  {spark.category && (
                                    <span className="px-2 py-1 bg-firefly-dim/10 text-firefly-glow rounded text-xs">
                                      {spark.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {spark.usageCount > 0 && (
                                <p className="text-text-muted text-xs mt-2">
                                  Used {spark.usageCount} times
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Sparks Section */}
              {Object.keys(groupedSharedSparks).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-400/30">
                    <h2 className="text-lg font-medium text-blue-300">Shared Sparks</h2>
                    <span className="text-xs text-text-muted">
                      ({Object.values(groupedSharedSparks).reduce((sum, g) => sum + g.sparks.length, 0)} prompts from your Grove)
                    </span>
                  </div>
                  <div className="space-y-6">
                    {Object.entries(groupedSharedSparks).map(([collectionName, { icon, sparks: collectionSparks, creatorName }]) => (
                      <div key={collectionName}>
                        {/* Collection Header */}
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border-subtle">
                          {icon && <span className="text-xl">{icon}</span>}
                          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
                            {collectionName}
                          </h3>
                          <span className="text-xs text-blue-300 ml-2">
                            by {creatorName}
                          </span>
                          <span className="text-xs text-text-muted ml-auto">
                            {collectionSparks.length} {collectionSparks.length === 1 ? 'prompt' : 'prompts'}
                          </span>
                        </div>

                        {/* Collection Sparks */}
                        <div className="grid gap-3">
                          {collectionSparks.map((spark) => (
                            <button
                              key={spark.id}
                              onClick={() => handleSparkSelect(spark)}
                              className="text-left p-4 bg-bg-elevated border border-blue-500/20 hover:border-blue-400/40 rounded-lg transition-soft group"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-text-soft group-hover:text-blue-300 transition-soft">
                                  {spark.text}
                                </p>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs">
                                    Shared
                                  </span>
                                  {spark.category && (
                                    <span className="px-2 py-1 bg-firefly-dim/10 text-firefly-glow rounded text-xs">
                                      {spark.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {spark.usageCount > 0 && (
                                <p className="text-text-muted text-xs mt-2">
                                  Used {spark.usageCount} times
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-subtle flex justify-between items-center gap-4">
          <a
            href="/spark-collections"
            target="_blank"
            rel="noopener noreferrer"
            className="text-firefly-glow hover:text-firefly-bright text-sm transition-soft"
          >
            ✨ Manage Spark Collections →
          </a>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-bg-darker border border-border-subtle hover:border-border-default text-text-muted rounded transition-soft"
            >
              Cancel
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow rounded transition-soft"
            >
              Skip & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

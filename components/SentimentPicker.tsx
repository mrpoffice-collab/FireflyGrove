'use client'

// Version: 2.0 - Large preview cards with icons
import { useState, useEffect } from 'react'

interface Sentiment {
  id: string
  coverMessage: string
  insideMessage: string
  tags: string | null
}

interface SentimentPickerProps {
  categoryId: string
  selectedSentiment: Sentiment | null
  onSelect: (sentiment: Sentiment) => void
}

export default function SentimentPicker({
  categoryId,
  selectedSentiment,
  onSelect,
}: SentimentPickerProps) {
  const [sentiments, setSentiments] = useState<Sentiment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!categoryId) return

    const fetchSentiments = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/cards/sentiments?categoryId=${categoryId}`)
        const data = await res.json()
        setSentiments(data.sentiments || [])

        // Auto-select first sentiment if none selected
        if (data.sentiments?.length > 0 && !selectedSentiment) {
          onSelect(data.sentiments[0])
        }
      } catch (error) {
        console.error('Failed to fetch sentiments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSentiments()
  }, [categoryId])

  if (loading) {
    return (
      <div className="mb-6">
        <label className="block text-text-soft text-sm font-medium mb-3">
          Firefly Grove Message
        </label>
        <div className="bg-bg-elevated border border-border-subtle rounded p-4 text-text-muted text-sm">
          Loading messages...
        </div>
      </div>
    )
  }

  if (sentiments.length === 0) {
    return (
      <div className="mb-6">
        <label className="block text-text-soft text-sm font-medium mb-3">
          Firefly Grove Message
        </label>
        <div className="bg-bg-elevated border border-border-subtle rounded p-6 text-center">
          <p className="text-text-muted text-sm">
            📝 Coming soon! We're crafting beautiful messages for this category.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-text-soft text-sm font-medium">
          Firefly Grove Message
        </label>
        <span className="text-text-muted text-xs">
          {sentiments.length} {sentiments.length === 1 ? 'option' : 'options'}
        </span>
      </div>

      <p className="text-text-muted text-xs mb-3">
        Choose the poetic message that will appear on your card
      </p>

      {/* All Sentiment Options - Large Preview Cards */}
      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
        {sentiments.map((sentiment, index) => (
          <button
            key={sentiment.id}
            onClick={() => onSelect(sentiment)}
            className={`w-full text-left rounded-xl border-2 transition-all overflow-hidden ${
              selectedSentiment?.id === sentiment.id
                ? 'bg-firefly-dim/10 border-firefly-glow shadow-2xl ring-2 ring-firefly-glow/30'
                : 'bg-bg-elevated border-border-subtle hover:border-firefly-dim/50 hover:shadow-lg'
            }`}
          >
            {/* Option Number & Selection Status */}
            <div className={`px-5 py-2 border-b flex items-center justify-between ${
              selectedSentiment?.id === sentiment.id
                ? 'bg-firefly-glow/10 border-firefly-dim/30'
                : 'bg-bg-dark border-border-subtle'
            }`}>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Option {index + 1}
              </span>
              {selectedSentiment?.id === sentiment.id && (
                <span className="flex items-center gap-1.5 text-firefly-glow text-sm font-medium">
                  <span className="text-lg">✓</span>
                  <span>Selected</span>
                </span>
              )}
            </div>

            {/* Card Preview - Front */}
            <div className="p-6 bg-gradient-to-br from-bg-dark/50 to-bg-darker/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💌</span>
                <span className="text-xs text-text-muted uppercase tracking-wide font-medium">
                  Card Front
                </span>
              </div>
              <p className="text-text-soft text-lg italic leading-relaxed px-4 py-2 border-l-2 border-firefly-dim/30">
                {sentiment.coverMessage}
              </p>
            </div>

            {/* Card Preview - Inside */}
            <div className="p-6 pt-4 bg-bg-elevated">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📖</span>
                <span className="text-xs text-text-muted uppercase tracking-wide font-medium">
                  Inside Message
                </span>
              </div>
              <p className="text-text-soft text-base whitespace-pre-line leading-relaxed px-4 py-2 border-l-2 border-firefly-dim/30">
                {sentiment.insideMessage}
              </p>
            </div>

            {/* Click to Select Hint */}
            {selectedSentiment?.id !== sentiment.id && (
              <div className="px-5 py-3 bg-bg-dark/50 text-center border-t border-border-subtle">
                <p className="text-text-muted text-xs">
                  Click to select this message for your card
                </p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

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

      {/* All Sentiment Options - Show All Upfront */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {sentiments.map((sentiment) => (
          <button
            key={sentiment.id}
            onClick={() => onSelect(sentiment)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedSentiment?.id === sentiment.id
                ? 'bg-firefly-dim/10 border-firefly-dim shadow-lg'
                : 'bg-bg-elevated border-border-subtle hover:border-firefly-dim/50 hover:bg-bg-elevated/80'
            }`}
          >
            {/* Front Message */}
            <div className="mb-3">
              <span className="text-xs text-text-muted uppercase tracking-wide font-medium">
                Front
              </span>
              <p className="text-text-soft text-base italic mt-1 leading-relaxed">
                {sentiment.coverMessage}
              </p>
            </div>

            {/* Inside Message */}
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wide font-medium">
                Inside
              </span>
              <p className="text-text-soft text-sm whitespace-pre-line mt-1 leading-relaxed">
                {sentiment.insideMessage}
              </p>
            </div>

            {/* Selection Indicator */}
            {selectedSentiment?.id === sentiment.id && (
              <div className="mt-3 flex items-center gap-2 text-firefly-glow text-xs font-medium">
                <span>✓</span>
                <span>Selected</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

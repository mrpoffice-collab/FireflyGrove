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
  const [expanded, setExpanded] = useState(false)

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
        <label className="block text-text-soft text-sm font-medium mb-2">
          Firefly Grove Message
        </label>
        <div className="bg-bg-elevated border border-border-subtle rounded p-4 text-text-muted text-sm">
          Loading messages...
        </div>
      </div>
    )
  }

  if (sentiments.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-text-soft text-sm font-medium">
          Firefly Grove Message
        </label>
        <span className="text-text-muted text-xs">
          {sentiments.length} {sentiments.length === 1 ? 'option' : 'options'} available
        </span>
      </div>

      <p className="text-text-muted text-xs mb-3">
        Choose the poetic message that will appear on your card
      </p>

      {/* Selected Sentiment Preview */}
      {selectedSentiment && (
        <div className="bg-bg-elevated border border-border-subtle rounded p-4 mb-3">
          <div className="mb-2">
            <span className="text-xs text-text-muted uppercase tracking-wide">Front</span>
            <p className="text-text-soft text-sm italic mt-1">{selectedSentiment.coverMessage}</p>
          </div>
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wide">Inside</span>
            <p className="text-text-soft text-sm whitespace-pre-line mt-1">
              {selectedSentiment.insideMessage}
            </p>
          </div>
        </div>
      )}

      {/* Change Selection Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 bg-bg-dark border border-border-subtle rounded text-text-soft hover:border-firefly-dim transition-soft text-sm"
      >
        {expanded ? 'Close Options' : 'Choose Different Message'}
      </button>

      {/* Sentiment Options */}
      {expanded && (
        <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
          {sentiments.map((sentiment) => (
            <button
              key={sentiment.id}
              onClick={() => {
                onSelect(sentiment)
                setExpanded(false)
              }}
              className={`w-full text-left p-4 rounded border transition-soft ${
                selectedSentiment?.id === sentiment.id
                  ? 'bg-firefly-dim/10 border-firefly-dim'
                  : 'bg-bg-dark border-border-subtle hover:border-firefly-dim'
              }`}
            >
              <div className="mb-2">
                <span className="text-xs text-text-muted uppercase tracking-wide">Front</span>
                <p className="text-text-soft text-sm italic mt-1">{sentiment.coverMessage}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wide">Inside</span>
                <p className="text-text-soft text-sm whitespace-pre-line mt-1 line-clamp-3">
                  {sentiment.insideMessage}
                </p>
              </div>
              {sentiment.tags && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {sentiment.tags.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-bg-elevated text-text-muted rounded"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

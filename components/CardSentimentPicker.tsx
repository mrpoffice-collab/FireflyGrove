'use client'

import { useEffect, useState } from 'react'

interface Sentiment {
  id: string
  coverMessage: string
  insideMessage: string
  tags: string | null
}

interface CardSentimentPickerProps {
  categoryId: string
  onSelectSentiment: (sentiment: Sentiment) => void
}

export default function CardSentimentPicker({ categoryId, onSelectSentiment }: CardSentimentPickerProps) {
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
      <div className="text-center py-12">
        <div className="text-text-muted">Loading card options...</div>
      </div>
    )
  }

  if (sentiments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">💌</div>
        <h2 className="text-2xl text-text-soft mb-2">Cards Coming Soon</h2>
        <p className="text-text-muted">
          We're crafting beautiful messages for this category.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-firefly-glow mb-4">
          Choose Your Card Message
        </h2>
        <p className="text-text-muted">
          Select the sentiment that best expresses what's in your heart
        </p>
      </div>

      {/* Sentiments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {sentiments.map((sentiment, index) => (
          <button
            key={sentiment.id}
            onClick={() => onSelectSentiment(sentiment)}
            className="bg-bg-dark border-2 border-border-subtle rounded-xl overflow-hidden hover:border-firefly-dim/50 hover:shadow-xl transition-all text-left group"
          >
            {/* Card Number Badge */}
            <div className="bg-bg-elevated border-b border-border-subtle px-4 py-2">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Card Option {index + 1}
              </span>
            </div>

            {/* Front Message Section */}
            <div className="p-6 bg-gradient-to-br from-bg-dark/50 to-bg-darker/50 border-b border-border-subtle">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">💌</span>
                <span className="text-xs text-text-muted uppercase tracking-wide font-medium">
                  Card Front
                </span>
              </div>
              <p className="text-text-soft text-lg italic leading-relaxed px-2 py-2 border-l-2 border-firefly-dim/30 min-h-[80px]">
                {sentiment.coverMessage}
              </p>
            </div>

            {/* Inside Message Preview */}
            <div className="p-6 bg-bg-elevated">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">📖</span>
                <span className="text-xs text-text-muted uppercase tracking-wide font-medium">
                  Inside Message
                </span>
              </div>
              <p className="text-text-soft text-base whitespace-pre-line leading-relaxed px-2 py-2 border-l-2 border-firefly-dim/30 line-clamp-4">
                {sentiment.insideMessage}
              </p>
            </div>

            {/* Hover CTA */}
            <div className="px-6 py-4 bg-bg-dark/50 text-center border-t border-border-subtle group-hover:bg-firefly-dim/10 transition-all">
              <p className="text-text-muted text-sm group-hover:text-firefly-glow transition-all">
                Click to select this card →
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-12 max-w-4xl mx-auto bg-bg-dark border border-border-subtle rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl">✨</span>
          <div>
            <h3 className="text-text-soft font-medium mb-2">What's Next?</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              After selecting your card, you'll be able to add your personal message, signature,
              and photos from your grove. Each card is complimentary for grove owners.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

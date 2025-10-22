'use client'

import { formatDistanceToNow } from 'date-fns'

interface MemoryCardProps {
  entry: {
    id: string
    text: string
    visibility: string
    mediaUrl: string | null
    audioUrl: string | null
    createdAt: string
    author: {
      name: string
    }
  }
}

export default function MemoryCard({ entry }: MemoryCardProps) {
  const visibilityColors = {
    PRIVATE: 'text-text-muted',
    SHARED: 'text-blue-400',
    LEGACY: 'text-purple-400',
  }

  const visibilityLabels = {
    PRIVATE: 'Private',
    SHARED: 'Shared',
    LEGACY: 'Legacy',
  }

  return (
    <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/50 transition-soft">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-firefly-glow">✦</span>
          <span className="text-text-soft text-sm">{entry.author.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${visibilityColors[entry.visibility as keyof typeof visibilityColors]}`}>
            {visibilityLabels[entry.visibility as keyof typeof visibilityLabels]}
          </span>
          <span className="text-text-muted text-xs">
            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <p className="text-text-soft leading-relaxed whitespace-pre-wrap">
        {entry.text}
      </p>

      {entry.mediaUrl && (
        <div className="mt-4">
          <img
            src={entry.mediaUrl}
            alt="Memory"
            className="rounded-lg max-w-full h-auto"
          />
        </div>
      )}

      {entry.audioUrl && (
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={entry.audioUrl} type="audio/webm" />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </div>
  )
}

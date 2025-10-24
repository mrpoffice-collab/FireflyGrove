'use client'

import { useState } from 'react'

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(false)
  const isBeta = process.env.NEXT_PUBLIC_IS_BETA === 'true'

  if (!isBeta || dismissed) {
    return null
  }

  return (
    <div className="bg-firefly-dim/50 border-b border-firefly-dim px-4 py-3 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="bg-firefly-glow text-bg-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Beta
          </span>
          <p className="text-text-soft text-sm font-medium">
            Firefly Grove is in beta. Your memories are safe, but please{' '}
            <a
              href="/feedback"
              className="underline hover:text-firefly-glow transition-soft font-semibold"
            >
              report any snags
            </a>
            .
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-soft hover:text-firefly-glow text-lg font-bold transition-soft ml-4"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

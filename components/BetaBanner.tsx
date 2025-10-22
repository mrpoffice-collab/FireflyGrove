'use client'

import { useState } from 'react'

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(false)
  const isBeta = process.env.NEXT_PUBLIC_IS_BETA === 'true'

  if (!isBeta || dismissed) {
    return null
  }

  return (
    <div className="bg-firefly-dim/20 border-b border-firefly-dim/30 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="text-firefly-glow text-sm font-medium">
            Beta
          </span>
          <p className="text-text-soft text-sm">
            Firefly Grove is in beta. Your memories are safe, but please{' '}
            <a
              href="/feedback"
              className="underline hover:text-firefly-glow transition-soft"
            >
              report any snags
            </a>
            .
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-muted hover:text-text-soft text-sm transition-soft"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface TierConfig {
  monthlyLimit: number | string
  storageDays: number | null
  hasWatermark: boolean
  displayName: string
}

interface VideoLimits {
  planType: string
  tierConfig: TierConfig
  usage: {
    monthlyCount: number
    remaining: number | string
    canGenerate: boolean
  }
}

export default function VideoLimitsDisplay() {
  const [limits, setLimits] = useState<VideoLimits | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/video-generation/check-limits')
      .then((res) => res.json())
      .then((data) => {
        setLimits(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch video limits:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-bg-dark border border-border-subtle rounded-lg p-4">
        <div className="text-text-muted text-sm">Loading usage limits...</div>
      </div>
    )
  }

  if (!limits) {
    return null
  }

  const { tierConfig, usage } = limits
  const isUnlimited = usage.remaining === 'Unlimited'
  const isNearLimit = !isUnlimited && typeof usage.remaining === 'number' && usage.remaining <= 1
  const atLimit = !usage.canGenerate

  return (
    <div className={`
      bg-bg-dark border rounded-lg p-4
      ${atLimit ? 'border-red-500/50' : isNearLimit ? 'border-yellow-500/50' : 'border-border-subtle'}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-text-soft mb-1">
            Video Generation Limits
          </h3>
          <p className="text-xs text-text-muted">
            {tierConfig.displayName} Plan
          </p>
        </div>
        <div className={`
          px-2 py-1 rounded text-xs font-medium
          ${atLimit ? 'bg-red-500/20 text-error-text border border-red-500/30' :
            isNearLimit ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-firefly-dim/20 text-firefly-glow border border-firefly-dim/30'}
        `}>
          {isUnlimited ? '∞' : `${usage.remaining} left`}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">This Month:</span>
          <span className="text-text-soft font-medium">
            {usage.monthlyCount} / {tierConfig.monthlyLimit}
          </span>
        </div>

        {tierConfig.storageDays && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Storage:</span>
            <span className="text-text-soft">
              {tierConfig.storageDays} days
            </span>
          </div>
        )}

        {tierConfig.hasWatermark && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠</span>
            <span className="text-yellow-400 text-xs">
              Videos include watermark
            </span>
          </div>
        )}
      </div>

      {atLimit && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-error-text text-xs mb-3">
            You've reached your monthly limit. Upgrade for more videos!
          </p>
          <Link
            href="/billing"
            className="block w-full text-center px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium text-sm transition-soft"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {isNearLimit && !atLimit && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-yellow-400 text-xs mb-2">
            Running low on videos this month
          </p>
          <Link
            href="/billing"
            className="text-firefly-glow hover:text-firefly-dim text-xs underline"
          >
            Upgrade for unlimited →
          </Link>
        </div>
      )}
    </div>
  )
}

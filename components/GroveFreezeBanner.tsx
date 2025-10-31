'use client'

import { useRouter } from 'next/navigation'

interface GroveFreezeBannerProps {
  groveId: string
  groveName: string
  frozenTreeCount?: number
  planType: string
}

export default function GroveFreezeBanner({
  groveId,
  groveName,
  frozenTreeCount = 0,
  planType,
}: GroveFreezeBannerProps) {
  const router = useRouter()

  const handleReactivateGrove = () => {
    router.push('/billing')
  }

  const handleUpgrade = () => {
    router.push('/billing')
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 border-2 border-blue-400/30 rounded-lg p-6 mb-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-4">
        {/* Freeze Icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-12 h-12 text-blue-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2v20m0-20l-3 3m3-3l3 3m-3 17l-3-3m3 3l3-3M2 12h20M2 12l3-3m-3 3l3 3m17-3l-3-3m3 3l-3 3"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <span>❄️</span>
            Your Grove is Frozen
          </h3>
          <p className="text-blue-100 mb-4">
            Your {planType} Grove subscription has expired. Your memories are
            safe and preserved, but new content cannot be added until you
            reactivate your subscription.
          </p>

          {frozenTreeCount > 0 && (
            <div className="mb-4 p-3 bg-blue-950/50 border border-blue-400/20 rounded">
              <p className="text-sm text-blue-200">
                <strong>{frozenTreeCount}</strong> tree
                {frozenTreeCount !== 1 ? 's are' : ' is'} currently frozen.
                Trees with individual subscriptions remain active.
              </p>
            </div>
          )}

          {/* What Happens When Frozen */}
          <div className="mb-4">
            <p className="text-sm font-medium text-blue-200 mb-2">
              While frozen:
            </p>
            <ul className="text-sm text-blue-100 space-y-1 list-disc list-inside">
              <li>All memories are safe and can be viewed</li>
              <li>No new memories can be added</li>
              <li>Existing memories cannot be edited</li>
              <li>Trees with individual subscriptions stay active</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleReactivateGrove}
              className="px-6 py-3 bg-gradient-to-r from-firefly-dim to-firefly-glow hover:from-firefly-glow hover:to-firefly-dim text-bg-dark font-semibold rounded-lg transition-all shadow-lg hover:shadow-firefly-glow/50 transform hover:scale-105"
            >
              🔓 Reactivate Your Grove
            </button>
            <button
              onClick={handleUpgrade}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium rounded-lg transition-all"
            >
              View Plans & Pricing
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-blue-200 mt-4">
            Questions about reactivation? Visit{' '}
            <a
              href="/billing"
              className="underline hover:text-white transition-colors"
            >
              billing settings
            </a>{' '}
            or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}

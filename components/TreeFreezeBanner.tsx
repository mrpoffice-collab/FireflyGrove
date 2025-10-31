'use client'

import { useRouter } from 'next/navigation'

interface TreeFreezeBannerProps {
  personName: string
  freezeReason: 'grove_expired' | 'tree_subscription_expired'
  groveId?: string
  membershipId?: string
  treePrice?: string
}

export default function TreeFreezeBanner({
  personName,
  freezeReason,
  groveId,
  membershipId,
  treePrice = '$4.99/year',
}: TreeFreezeBannerProps) {
  const router = useRouter()

  const handleReactivate = () => {
    router.push('/billing')
  }

  const handleReactivateTree = () => {
    // Navigate to tree-specific subscription page
    if (membershipId) {
      router.push(`/billing?reactivate=${membershipId}`)
    } else {
      router.push('/billing')
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/70 to-indigo-900/70 border border-blue-400/30 rounded-lg p-5 mb-6 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        {/* Ice Icon */}
        <div className="flex-shrink-0 text-3xl">❄️</div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            This Tree is Frozen
          </h3>

          {freezeReason === 'grove_expired' ? (
            <>
              <p className="text-blue-100 text-sm mb-3">
                Your Grove subscription has expired. {personName}'s memories are
                safe and can be viewed, but new memories cannot be added until
                you reactivate.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleReactivate}
                  className="px-4 py-2 bg-gradient-to-r from-firefly-dim to-firefly-glow hover:from-firefly-glow hover:to-firefly-dim text-bg-dark text-sm font-semibold rounded transition-all shadow-md hover:shadow-lg"
                >
                  Renew Grove Subscription
                </button>
                <button
                  onClick={handleReactivateTree}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-medium rounded transition-all"
                >
                  Or Reactivate Just This Tree ({treePrice})
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-blue-100 text-sm mb-3">
                The individual subscription for {personName}'s Tree has expired.
                Memories are preserved but cannot be edited or added to until
                you reactivate.
              </p>
              <button
                onClick={handleReactivateTree}
                className="px-4 py-2 bg-gradient-to-r from-firefly-dim to-firefly-glow hover:from-firefly-glow hover:to-firefly-dim text-bg-dark text-sm font-semibold rounded transition-all shadow-md hover:shadow-lg"
              >
                Reactivate This Tree ({treePrice})
              </button>
            </>
          )}

          <p className="text-xs text-blue-200 mt-3">
            All your memories are safe. Reactivate anytime to continue adding
            memories.
          </p>
        </div>
      </div>
    </div>
  )
}

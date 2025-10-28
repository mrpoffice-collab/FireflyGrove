'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface NestNudgeProps {
  userId: string
}

export default function NestNudge({ userId }: NestNudgeProps) {
  const router = useRouter()
  const [showNudge, setShowNudge] = useState(false)
  const [oldItemCount, setOldItemCount] = useState(0)
  const [oldestDays, setOldestDays] = useState(0)

  useEffect(() => {
    checkNestItems()
  }, [userId])

  const checkNestItems = async () => {
    try {
      // Ensure we have a userId
      if (!userId) {
        console.log('[NestNudge] No userId provided, skipping check')
        return
      }

      // Check if we've shown the nudge recently (within 8 hours)
      const lastShownKey = `nest-nudge-${userId}`
      const lastShown = localStorage.getItem(lastShownKey)

      if (lastShown) {
        const lastShownTime = parseInt(lastShown, 10)
        const eightHoursInMs = 8 * 60 * 60 * 1000
        const now = Date.now()
        const timeSinceLastShown = now - lastShownTime
        const hoursAgo = (timeSinceLastShown / (1000 * 60 * 60)).toFixed(1)

        console.log(`[NestNudge] Last shown ${hoursAgo} hours ago`)

        // If less than 8 hours since last shown, don't show again
        if (timeSinceLastShown < eightHoursInMs) {
          console.log('[NestNudge] Too soon to show again, skipping')
          return
        }
      } else {
        console.log('[NestNudge] First time checking nest for this user')
      }

      // Fetch nest items
      const res = await fetch('/api/nest')
      if (!res.ok) {
        console.log('[NestNudge] Failed to fetch nest items:', res.status)
        return
      }

      const data = await res.json()
      const items = data.items || data

      console.log(`[NestNudge] Found ${items.length} nest items`)

      if (!Array.isArray(items) || items.length === 0) {
        console.log('[NestNudge] No nest items found')
        return
      }

      // Check for items older than 10 days
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

      console.log(`[NestNudge] Checking for items older than ${tenDaysAgo.toISOString()}`)

      const oldItems = items.filter((item: any) => {
        const uploadDate = new Date(item.uploadedAt)
        return uploadDate < tenDaysAgo
      })

      console.log(`[NestNudge] Found ${oldItems.length} items older than 10 days`)

      if (oldItems.length > 0) {
        // Calculate oldest item age
        const oldestItem = oldItems.reduce((oldest: any, current: any) => {
          const oldestDate = new Date(oldest.uploadedAt)
          const currentDate = new Date(current.uploadedAt)
          return currentDate < oldestDate ? current : oldest
        }, oldItems[0])

        const oldestDate = new Date(oldestItem.uploadedAt)
        const daysOld = Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))

        console.log(`[NestNudge] Oldest item is ${daysOld} days old`)
        console.log(`[NestNudge] Showing nudge for ${oldItems.length} old items`)

        setOldItemCount(oldItems.length)
        setOldestDays(daysOld)
        setShowNudge(true)

        // Record that we showed the nudge
        localStorage.setItem(lastShownKey, Date.now().toString())
        console.log('[NestNudge] Timestamp saved to localStorage')
      } else {
        console.log('[NestNudge] No items older than 10 days, not showing nudge')
      }
    } catch (error) {
      console.error('Failed to check nest items:', error)
    }
  }

  const handleGoToNest = () => {
    setShowNudge(false)
    router.push('/nest')
  }

  const handleDismiss = () => {
    setShowNudge(false)
  }

  if (!showNudge) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-bg-dark border-2 border-firefly-dim rounded-lg max-w-md w-full p-6 shadow-2xl animate-slideUp">
        {/* Firefly Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2 animate-pulse">🪺</div>
          <h3 className="text-2xl text-text-soft font-light mb-2">
            Your Nest is Waiting
          </h3>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-text-muted mb-2">
            You have <span className="text-firefly-glow font-medium">{oldItemCount}</span>{' '}
            {oldItemCount === 1 ? 'photo' : 'photos'} in your nest waiting to become{' '}
            {oldItemCount === 1 ? 'a memory' : 'memories'}
          </p>
          <p className="text-text-muted text-sm">
            Your oldest photo has been waiting for{' '}
            <span className="text-orange-400 font-medium">{oldestDays} days</span>
          </p>
        </div>

        {/* Gentle Encouragement */}
        <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-text-soft text-center italic">
            "Every photo has a story. Take a moment to let those memories bloom."
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 bg-bg-darker hover:bg-border-subtle text-text-muted rounded-lg transition-soft text-sm"
          >
            Later
          </button>
          <button
            onClick={handleGoToNest}
            className="flex-1 py-2.5 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft text-sm"
          >
            Go to Nest 🪺
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-text-muted text-center mt-4">
          You'll see this reminder every 8 hours if you have photos waiting
        </p>
      </div>
    </div>
  )
}

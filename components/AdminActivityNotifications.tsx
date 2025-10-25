'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Activity {
  id: string
  type: 'user_signup' | 'beta_signup' | 'grove_created'
  message: string
  user: {
    name: string
    email: string
  }
  grove?: {
    name: string
  }
  timestamp: string
}

interface Toast {
  id: string
  message: string
  timestamp: string
}

export default function AdminActivityNotifications() {
  const { data: session } = useSession()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [seenActivityIds, setSeenActivityIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Only run if user is authenticated
    if (!session?.user) return

    // Check if user is admin (we'll check server-side too)
    const checkActivity = async () => {
      try {
        const res = await fetch('/api/admin/activity')

        // If we get a 403, user is not admin - stop polling
        if (res.status === 403) {
          return
        }

        if (!res.ok) return

        const data = await res.json()
        const activities: Activity[] = data.activities || []

        // Filter out activities we've already seen
        const newActivities = activities.filter(
          (activity) => !seenActivityIds.has(activity.id)
        )

        if (newActivities.length > 0) {
          // Add new toasts
          const newToasts = newActivities.map((activity) => ({
            id: activity.id,
            message: activity.message,
            timestamp: activity.timestamp,
          }))

          setToasts((prev) => [...newToasts, ...prev].slice(0, 5)) // Keep max 5 toasts

          // Mark these as seen
          setSeenActivityIds((prev) => {
            const updated = new Set(prev)
            newActivities.forEach((a) => updated.add(a.id))
            return updated
          })

          // Auto-dismiss after 10 seconds
          newToasts.forEach((toast) => {
            setTimeout(() => {
              dismissToast(toast.id)
            }, 10000)
          })
        }
      } catch (error) {
        // Silently fail - admin feature should not break normal usage
        console.error('Error checking admin activity:', error)
      }
    }

    // Check immediately
    checkActivity()

    // Poll every 30 seconds
    const interval = setInterval(checkActivity, 30000)

    return () => clearInterval(interval)
  }, [session, seenActivityIds])

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-bg-dark border border-firefly-dim/50 rounded-lg p-4 shadow-lg animate-slide-in-right"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-firefly-glow text-lg">✨</span>
                <p className="text-text-soft text-sm font-medium">New Activity</p>
              </div>
              <p className="text-text-muted text-sm">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-text-muted hover:text-text-soft transition-soft flex-shrink-0"
              title="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

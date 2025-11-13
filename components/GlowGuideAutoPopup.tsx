'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  initializeGlowGuideSession,
  getNextGuideToShow,
  recordPopupShown,
  PopupTrigger,
} from '@/lib/glowGuideAutoPopup'
import { getGlowGuide } from '@/lib/glowGuideRegistry'

/**
 * Auto-popup system for Glow Guides
 *
 * Place this component in the root layout to enable automatic
 * Glow Guide popups throughout the app for engagement.
 */
export default function GlowGuideAutoPopup() {
  const pathname = usePathname()
  const [activeGuideSlug, setActiveGuideSlug] = useState<string | null>(null)
  const [hasShownOnLoad, setHasShownOnLoad] = useState(false)

  // Initialize session tracking
  useEffect(() => {
    initializeGlowGuideSession()
  }, [])

  // Page load trigger
  useEffect(() => {
    if (hasShownOnLoad) return

    // Wait 2 seconds after page load before considering popup
    const timer = setTimeout(() => {
      const guide = getNextGuideToShow('page-load')
      if (guide) {
        setActiveGuideSlug(guide)
        recordPopupShown(guide)
        setHasShownOnLoad(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [pathname, hasShownOnLoad])

  // Idle trigger (30 seconds of no activity)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        if (activeGuideSlug) return // Don't show if one is already active

        const guide = getNextGuideToShow('idle-30s')
        if (guide) {
          setActiveGuideSlug(guide)
          recordPopupShown(guide)
        }
      }, 30000) // 30 seconds
    }

    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer)
    })

    resetIdleTimer()

    return () => {
      clearTimeout(idleTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [activeGuideSlug])

  // Time on site trigger (2 minutes)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeGuideSlug) return

      const guide = getNextGuideToShow('time-on-site-2m')
      if (guide) {
        setActiveGuideSlug(guide)
        recordPopupShown(guide)
      }
    }, 120000) // 2 minutes

    return () => clearTimeout(timer)
  }, [pathname, activeGuideSlug])

  // Random interval trigger (every 5-15 minutes)
  useEffect(() => {
    const scheduleRandomPopup = () => {
      const randomMinutes = 5 + Math.random() * 10 // 5-15 minutes
      const timer = setTimeout(() => {
        if (activeGuideSlug) return

        const guide = getNextGuideToShow('random-interval')
        if (guide) {
          setActiveGuideSlug(guide)
          recordPopupShown(guide)
        }

        // Schedule next random popup
        scheduleRandomPopup()
      }, randomMinutes * 60 * 1000)

      return timer
    }

    const timer = scheduleRandomPopup()
    return () => clearTimeout(timer)
  }, [activeGuideSlug])

  // Scroll trigger (50% down page)
  useEffect(() => {
    const handleScroll = () => {
      if (activeGuideSlug) return

      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100

      if (scrollPercent > 50) {
        const guide = getNextGuideToShow('scroll-50')
        if (guide) {
          setActiveGuideSlug(guide)
          recordPopupShown(guide)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeGuideSlug])

  // Return visit trigger
  useEffect(() => {
    // Check if this is a return visit (session count > 0)
    const timer = setTimeout(() => {
      if (activeGuideSlug) return

      const guide = getNextGuideToShow('return-visit')
      if (guide) {
        setActiveGuideSlug(guide)
        recordPopupShown(guide)
      }
    }, 5000) // Wait 5 seconds on return visit

    return () => clearTimeout(timer)
  }, [pathname, activeGuideSlug])

  // Get the Glow Guide component
  const ActiveGlowGuide = activeGuideSlug ? getGlowGuide(activeGuideSlug) : null

  if (!ActiveGlowGuide) return null

  return (
    <ActiveGlowGuide
      onClose={() => setActiveGuideSlug(null)}
      onAction={() => {
        // Navigate to the feature (TODO: Add feature navigation)
        setActiveGuideSlug(null)
      }}
    />
  )
}

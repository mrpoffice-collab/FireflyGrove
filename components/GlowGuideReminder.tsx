'use client'

import { useEffect, useState } from 'react'

interface GlowGuideReminderProps {
  guideSlug: string
  guideTitle: string
  show: boolean
  onClose: () => void
}

export default function GlowGuideReminder({
  guideSlug,
  guideTitle,
  show,
  onClose,
}: GlowGuideReminderProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      // Fade in after a brief delay
      const timer = setTimeout(() => setVisible(true), 300)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [show])

  useEffect(() => {
    if (show) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [show])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300) // Wait for fade-out animation
  }

  const handleViewInKnowledgeBank = () => {
    window.location.href = `/knowledge/${guideSlug}`
  }

  if (!show) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-firefly-glow mb-1">
              You can always find this tip again
            </h4>
            <p className="text-xs text-text-muted mb-3">
              "{guideTitle}" is saved in your Knowledge Bank
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewInKnowledgeBank}
                className="px-3 py-1.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark text-xs rounded font-medium transition-soft"
              >
                View in Knowledge Bank
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-text-muted hover:text-text-soft text-xs transition-soft"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text-soft transition-soft"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

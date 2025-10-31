'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import FocusTrap from 'focus-trap-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { data: session } = useSession()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    page: '',
    description: '',
    severity: 'suggestion',
  })
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)

  // Store trigger element and restore focus on close
  useEffect(() => {
    if (isOpen) {
      setTriggerElement(document.activeElement as HTMLElement)
    }
    return () => {
      if (!isOpen && triggerElement) {
        setTimeout(() => triggerElement.focus(), 0)
      }
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Capture the current page when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      setFormData(prev => ({ ...prev, page: currentPath }))
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        // Reset and close after 2 seconds
        setTimeout(() => {
          setSubmitted(false)
          setFormData({ page: '', description: '', severity: 'suggestion' })
          onClose()
        }, 2000)
      } else {
        const error = await response.json()
        alert(`Failed to submit feedback: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    }
  }

  const handleClose = () => {
    setSubmitted(false)
    setFormData({ page: '', description: '', severity: 'suggestion' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Very subtle backdrop - minimal blur so text is readable */}
      <div
        className="fixed inset-0 bg-black/20 z-[9998]"
        onClick={handleClose}
      />

      {/* Compact panel - bottom right */}
      <FocusTrap active={isOpen}>
        <div className="fixed bottom-6 right-6 z-[9999] w-full max-w-sm pointer-events-none">
          <div
            className="bg-bg-dark/95 backdrop-blur-md border border-border-subtle rounded-lg shadow-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
          >
          {submitted ? (
            <div className="p-6 text-center">
              <div className="text-firefly-glow text-4xl mb-3">✓</div>
              <h3 className="text-lg text-text-soft mb-1">Thank you!</h3>
              <p className="text-text-muted text-sm">Feedback received</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">💬</span>
                  <h3 id="feedback-modal-title" className="text-sm font-medium text-text-soft">Beta Feedback</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-text-muted hover:text-text-soft transition-soft"
                  aria-label="Close feedback modal"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-3">
                  <div>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft text-sm"
                    >
                      <option value="suggestion">💡 Suggestion</option>
                      <option value="minor">🐛 Bug - Minor</option>
                      <option value="moderate">⚠️ Bug - Moderate</option>
                      <option value="critical">🚨 Bug - Critical</option>
                      <option value="data-loss">💔 Data loss</option>
                      <option value="other">💬 Other</option>
                    </select>
                  </div>

                  <div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What happened? What would you like to see?"
                      className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none text-sm"
                      rows={4}
                      required
                    />
                  </div>

                  {session && (
                    <div className="text-xs text-text-muted">
                      From: {formData.page}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2 bg-bg-darker border border-border-subtle hover:bg-border-subtle text-text-soft rounded transition-soft text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.description}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-soft disabled:opacity-50 text-sm"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
          </div>
        </div>
      </FocusTrap>
    </>
  )
}

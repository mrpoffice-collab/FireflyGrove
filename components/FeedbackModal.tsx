'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-[9998] backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-bg-dark border border-border-subtle rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {submitted ? (
            <div className="p-8 text-center">
              <div className="text-firefly-glow text-5xl mb-4">✓</div>
              <h2 className="text-2xl text-text-soft mb-2">Thank you!</h2>
              <p className="text-text-muted">
                We've received your feedback and will review it carefully.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <div>
                  <h2 className="text-2xl font-light text-text-soft">Beta Feedback</h2>
                  <p className="text-text-muted text-sm mt-1">
                    Help us improve Firefly Grove
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-text-muted hover:text-text-soft transition-soft"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-soft mb-2">
                      Page
                    </label>
                    <input
                      type="text"
                      value={formData.page}
                      onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                      placeholder="Current page"
                      className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft text-sm"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-soft mb-2">
                      Type of feedback
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft text-sm"
                    >
                      <option value="suggestion">💡 Suggestion / Feature Request</option>
                      <option value="minor">🐛 Bug - Minor (small annoyance)</option>
                      <option value="moderate">⚠️ Bug - Moderate (affects experience)</option>
                      <option value="critical">🚨 Bug - Critical (can't use app)</option>
                      <option value="data-loss">💔 Data loss (lost a memory)</option>
                      <option value="other">💬 Other feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-text-soft mb-2">
                      Details *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="For bugs: What were you trying to do? What happened instead?&#10;For suggestions: What would you like to see? How would it help?"
                      className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none text-sm"
                      rows={5}
                      required
                    />
                  </div>

                  {session && (
                    <div className="text-xs text-text-muted bg-bg-darker rounded p-3">
                      <p className="mb-1 font-medium">Includes:</p>
                      <ul className="space-y-0.5">
                        <li>• Email: {session.user?.email}</li>
                        <li>• User ID: {(session.user as any)?.id}</li>
                        <li>• Timestamp: {new Date().toLocaleString()}</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
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
                    className="flex-1 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 text-sm"
                  >
                    Send Feedback
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}

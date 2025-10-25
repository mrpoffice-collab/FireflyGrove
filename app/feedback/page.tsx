'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'

export default function FeedbackPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    page: '',
    description: '',
    severity: 'suggestion',
  })

  // Capture the referring page on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      const currentUrl = window.location.href

      // Use referrer if available, otherwise use stored page from localStorage
      let fromPage = referrer || localStorage.getItem('feedbackFromPage') || ''

      // If referrer is the current page or empty, try to get from localStorage
      if (!fromPage || fromPage === currentUrl) {
        fromPage = localStorage.getItem('feedbackFromPage') || 'Direct navigation'
      }

      setFormData(prev => ({ ...prev, page: fromPage }))

      // Clear the stored page after using it
      localStorage.removeItem('feedbackFromPage')
    }
  }, [])

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
      } else {
        const error = await response.json()
        alert(`Failed to submit feedback: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        {session && <Header userName={session.user?.name || ''} />}

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-firefly-glow text-5xl mb-6">✓</div>
            <h1 className="text-3xl text-text-soft mb-4">Thank you</h1>
            <p className="text-text-muted mb-8">
              We've received your feedback and will review it carefully.
              Your input helps make Firefly Grove better for everyone.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {session && <Header userName={session.user?.name || ''} />}

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-light text-text-soft mb-2">
            Beta Feedback
          </h1>
          <p className="text-text-muted mb-8">
            Help us improve Firefly Grove. Let us know about bugs, suggestions, or anything that could be better.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    Page (automatically captured)
                  </label>
                  <input
                    type="text"
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    placeholder="The page you were on will appear here"
                    className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    You can edit this if needed
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    Type of feedback
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
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
                    Details
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="For bugs: What were you trying to do? What happened instead?&#10;For suggestions: What would you like to see? How would it help?"
                    className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
                    rows={6}
                    required
                  />
                </div>

                {session && (
                  <div className="text-xs text-text-muted bg-bg-darker rounded p-3">
                    <p className="mb-1">This will be sent with:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your email: {session.user?.email}</li>
                      <li>User ID: {(session.user as any)?.id}</li>
                      <li>Build version: {process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev'}</li>
                      <li>Timestamp: {new Date().toLocaleString()}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 bg-bg-dark border border-border-subtle hover:bg-border-subtle text-text-soft rounded-lg transition-soft"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.description}
                className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50"
              >
                Send Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Header from '@/components/Header'

export default function FeedbackPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    page: typeof window !== 'undefined' ? document.referrer : '',
    description: '',
    severity: 'minor',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // In production, this would send to a support system
    console.log('Feedback submitted:', {
      ...formData,
      userId: (session?.user as any)?.id,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString(),
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev',
    })

    setSubmitted(true)
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
            Report a Snag
          </h1>
          <p className="text-text-muted mb-8">
            Let us know if something isn't working as expected.
            We're here to help.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    What page were you on?
                  </label>
                  <input
                    type="text"
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    placeholder="e.g., Branch detail page, Login page"
                    className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    How urgent is this?
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  >
                    <option value="minor">Minor - Small annoyance</option>
                    <option value="moderate">Moderate - Affects my experience</option>
                    <option value="critical">Critical - Can't use the app</option>
                    <option value="data-loss">Data loss - Lost a memory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    What happened?
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you were trying to do and what went wrong..."
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

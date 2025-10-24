'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function BetaInvitesPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setResult({ type: 'error', message: 'Email is required' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/send-beta-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ type: 'success', message: data.message })
        // Clear form on success
        setEmail('')
        setName('')
        setMessage('')
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to send invite' })
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-text-soft mb-2">
            Send Beta Invite
          </h1>
          <p className="text-text-muted">
            Invite beta testers to try Firefly Grove. They'll receive a welcome email with instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-bg-elevated p-6 rounded-lg border border-border-subtle">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-soft mb-2">
              Email Address <span className="text-firefly-glow">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="beta-tester@example.com"
              className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder-text-muted focus:outline-none focus:border-firefly-dim transition-soft"
              required
              disabled={sending}
            />
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-soft mb-2">
              Name <span className="text-text-muted text-xs">(optional)</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder-text-muted focus:outline-none focus:border-firefly-dim transition-soft"
              disabled={sending}
            />
            <p className="mt-1 text-xs text-text-muted">
              Will personalize the email greeting (defaults to "there" if not provided)
            </p>
          </div>

          {/* Custom Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-text-soft mb-2">
              Custom Message <span className="text-text-muted text-xs">(optional)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I think you'd be perfect for testing this because..."
              rows={4}
              className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder-text-muted focus:outline-none focus:border-firefly-dim transition-soft resize-y"
              disabled={sending}
            />
            <p className="mt-1 text-xs text-text-muted">
              Add a personal note that will appear in the invite email
            </p>
          </div>

          {/* Result Message */}
          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.type === 'success'
                  ? 'bg-green-900/20 border-green-700/50 text-green-400'
                  : 'bg-red-900/20 border-red-700/50 text-red-400'
              }`}
            >
              {result.message}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Beta Invite'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/grove')}
              className="px-6 py-3 bg-border-subtle hover:bg-text-muted/20 text-text-soft border border-border-subtle rounded-lg font-medium transition-soft"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-bg-elevated rounded-lg border border-border-subtle">
          <h3 className="text-sm font-medium text-text-soft mb-2">What the invitee receives:</h3>
          <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
            <li>Welcome email with subject "You're invited to beta test Firefly Grove 🌟"</li>
            <li>Link to https://fireflygrove.app</li>
            <li>Instructions on what to test</li>
            <li>How to report issues using "🐛 Report an Issue" link</li>
            <li>Beta perks and benefits</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

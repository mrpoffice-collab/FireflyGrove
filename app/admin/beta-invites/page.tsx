'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'

export default function BetaInvitesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setIsAdmin((session.user as any).isAdmin || false)
    }

    // Detect if user is on mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [session])

  const handleSendSMS = () => {
    if (!phone.trim()) {
      setResult({ type: 'error', message: 'Phone number is required for SMS invite' })
      return
    }

    // Create SMS message text
    const inviterName = session?.user?.name || 'A friend'
    const smsText = `${inviterName} invited you to try Firefly Grove - preserve your family memories forever! Join the beta: https://fireflygrove.app${message.trim() ? `\n\n${message.trim()}` : ''}`

    // Use SMS protocol to open messaging app
    const smsLink = `sms:${phone.trim()}${isMobile ? (phone.includes('@') ? '' : '?') : '&'}body=${encodeURIComponent(smsText)}`

    // Open the SMS app with pre-filled message
    window.location.href = smsLink

    setResult({
      type: 'success',
      message: 'SMS app opened with invite message. Send the text to complete the invitation!'
    })
  }

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
      <Header userName={session?.user?.name || ''} isAdmin={isAdmin} />

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-text-soft mb-2">
            Invite Friends to Beta Test Firefly Grove
          </h1>
          <p className="text-text-muted">
            Send invites via email or text message. Perfect for sharing on mobile!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-bg-elevated p-6 rounded-lg border border-border-subtle">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-soft mb-2">
              Email Address <span className="text-text-muted text-xs">(for email invite)</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="beta-tester@example.com"
              className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder:text-placeholder focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft"
              disabled={sending}
            />
            <p className="mt-1 text-xs text-text-muted">
              Leave blank if you only want to send a text message
            </p>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-soft mb-2">
              Phone Number <span className="text-text-muted text-xs">(for text/SMS invite)</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder:text-placeholder focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft"
              disabled={sending}
            />
            <p className="mt-1 text-xs text-text-muted">
              {isMobile ? '📱 Send a text invite from your phone' : 'Enter phone number to create SMS invite link'}
            </p>
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
              className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder:text-placeholder focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft"
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
              className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder:text-placeholder focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft resize-y"
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
                  ? 'bg-green-900/20 border-green-700/50 text-success-text'
                  : 'bg-red-900/20 border-red-700/50 text-error-text'
              }`}
            >
              {result.message}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="space-y-3">
            {/* SMS Button - Show prominently on mobile or if phone is entered */}
            {phone.trim() && (
              <button
                type="button"
                onClick={handleSendSMS}
                disabled={sending}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {isMobile ? 'Send Text Message' : 'Open SMS App'}
              </button>
            )}

            {/* Email Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Email Invite'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/grove')}
                className="px-6 py-3 bg-border-subtle hover:bg-text-muted/20 text-text-soft border border-border-subtle rounded-lg font-medium transition-soft"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-bg-elevated rounded-lg border border-border-subtle">
            <h3 className="text-sm font-medium text-text-soft mb-2">📧 Email Invite includes:</h3>
            <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
              <li>Welcome email with subject "You're invited to beta test Firefly Grove 🌟"</li>
              <li>Link to https://fireflygrove.app</li>
              <li>Instructions on what to test</li>
              <li>How to report issues using "🐛 Report an Issue" link</li>
              <li>Beta perks and benefits</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <h3 className="text-sm font-medium text-blue-300 mb-2">📱 Text Message Invite:</h3>
            <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
              <li>Quick and easy for mobile users</li>
              <li>Opens your phone's messaging app with pre-filled text</li>
              <li>Includes link to https://fireflygrove.app</li>
              <li>Your personal message is included</li>
              <li>Perfect for sharing with family and friends on-the-go</li>
            </ul>
          </div>

          {isMobile && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <h3 className="text-sm font-medium text-green-300 mb-2">💡 Mobile Tip:</h3>
              <p className="text-sm text-text-muted">
                You're on mobile! Simply enter a phone number above and tap "Send Text Message" to instantly invite someone via SMS.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

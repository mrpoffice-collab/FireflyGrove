'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'

export default function TestEmailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Test Email from Firefly Grove')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
  }, [session])

  const handleSendTest = async () => {
    if (!email) {
      setResult({ success: false, message: 'Please enter an email address' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          success: true,
          message: `✓ Email sent successfully to ${email}! Check your inbox.`,
        })
      } else {
        setResult({
          success: false,
          message: `✗ Failed to send: ${data.error || 'Unknown error'}${data.details ? `\n${data.details}` : ''}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: '✗ Failed to send test email. Check console for details.',
      })
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || 'User'} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-text-soft mb-2">
              📧 Email System Test
            </h1>
            <p className="text-text-muted">
              Test Resend email integration for Firefly Grove
            </p>
          </div>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="test@example.com"
                />
                <p className="text-text-muted text-xs mt-1">
                  Email will be sent to this address
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="Test Email from Firefly Grove"
                />
              </div>

              {result && (
                <div
                  className={`p-4 rounded text-sm whitespace-pre-line ${
                    result.success
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {result.message}
                </div>
              )}

              <button
                onClick={handleSendTest}
                disabled={sending || !email}
                className="w-full py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : '📧 Send Test Email'}
              </button>
            </div>
          </div>

          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-400 text-sm font-medium mb-2">
              💡 Setup Instructions
            </div>
            <div className="text-text-muted text-sm space-y-2">
              <p>
                <strong>1. Get Resend API Key:</strong> Sign up at{' '}
                <a
                  href="https://resend.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-firefly-glow hover:underline"
                >
                  resend.com
                </a>
              </p>
              <p>
                <strong>2. Add Environment Variables:</strong>
              </p>
              <code className="block bg-bg-darker p-2 rounded text-xs">
                RESEND_API_KEY=re_xxxxxxxxxxxxx<br />
                RESEND_FROM_EMAIL=noreply@fireflygrove.app
              </code>
              <p>
                <strong>3. Verify Domain:</strong> Add your domain (fireflygrove.app) in Resend dashboard
              </p>
              <p>
                <strong>4. Test:</strong> Click "Send Test Email" button above
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

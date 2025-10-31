'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Header from '@/components/Header'

function ImportsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAdmin, setIsAdmin] = useState(false)
  const [facebookConnected, setFacebookConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      const adminStatus = (session.user as any).isAdmin
      setIsAdmin(adminStatus)
      checkFacebookConnection()
    }
  }, [session])

  useEffect(() => {
    // Check for success/error messages from OAuth callback
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')

    if (connected === 'facebook') {
      setMessage({
        type: 'success',
        text: 'Successfully connected to Facebook! You can now import your photos.',
      })
      setFacebookConnected(true)
    } else if (error) {
      setMessage({
        type: 'error',
        text: `Failed to connect: ${error}`,
      })
    }
  }, [searchParams])

  const checkFacebookConnection = async () => {
    try {
      const res = await fetch('/api/facebook/status')
      if (res.ok) {
        const data = await res.json()
        setFacebookConnected(data.connected)
      }
    } catch (error) {
      console.error('Error checking Facebook connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectFacebook = () => {
    window.location.href = '/api/facebook/connect'
  }

  const handleDisconnectFacebook = async () => {
    if (!confirm('Disconnect from Facebook? You can reconnect anytime.')) {
      return
    }

    try {
      const res = await fetch('/api/facebook/disconnect', { method: 'POST' })
      if (res.ok) {
        setFacebookConnected(false)
        setMessage({
          type: 'success',
          text: 'Disconnected from Facebook',
        })
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to disconnect from Facebook',
      })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header
        userName={session.user?.name || ''}
        isAdmin={isAdmin}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-text-soft mb-2">
              Import <span className="text-firefly-glow">Memories</span>
            </h1>
            <p className="text-text-muted">
              Connect your social media accounts to import photos and memories into Firefly Grove
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-success-text'
                  : 'bg-red-500/10 border-red-500/30 text-error-text'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Facebook Connection */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl">
                    f
                  </div>
                  <div>
                    <h2 className="text-xl text-text-soft font-medium">Facebook</h2>
                    <p className="text-sm text-text-muted">
                      Import your photos, albums, and memories
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-text-muted text-sm mb-4">
                    Import your Facebook photos and memories by uploading your Facebook data export.
                  </p>
                  <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-text-soft mb-2">How to get your Facebook data:</h3>
                    <ol className="text-sm text-text-muted space-y-1 list-decimal list-inside">
                      <li>Go to Facebook Settings → Your Facebook Information</li>
                      <li>Click "Download Your Information"</li>
                      <li>Select format: <span className="text-firefly-glow">JSON</span></li>
                      <li>Select: Photos, Posts, Comments</li>
                      <li>Create file and download</li>
                      <li>Upload the ZIP file here</li>
                    </ol>
                  </div>
                  <button
                    onClick={() => router.push('/import/facebook')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-soft"
                  >
                    Upload Facebook Data →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram (Coming Soon) */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 opacity-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-2xl">
                    📷
                  </div>
                  <div>
                    <h2 className="text-xl text-text-soft font-medium">Instagram</h2>
                    <p className="text-sm text-text-muted">
                      Coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-bg-dark border border-firefly-dim/30 rounded-lg p-6">
            <h3 className="text-lg text-firefly-glow mb-3">🔐 Your Privacy Matters</h3>
            <ul className="space-y-2 text-text-muted text-sm">
              <li className="flex gap-2">
                <span className="text-firefly-glow">✓</span>
                <span>We only READ your photos - we never post without permission</span>
              </li>
              <li className="flex gap-2">
                <span className="text-firefly-glow">✓</span>
                <span>Your data is stored encrypted in Firefly Grove</span>
              </li>
              <li className="flex gap-2">
                <span className="text-firefly-glow">✓</span>
                <span>We never sell your data or show ads</span>
              </li>
              <li className="flex gap-2">
                <span className="text-firefly-glow">✓</span>
                <span>You can disconnect anytime</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ImportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    }>
      <ImportsContent />
    </Suspense>
  )
}

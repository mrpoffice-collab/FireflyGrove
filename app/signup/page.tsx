'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but login failed. Please try logging in.')
        setLoading(false)
      } else {
        router.push('/grove')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-2 text-firefly-glow">
            Firefly Grove
          </h1>
          <p className="text-text-muted text-sm">
            Create your account to preserve your memories
          </p>
        </div>

        {isDemoMode && (
          <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div>
                <div className="text-firefly-glow font-medium mb-1">Beta Testing Mode</div>
                <p className="text-text-muted text-sm">
                  Firefly Grove is currently in private beta. Registration is invite-only at this time.
                  If you're interested in joining, please check back soon or contact us for early access.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm text-text-soft mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
                required
                disabled={loading || isDemoMode}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-text-soft mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
                required
                disabled={loading || isDemoMode}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-text-soft mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
                required
                disabled={loading || isDemoMode}
                minLength={6}
              />
              {!isDemoMode && (
                <p className="text-text-muted text-xs mt-1">
                  At least 6 characters
                </p>
              )}
            </div>

            {error && (
              <div className="text-error-text text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || isDemoMode}
              className="w-full py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              title={isDemoMode ? 'Registration is disabled in beta mode' : ''}
            >
              {loading ? 'Creating Account...' : isDemoMode ? 'Registration Disabled' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle text-center">
            <p className="text-text-muted text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-firefly-dim hover:text-firefly-glow transition-soft"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

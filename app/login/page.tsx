'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/grove')
    }
  }

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: demoEmail,
      password: 'demo123',
      redirect: false,
    })

    if (result?.error) {
      setError('Demo login failed')
      setLoading(false)
    } else {
      router.push('/grove')
    }
  }

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-darker px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-2 text-firefly-glow">
            Firefly Grove
          </h1>
          <p className="text-text-muted text-sm">
            Preserve the memories that glow brightest
          </p>
        </div>

        <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-text-soft mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                required
                disabled={loading}
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
                className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {isDemoMode && (
            <div className="mt-6 pt-6 border-t border-border-subtle">
              <p className="text-text-muted text-xs text-center mb-3">
                Demo Mode - Quick Login
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => handleDemoLogin('alice@demo.local')}
                  disabled={loading}
                  className="w-full py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded text-sm transition-soft disabled:opacity-50"
                >
                  Login as Alice
                </button>
                <button
                  onClick={() => handleDemoLogin('bob@demo.local')}
                  disabled={loading}
                  className="w-full py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded text-sm transition-soft disabled:opacity-50"
                >
                  Login as Bob
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

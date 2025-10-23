'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateMemorialPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true)

  // Trustee (creator) info
  const [trusteeEmail, setTrusteeEmail] = useState('')
  const [trusteePassword, setTrusteePassword] = useState('')
  const [trusteeName, setTrusteeName] = useState('')
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'account' | 'memorial'>('account')

  const handleCheckAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Check if account exists
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trusteeEmail }),
      })

      const data = await res.json()

      if (data.exists) {
        setHasAccount(true)
        setStep('memorial')
      } else {
        setHasAccount(false)
      }
    } catch (err) {
      setError('Failed to check account status')
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      // Create account
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trusteeEmail,
          password: trusteePassword,
          name: trusteeName,
        }),
      })

      if (res.ok) {
        setHasAccount(true)
        setStep('memorial')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create account')
      }
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setCreating(false)
    }
  }

  const handleLoginAndContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      // Login
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trusteeEmail,
          password: trusteePassword,
        }),
      })

      if (res.ok) {
        setStep('memorial')
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Failed to sign in')
    } finally {
      setCreating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      const res = await fetch('/api/legacy-tree/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          birthDate,
          deathDate,
          groveId: null, // null = Open Grove (free public memorial)
          discoveryEnabled,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Redirect to the memorial page with name and dates
        router.push(`/memorial/created?name=${encodeURIComponent(name)}&birthDate=${encodeURIComponent(birthDate)}&deathDate=${encodeURIComponent(deathDate)}`)
      } else {
        setError(data.error || 'Failed to create memorial')
      }
    } catch (err) {
      setError('Failed to create memorial')
    } finally {
      setCreating(false)
    }
  }

  const maxDeathDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-bg-darker">
      {/* Simple Header */}
      <div className="border-b border-border-subtle bg-bg-dark">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-light text-firefly-glow hover:text-firefly-dim transition-soft"
          >
            Firefly Grove
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <div className="text-5xl mb-4">🕯️</div>
            <h1 className="text-4xl font-light text-text-soft mb-2">
              Create a Free Memorial
            </h1>
            <p className="text-text-muted">
              Honor the memory of a loved one with a lasting digital memorial
            </p>
          </div>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
            {step === 'account' && (
              <>
                <h2 className="text-2xl font-light text-text-soft mb-2">
                  {hasAccount === null ? 'Get Started' : hasAccount ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-text-muted mb-6 text-sm">
                  {hasAccount === null
                    ? 'Enter your email to get started'
                    : hasAccount
                    ? 'Sign in to create the memorial'
                    : 'Create a free account to manage this memorial'}
                </p>

                {hasAccount === null ? (
                  <form onSubmit={handleCheckAccount} className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-soft mb-2">
                        Your Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={trusteeEmail}
                        onChange={(e) => setTrusteeEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                        placeholder="your@email.com"
                        required
                      />
                      <p className="text-text-muted text-xs mt-1">
                        You'll be the trustee who can manage and transfer this memorial
                      </p>
                    </div>

                    {error && <div className="text-red-400 text-sm">{error}</div>}

                    <button
                      type="submit"
                      className="w-full py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
                    >
                      Continue
                    </button>
                  </form>
                ) : hasAccount ? (
                  <form onSubmit={handleLoginAndContinue} className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-soft mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={trusteeEmail}
                        disabled
                        className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-soft mb-2">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        value={trusteePassword}
                        onChange={(e) => setTrusteePassword(e.target.value)}
                        className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                        placeholder="Enter your password"
                        required
                        autoFocus
                      />
                    </div>

                    {error && <div className="text-red-400 text-sm">{error}</div>}

                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                    >
                      {creating ? 'Signing in...' : 'Sign In & Continue'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasAccount(null)}
                      className="w-full text-text-muted hover:text-text-soft text-sm transition-soft"
                    >
                      Use a different email
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-soft mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={trusteeEmail}
                        disabled
                        className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-soft mb-2">
                        Your Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={trusteeName}
                        onChange={(e) => setTrusteeName(e.target.value)}
                        className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                        placeholder="Your full name"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-soft mb-2">
                        Create Password <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        value={trusteePassword}
                        onChange={(e) => setTrusteePassword(e.target.value)}
                        className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                        placeholder="Choose a secure password"
                        required
                        minLength={6}
                      />
                    </div>

                    {error && <div className="text-red-400 text-sm">{error}</div>}

                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                    >
                      {creating ? 'Creating account...' : 'Create Free Account'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasAccount(null)}
                      className="w-full text-text-muted hover:text-text-soft text-sm transition-soft"
                    >
                      Use a different email
                    </button>
                  </form>
                )}
              </>
            )}

            {step === 'memorial' && (
              <>
                <h2 className="text-2xl font-light text-text-soft mb-6">
                  Memorial Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-text-soft mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                      placeholder="Full name"
                      required
                      disabled={creating}
                      maxLength={100}
                      autoFocus
                    />
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm text-text-soft mb-2">
                      Birth Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                      required
                      disabled={creating}
                    />
                  </div>

                  {/* Death Date */}
                  <div>
                    <label className="block text-sm text-text-soft mb-2">
                      Date of Passing <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                      max={maxDeathDate}
                      className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                      required
                      disabled={creating}
                    />
                    <p className="text-text-muted text-xs mt-1">
                      Must be in the past
                    </p>
                  </div>

                  {/* Discovery Toggle */}
                  <div className="pt-4 border-t border-border-subtle">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={discoveryEnabled}
                        onChange={(e) => setDiscoveryEnabled(e.target.checked)}
                        className="mt-1"
                        disabled={creating}
                      />
                      <div className="flex-1">
                        <div className="text-text-soft font-medium mb-1">
                          🔍 Allow public discovery
                        </div>
                        <div className="text-text-muted text-sm">
                          Let others find this memorial through search. You can change this later.
                        </div>
                      </div>
                    </label>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-3 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                  >
                    {creating ? 'Creating Memorial...' : 'Create Free Memorial'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-4">
            <div className="text-firefly-glow text-sm font-medium mb-2">
              💡 About Free Memorial Trees
            </div>
            <div className="text-text-muted text-sm space-y-2">
              <p>
                Create a free public memorial with room for up to 100 cherished memories — photos, stories, and voice notes.
              </p>
              <p>
                You'll serve as the trustee for the first 60 days — guiding family and friends to contribute.
              </p>
              <p>
                Transfer ownership to a family member at any time.
              </p>
              <p>
                Adopt this tree into a private grove later for unlimited memories, enhanced privacy, and lasting preservation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

interface InviteData {
  branchTitle: string
  inviterName: string
  email: string
  expired: boolean
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Sign up form state
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    fetchInvite()
  }, [])

  const fetchInvite = async () => {
    try {
      const res = await fetch(`/api/invites/${token}`)
      if (res.ok) {
        const data = await res.json()
        setInvite(data)
      } else {
        setError('Invalid or expired invitation')
      }
    } catch (err) {
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccepting(true)
    setError('')

    try {
      // Create account with invite acceptance
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation')
        setAccepting(false)
        return
      }

      // Auto sign in
      const result = await signIn('credentials', {
        email: invite!.email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but login failed. Please try logging in.')
        setAccepting(false)
      } else {
        // Redirect to the branch
        router.push(`/branch/${data.branchId}`)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-darker">
        <div className="text-text-muted">Loading invitation...</div>
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-darker px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-light text-text-soft mb-4">
            Invalid Invitation
          </h1>
          <p className="text-text-muted mb-6">
            {error || 'This invitation link is invalid or has expired.'}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (invite.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-darker px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-2xl font-light text-text-soft mb-4">
            Invitation Expired
          </h1>
          <p className="text-text-muted mb-6">
            This invitation has expired. Please ask {invite.inviterName} to send a new invitation.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-darker px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-2 text-firefly-glow">
            Firefly Grove
          </h1>
          <p className="text-text-muted text-sm mb-6">
            You've been invited to preserve memories together
          </p>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-6">
            <p className="text-text-soft mb-2">
              <strong>{invite.inviterName}</strong> invited you to collaborate on:
            </p>
            <p className="text-firefly-dim text-lg font-medium">
              "{invite.branchTitle}"
            </p>
          </div>
        </div>

        <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
          <h2 className="text-xl text-text-soft mb-4">Create Your Account</h2>
          <form onSubmit={handleAccept} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-text-soft mb-2">
                Email (from invitation)
              </label>
              <input
                id="email"
                type="email"
                value={invite.email}
                disabled
                className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-muted"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm text-text-soft mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                required
                disabled={accepting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-text-soft mb-2">
                Choose a Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                required
                disabled={accepting}
                minLength={6}
              />
              <p className="text-text-muted text-xs mt-1">
                At least 6 characters
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={accepting}
              className="w-full py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
            >
              {accepting ? 'Creating Account...' : 'Accept Invitation & Create Account'}
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

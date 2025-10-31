'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface TransferDetails {
  id: string
  personName: string
  senderName: string
  groveName: string
  message: string | null
  recipientEmail: string
  expiresAt: string
  status: string
}

export default function AcceptTreeTransferPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [transfer, setTransfer] = useState<TransferDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'grove' | 'single' | 'new-grove' | null>(null)

  useEffect(() => {
    if (token) {
      fetchTransferDetails()
    }
  }, [token])

  const fetchTransferDetails = async () => {
    try {
      const res = await fetch(`/api/tree-transfers/${token}`)
      if (res.ok) {
        const data = await res.json()
        setTransfer(data)
      } else {
        const data = await res.json()
        setError(data.error || 'Transfer not found or expired')
      }
    } catch (err) {
      console.error('Error fetching transfer:', err)
      setError('Failed to load transfer details')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!selectedOption) {
      setError('Please select an option')
      return
    }

    setAccepting(true)
    setError('')

    try {
      const res = await fetch(`/api/tree-transfers/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option: selectedOption,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Redirect based on the option
        if (selectedOption === 'single') {
          // Redirect to subscription page
          router.push(data.checkoutUrl || '/billing')
        } else {
          // Redirect to the grove
          router.push('/grove')
        }
      } else {
        setError(data.error || 'Failed to accept tree transfer')
        setAccepting(false)
      }
    } catch (err) {
      console.error('Error accepting transfer:', err)
      setError('Failed to accept tree transfer')
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="text-text-muted">Loading transfer details...</div>
      </div>
    )
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark p-4">
        <div className="max-w-md w-full bg-bg-dark border border-border-subtle rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-light text-text-soft mb-4">Transfer Not Available</h1>
          <p className="text-text-muted mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  // Check if user needs to log in
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="text-text-muted">Checking authentication...</div>
      </div>
    )
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark p-4">
        <div className="max-w-md w-full bg-bg-dark border border-border-subtle rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🌳</div>
            <h1 className="text-2xl font-light text-text-soft mb-2">Tree Transfer Invitation</h1>
            <p className="text-text-muted">
              <strong>{transfer.senderName}</strong> wants to transfer the tree for{' '}
              <strong>{transfer.personName}</strong> to you.
            </p>
          </div>

          {transfer.message && (
            <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded p-4 mb-6">
              <p className="text-text-soft text-sm italic">"{transfer.message}"</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-text-muted text-sm text-center">
              To accept this tree, you need to sign in or create an account first.
            </p>
            <Link
              href={`/signup?redirect=/accept-tree-transfer/${token}`}
              className="block w-full text-center px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
            >
              Sign Up
            </Link>
            <Link
              href={`/login?redirect=/accept-tree-transfer/${token}`}
              className="block w-full text-center px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-soft border border-border-subtle rounded font-medium transition-soft"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // User is logged in - show acceptance options
  return (
    <div className="min-h-screen bg-bg-dark p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌳</div>
            <h1 className="text-3xl font-light text-text-soft mb-4">Accept Tree Transfer</h1>
            <p className="text-text-muted">
              <strong>{transfer.senderName}</strong> from <em>{transfer.groveName}</em> wants to
              transfer the tree for <strong>{transfer.personName}</strong> to you.
            </p>
          </div>

          {transfer.message && (
            <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded p-4 mb-8">
              <p className="text-text-soft text-sm italic">"{transfer.message}"</p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <p className="text-text-soft font-medium mb-4">How would you like to receive this tree?</p>

            {/* Option 1: Add to Grove */}
            <div
              onClick={() => setSelectedOption('grove')}
              className={`p-4 border rounded-lg cursor-pointer transition-soft ${
                selectedOption === 'grove'
                  ? 'border-firefly-glow bg-firefly-dim/20'
                  : 'border-border-subtle hover:border-firefly-dim/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'grove'
                        ? 'border-firefly-glow bg-firefly-glow'
                        : 'border-border-subtle'
                    }`}
                  >
                    {selectedOption === 'grove' && (
                      <div className="w-2 h-2 rounded-full bg-bg-dark"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-text-soft font-medium mb-1">Add to My Grove</h3>
                  <p className="text-text-muted text-sm">
                    Add this tree to your existing Firefly Grove
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Single Tree Subscription */}
            <div
              onClick={() => setSelectedOption('single')}
              className={`p-4 border rounded-lg cursor-pointer transition-soft ${
                selectedOption === 'single'
                  ? 'border-firefly-glow bg-firefly-dim/20'
                  : 'border-border-subtle hover:border-firefly-dim/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'single'
                        ? 'border-firefly-glow bg-firefly-glow'
                        : 'border-border-subtle'
                    }`}
                  >
                    {selectedOption === 'single' && (
                      <div className="w-2 h-2 rounded-full bg-bg-dark"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-text-soft font-medium mb-1">Subscribe to Single Tree</h3>
                  <p className="text-text-muted text-sm">
                    Just this tree for $4.99/year (perfect if you only need this one tree)
                  </p>
                </div>
              </div>
            </div>

            {/* Option 3: Create New Grove */}
            <div
              onClick={() => setSelectedOption('new-grove')}
              className={`p-4 border rounded-lg cursor-pointer transition-soft ${
                selectedOption === 'new-grove'
                  ? 'border-firefly-glow bg-firefly-dim/20'
                  : 'border-border-subtle hover:border-firefly-dim/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'new-grove'
                        ? 'border-firefly-glow bg-firefly-glow'
                        : 'border-border-subtle'
                    }`}
                  >
                    {selectedOption === 'new-grove' && (
                      <div className="w-2 h-2 rounded-full bg-bg-dark"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-text-soft font-medium mb-1">Create a New Grove</h3>
                  <p className="text-text-muted text-sm">
                    Start a full grove with space for 10 trees (includes this tree)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-4 mb-6">
              <p className="text-error-text text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              disabled={accepting}
              className="flex-1 px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-muted border border-border-subtle rounded font-medium transition-soft disabled:bg-gray-800 disabled:text-gray-600"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting || !selectedOption}
              className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {accepting ? 'Accepting...' : 'Accept Tree'}
            </button>
          </div>

          <p className="text-text-muted text-xs text-center mt-6">
            This invitation expires on {new Date(transfer.expiresAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

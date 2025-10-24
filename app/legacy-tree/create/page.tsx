'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

export default function CreateLegacyTreePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [placeInOpenGrove, setPlaceInOpenGrove] = useState(true)
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

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
          groveId: placeInOpenGrove ? null : undefined, // null = Open Grove, undefined = user's grove
          discoveryEnabled,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Legacy tree created for ${name}`)
        router.push('/grove')
      } else {
        setError(data.error || 'Failed to create legacy tree')
      }
    } catch (err) {
      setError('Failed to create legacy tree')
    } finally {
      setCreating(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const maxDeathDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Grove
          </button>

          <div className="mb-8 text-center">
            <div className="text-5xl mb-4">🕯️</div>
            <h1 className="text-4xl font-light text-text-soft mb-2">
              Create a Legacy Tree
            </h1>
            <p className="text-text-muted">
              Honor the memory of a loved one with a lasting memorial
            </p>
          </div>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
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

              {/* Where to Plant */}
              <div className="pt-4 border-t border-border-subtle">
                <label className="block text-sm text-text-soft mb-3">
                  Where should this tree live?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 bg-bg-darker border border-border-subtle rounded cursor-pointer hover:border-firefly-dim/50 transition-soft">
                    <input
                      type="radio"
                      checked={placeInOpenGrove}
                      onChange={() => setPlaceInOpenGrove(true)}
                      className="mt-1"
                      disabled={creating}
                    />
                    <div className="flex-1">
                      <div className="text-text-soft font-medium mb-1">
                        🌍 Open Grove (Public Memorial)
                      </div>
                      <div className="text-text-muted text-sm">
                        Free public memorial space. Anyone can view and contribute memories (with approval). Limited to 100 memories.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-bg-darker border border-border-subtle rounded cursor-pointer hover:border-firefly-dim/50 transition-soft">
                    <input
                      type="radio"
                      checked={!placeInOpenGrove}
                      onChange={() => setPlaceInOpenGrove(false)}
                      className="mt-1"
                      disabled={creating}
                    />
                    <div className="flex-1">
                      <div className="text-text-soft font-medium mb-1">
                        🏡 Your Private Grove
                      </div>
                      <div className="text-text-muted text-sm">
                        Private memorial in your grove. Uses one of your tree slots. Unlimited memories and full privacy controls.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Discovery Toggle (only for Open Grove) */}
              {placeInOpenGrove && (
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
              )}

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
              >
                {creating ? 'Creating Legacy Tree...' : 'Create Legacy Tree'}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-4">
            <div className="text-firefly-glow text-sm font-medium mb-2">
              💡 About Legacy Trees
            </div>
            <div className="text-text-muted text-sm space-y-2">
              <p>
                • You'll be the <strong>trustee</strong> for 60 days to set up and invite family
              </p>
              <p>
                • You can transfer ownership to a family member anytime
              </p>
              <p>
                • Open Grove trees have a 100 memory limit (you'll see a prompt at 50)
              </p>
              <p>
                • You can adopt this tree into a private grove later for unlimited memories
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

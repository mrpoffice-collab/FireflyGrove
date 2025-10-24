'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

interface PersonSearchResult {
  id: string
  name: string
  type: 'registered_user' | 'person'
  email?: string
  hasPersonEntity?: boolean
  personId?: string
  isLegacy?: boolean
  hasUserAccount?: boolean
  userId?: string
  groveCount?: number
  owner?: { id: string; name: string }
  birthDate?: string | null
  deathDate?: string | null
}

export default function NewBranchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const treeId = params.treeId as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Person discovery states
  const [searchResults, setSearchResults] = useState<{ registeredUsers: PersonSearchResult[]; persons: PersonSearchResult[] } | null>(null)
  const [searching, setSearching] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<PersonSearchResult | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Debounced search for existing persons
  useEffect(() => {
    if (title.trim().length < 2 || selectedPerson) {
      setSearchResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const response = await fetch(`/api/persons/search?name=${encodeURIComponent(title.trim())}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data)
        }
      } catch (error) {
        console.error('Error searching persons:', error)
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [title, selectedPerson])

  const handleSelectPerson = (person: PersonSearchResult) => {
    setSelectedPerson(person)
    setSearchResults(null)
  }

  const handleClearSelection = () => {
    setSelectedPerson(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Branch title is required')
      return
    }

    if (submitting) return
    setSubmitting(true)
    setError('')

    try {
      // Determine personId if a person is selected
      const personId = selectedPerson?.type === 'registered_user'
        ? selectedPerson.personId
        : selectedPerson?.id

      // Step 1: Create the branch
      const branchRes = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treeId,
          title: title.trim(),
          description: description.trim() || null,
        }),
      })

      const branchData = await branchRes.json()

      if (!branchRes.ok) {
        setError(branchData.error || 'Failed to create branch')
        return
      }

      const branchId = branchData.branch.id

      // Step 2: If personId exists, send connection request
      if (personId) {
        const connectionRes = await fetch('/api/branch-connections/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branchId,
            personId,
            message: description.trim() || undefined,
          }),
        })

        const connectionData = await connectionRes.json()

        if (connectionRes.ok) {
          if (connectionData.autoAccepted) {
            // Branch was auto-linked to person
            router.push(`/branch/${branchId}?message=auto_linked`)
          } else {
            // Connection request sent
            router.push(`/branch/${branchId}?message=connection_request_sent`)
          }
        } else {
          // Connection request failed, but branch was created
          router.push(`/branch/${branchId}?error=connection_failed`)
        }
      } else {
        // No person selected, just go to the branch
        router.push(`/branch/${branchId}`)
      }
    } catch (error) {
      console.error('Failed to create branch:', error)
      setError('Failed to create branch')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push(`/tree/${treeId}`)}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Tree
          </button>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
            <h1 className="text-3xl font-light text-text-soft mb-2">
              Create New Branch
            </h1>
            <p className="text-text-muted mb-8">
              Branches represent individual people or relationships in your family tree. Create a branch for yourself, a family member, or a loved one.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Branch Title <span className="text-firefly-dim">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="e.g., Mom, Grandpa Joe, My Journey"
                  autoFocus
                  maxLength={100}
                />
                <p className="text-text-muted text-xs mt-1">
                  This could be a person's name, nickname, or a relationship label
                </p>

                {/* Selected Person Badge */}
                {selectedPerson && (
                  <div className="mt-3 p-3 bg-firefly-dim/10 border border-firefly-dim/30 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-firefly-glow">🔗</span>
                      <div>
                        <p className="text-sm text-text-soft font-medium">
                          Connecting to: {selectedPerson.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {selectedPerson.type === 'registered_user'
                            ? `Registered user${selectedPerson.hasPersonEntity ? ' (has person entity)' : ''}`
                            : selectedPerson.isLegacy
                            ? 'Legacy memorial'
                            : 'Person entity'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-text-muted hover:text-text-soft text-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Search Results */}
                {!selectedPerson && searchResults && (searchResults.registeredUsers.length > 0 || searchResults.persons.length > 0) && (
                  <div className="mt-3 p-4 bg-bg-darker border border-border-subtle rounded space-y-3">
                    <p className="text-xs text-firefly-glow font-medium">
                      Found existing people with this name:
                    </p>

                    {searchResults.registeredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectPerson(user)}
                        className="w-full text-left p-3 bg-bg-dark hover:bg-border-subtle border border-border-subtle rounded transition-soft"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-text-soft font-medium">{user.name}</p>
                            <p className="text-xs text-text-muted">{user.email}</p>
                            {user.hasPersonEntity && (
                              <p className="text-xs text-firefly-dim mt-1">Has person entity</p>
                            )}
                          </div>
                          <span className="text-xs bg-firefly-dim/20 text-firefly-glow px-2 py-1 rounded">
                            User
                          </span>
                        </div>
                      </button>
                    ))}

                    {searchResults.persons.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => handleSelectPerson(person)}
                        className="w-full text-left p-3 bg-bg-dark hover:bg-border-subtle border border-border-subtle rounded transition-soft"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-text-soft font-medium">{person.name}</p>
                            {person.birthDate && person.deathDate && (
                              <p className="text-xs text-text-muted">
                                {new Date(person.birthDate).getFullYear()} — {new Date(person.deathDate).getFullYear()}
                              </p>
                            )}
                            {person.owner && (
                              <p className="text-xs text-text-muted mt-1">Owned by {person.owner.name}</p>
                            )}
                            {person.groveCount !== undefined && person.groveCount > 0 && (
                              <p className="text-xs text-firefly-dim mt-1">
                                In {person.groveCount} {person.groveCount === 1 ? 'grove' : 'groves'}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            person.isLegacy
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-firefly-dim/20 text-firefly-glow'
                          }`}>
                            {person.isLegacy ? 'Legacy' : 'Person'}
                          </span>
                        </div>
                      </button>
                    ))}

                    <p className="text-xs text-text-muted italic pt-2 border-t border-border-subtle">
                      Or continue to create a new separate branch
                    </p>
                  </div>
                )}

                {/* Searching Indicator */}
                {searching && !selectedPerson && (
                  <div className="mt-3 p-2 bg-bg-darker border border-border-subtle rounded">
                    <p className="text-xs text-text-muted">Searching...</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
                  placeholder="Add details about this person or branch"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-text-muted text-xs mt-1">
                  {description.length} / 500
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="text-red-400 text-sm">{error}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push(`/tree/${treeId}`)}
                  className="flex-1 py-3 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

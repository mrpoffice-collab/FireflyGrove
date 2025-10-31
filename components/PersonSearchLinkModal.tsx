'use client'

import { useState, useEffect } from 'react'

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

interface PersonSearchLinkModalProps {
  groveId: string
  onClose: () => void
  onSuccess: () => void
}

export default function PersonSearchLinkModal({
  groveId,
  onClose,
  onSuccess,
}: PersonSearchLinkModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    registeredUsers: PersonSearchResult[]
    persons: PersonSearchResult[]
  } | null>(null)
  const [searching, setSearching] = useState(false)
  const [linking, setLinking] = useState(false)
  const [adoptionType, setAdoptionType] = useState<'rooted' | 'adopted'>('rooted')
  const [error, setError] = useState<string | null>(null)

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/persons/search?name=${encodeURIComponent(searchQuery.trim())}&limit=10`
        )
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to search')
        }
      } catch (err) {
        console.error('Error searching persons:', err)
        setError('Failed to search. Please try again.')
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleLinkPerson = async (person: PersonSearchResult) => {
    setLinking(true)
    setError(null)

    try {
      // Get the actual personId
      const personId =
        person.type === 'registered_user' && person.personId
          ? person.personId
          : person.id

      const response = await fetch('/api/grove/person/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groveId,
          personId,
          adoptionType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsUpgrade) {
          setError(
            `${data.error}. Please upgrade your plan to add more trees.`
          )
        } else {
          setError(data.error || 'Failed to link person')
        }
        return
      }

      // Success
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error linking person:', err)
      setError('Failed to link person. Please try again.')
    } finally {
      setLinking(false)
    }
  }

  const hasResults =
    searchResults &&
    (searchResults.registeredUsers.length > 0 ||
      searchResults.persons.length > 0)

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl text-text-soft mb-2">
              Link Existing Person
            </h2>
            <p className="text-sm text-text-muted">
              Search for and connect an existing person to your Grove
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft transition-soft"
            disabled={linking}
          >
            ✕
          </button>
        </div>

        {/* Adoption Type Selection */}
        <div className="mb-6 p-4 bg-bg-darker border border-border-subtle rounded">
          <p className="text-sm text-text-soft mb-3 font-medium">
            Link Type:
          </p>
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="adoptionType"
                value="rooted"
                checked={adoptionType === 'rooted'}
                onChange={(e) =>
                  setAdoptionType(e.target.value as 'rooted' | 'adopted')
                }
                className="mt-1"
              />
              <div>
                <p className="text-sm text-text-soft font-medium">
                  Rooted (Recommended)
                </p>
                <p className="text-xs text-text-muted">
                  Link this person to your Grove without using a tree slot.
                  Their memories will appear but won't count toward your limit.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="adoptionType"
                value="adopted"
                checked={adoptionType === 'adopted'}
                onChange={(e) =>
                  setAdoptionType(e.target.value as 'rooted' | 'adopted')
                }
                className="mt-1"
              />
              <div>
                <p className="text-sm text-text-soft font-medium">
                  Adopted (Uses Tree Slot)
                </p>
                <p className="text-xs text-text-muted">
                  Move this person into your Grove as an original tree. Uses
                  one of your tree slots.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm text-text-soft mb-2">
            Search by name
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter a person's name..."
            className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft"
            autoFocus
            disabled={linking}
          />
          {searching && (
            <p className="text-xs text-text-muted mt-2">Searching...</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {hasResults && (
          <div className="space-y-4">
            {/* Registered Users */}
            {searchResults.registeredUsers.length > 0 && (
              <div>
                <h3 className="text-sm text-firefly-glow font-medium mb-3">
                  Registered Users ({searchResults.registeredUsers.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.registeredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 bg-bg-darker border border-border-subtle rounded hover:border-firefly-dim/30 transition-soft"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-text-soft font-medium">
                            {user.name}
                          </p>
                          <p className="text-sm text-text-muted">{user.email}</p>
                          {user.hasPersonEntity && (
                            <p className="text-xs text-firefly-dim mt-1">
                              Has person entity
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleLinkPerson(user)}
                          disabled={linking || !user.hasPersonEntity}
                          className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {linking ? 'Linking...' : 'Link'}
                        </button>
                      </div>
                      {!user.hasPersonEntity && (
                        <p className="text-xs text-text-muted mt-2">
                          This user doesn't have a person entity yet. They need
                          to create their first tree.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Person Entities */}
            {searchResults.persons.length > 0 && (
              <div>
                <h3 className="text-sm text-firefly-glow font-medium mb-3">
                  Person Entities ({searchResults.persons.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.persons.map((person) => (
                    <div
                      key={person.id}
                      className="p-4 bg-bg-darker border border-border-subtle rounded hover:border-firefly-dim/30 transition-soft"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-text-soft font-medium">
                              {person.name}
                            </p>
                            {person.isLegacy && (
                              <span className="text-xs bg-text-muted/20 text-text-muted px-2 py-0.5 rounded">
                                Legacy
                              </span>
                            )}
                          </div>
                          {person.owner && (
                            <p className="text-sm text-text-muted mt-1">
                              Owned by: {person.owner.name}
                            </p>
                          )}
                          {person.groveCount !== undefined && (
                            <p className="text-xs text-text-muted mt-1">
                              In {person.groveCount} grove
                              {person.groveCount !== 1 ? 's' : ''}
                            </p>
                          )}
                          {(person.birthDate || person.deathDate) && (
                            <p className="text-xs text-text-muted mt-1">
                              {person.birthDate &&
                                new Date(person.birthDate).getFullYear()}
                              {person.birthDate && person.deathDate && ' - '}
                              {person.deathDate &&
                                new Date(person.deathDate).getFullYear()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleLinkPerson(person)}
                          disabled={linking}
                          className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {linking ? 'Linking...' : 'Link'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searchQuery.trim().length >= 2 &&
          !searching &&
          searchResults &&
          !hasResults && (
            <div className="p-8 text-center">
              <p className="text-text-muted mb-2">No results found</p>
              <p className="text-sm text-text-muted">
                Try a different name or create a new person
              </p>
            </div>
          )}

        {/* Empty State */}
        {!searchQuery.trim() && (
          <div className="p-8 text-center">
            <p className="text-text-muted mb-2">Start typing to search</p>
            <p className="text-sm text-text-muted">
              Search for existing people by name
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg-darker border border-border-subtle text-text-soft rounded hover:bg-border-subtle transition-soft"
            disabled={linking}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

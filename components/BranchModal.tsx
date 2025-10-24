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

interface BranchModalProps {
  onClose: () => void
  onSave: (title: string, description: string, personId?: string) => void
}

export default function BranchModal({ onClose, onSave }: BranchModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [searchResults, setSearchResults] = useState<{ registeredUsers: PersonSearchResult[]; persons: PersonSearchResult[] } | null>(null)
  const [searching, setSearching] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<PersonSearchResult | null>(null)

  // Debounced search for existing persons
  useEffect(() => {
    if (title.trim().length < 2) {
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
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      // If a person is selected, pass their personId
      const personId = selectedPerson?.type === 'registered_user'
        ? selectedPerson.personId
        : selectedPerson?.id

      onSave(title.trim(), description.trim(), personId)
    }
  }

  const handleSelectPerson = (person: PersonSearchResult) => {
    setSelectedPerson(person)
    setSearchResults(null) // Hide results after selection
  }

  const handleClearSelection = () => {
    setSelectedPerson(null)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl text-text-soft mb-6">Create New Branch</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="title" className="block text-sm text-text-soft mb-2">
              Who or what is this branch for?
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grandma Rose, College Days, Mom"
              className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
              autoFocus
              required
            />

            {/* Selected Person Badge */}
            {selectedPerson && (
              <div className="mt-2 p-3 bg-firefly-dim/10 border border-firefly-dim/30 rounded flex items-center justify-between">
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
              <div className="mt-2 p-3 bg-bg-darker border border-border-subtle rounded space-y-3">
                <p className="text-xs text-firefly-glow font-medium">
                  Found existing people with this name:
                </p>

                {searchResults.registeredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectPerson(user)}
                    className="w-full text-left p-2 bg-bg-dark hover:bg-border-subtle border border-border-subtle rounded transition-soft"
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
                    className="w-full text-left p-2 bg-bg-dark hover:bg-border-subtle border border-border-subtle rounded transition-soft"
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
              <div className="mt-2 p-2 bg-bg-darker border border-border-subtle rounded">
                <p className="text-xs text-text-muted">Searching...</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-text-soft mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A few words about this person or time..."
              className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
            >
              Create Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

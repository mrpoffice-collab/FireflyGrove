'use client'

import { useState } from 'react'

interface SearchResult {
  personId: string
  name: string
  groveName: string
  caretakerName: string
  birthDate: string | null
  deathDate: string | null
  isLegacy: boolean
}

interface RootTreeModalProps {
  personId: string
  treeName: string
  onClose: () => void
  onSuccess: () => void
}

export default function RootTreeModal({
  personId,
  treeName,
  onClose,
  onSuccess,
}: RootTreeModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term')
      return
    }

    setSearching(true)
    setError('')

    try {
      const res = await fetch(`/api/trees/search?q=${encodeURIComponent(searchQuery)}&excludePersonId=${personId}`)

      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.results)
        if (data.results.length === 0) {
          setError('No matching trees found')
        }
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to search for trees')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search for trees')
    } finally {
      setSearching(false)
    }
  }

  const handleCreateRoot = async () => {
    if (!selectedPersonId) {
      setError('Please select a tree to root with')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/trees/${personId}/root`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPersonId: selectedPersonId,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to create root connection')
      }
    } catch (err) {
      console.error('Root creation error:', err)
      setError('Failed to create root connection')
    } finally {
      setLoading(false)
    }
  }

  const selectedTree = searchResults.find(r => r.personId === selectedPersonId)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-2xl font-light text-text-soft">Root with Another Tree 🌱</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft transition-soft"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Explanation */}
          <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded p-4">
            <p className="text-text-soft text-sm">
              Rooting connects two trees representing the same person across different groves.
              Memories added to either tree will appear in both.
            </p>
          </div>

          {/* Current Tree */}
          <div className="bg-bg-dark border border-border-subtle rounded p-4">
            <p className="text-sm text-text-muted mb-1">Current Tree</p>
            <p className="text-text-soft font-medium">{treeName}</p>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm text-text-muted mb-2">
              Search for a matching tree
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter person's name..."
                className="flex-1 bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-soft focus:outline-none focus:border-firefly-dim/50 transition-soft"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <p className="text-sm text-text-muted mb-3">
                Found {searchResults.length} matching {searchResults.length === 1 ? 'tree' : 'trees'}
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.personId}
                    onClick={() => setSelectedPersonId(result.personId)}
                    className={`p-4 rounded border cursor-pointer transition-soft ${
                      selectedPersonId === result.personId
                        ? 'bg-firefly-dim/20 border-firefly-dim'
                        : 'bg-bg-dark border-border-subtle hover:border-firefly-dim/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-text-soft font-medium">{result.name}</p>
                          {result.isLegacy && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--legacy-amber)]/20 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/30">
                              Legacy
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-text-muted space-y-1">
                          <p>Grove: {result.groveName}</p>
                          <p>Caretaker: {result.caretakerName}</p>
                          {(result.birthDate || result.deathDate) && (
                            <p>
                              {result.birthDate ? new Date(result.birthDate).getFullYear() : '?'} -
                              {result.deathDate ? new Date(result.deathDate).getFullYear() : 'Present'}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedPersonId === result.personId && (
                        <svg className="w-6 h-6 text-firefly-glow flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation */}
          {selectedTree && (
            <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded p-4">
              <p className="text-text-soft text-sm">
                Root <strong>{treeName}</strong> with <strong>{selectedTree.name}</strong> in{' '}
                <strong>{selectedTree.groveName}</strong>. Memories will be shared between both trees.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-border-subtle">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-muted rounded font-medium transition-soft disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRoot}
            disabled={loading || !selectedPersonId}
            className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Root...' : 'Root Trees'}
          </button>
        </div>
      </div>
    </div>
  )
}

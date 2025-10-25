'use client'

import { useState, useEffect } from 'react'

interface Grove {
  id: string
  name: string
  treeCount: number
  treeLimit: number
}

interface TransplantTreeModalProps {
  treeId: string
  treeName: string
  currentGroveId: string
  currentGroveName: string
  isLegacyTree: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TransplantTreeModal({
  treeId,
  treeName,
  currentGroveId,
  currentGroveName,
  isLegacyTree,
  onClose,
  onSuccess,
}: TransplantTreeModalProps) {
  const [availableGroves, setAvailableGroves] = useState<Grove[]>([])
  const [selectedGroveId, setSelectedGroveId] = useState('')
  const [keepContributors, setKeepContributors] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchingGroves, setFetchingGroves] = useState(true)

  useEffect(() => {
    fetchAvailableGroves()
  }, [])

  const fetchAvailableGroves = async () => {
    try {
      const res = await fetch('/api/groves/available-for-transplant')
      if (res.ok) {
        const data = await res.json()
        // Filter out the current grove
        const filtered = data.groves.filter((g: Grove) => g.id !== currentGroveId)
        setAvailableGroves(filtered)
        if (filtered.length > 0) {
          setSelectedGroveId(filtered[0].id)
        }
      } else {
        setError('Failed to load available groves')
      }
    } catch (err) {
      console.error('Error fetching groves:', err)
      setError('Failed to load available groves')
    } finally {
      setFetchingGroves(false)
    }
  }

  const handleTransplant = async () => {
    if (!selectedGroveId) {
      setError('Please select a destination grove')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/trees/${treeId}/transplant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationGroveId: selectedGroveId,
          keepContributors,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to transplant tree')
      }
    } catch (err) {
      console.error('Error transplanting tree:', err)
      setError('Failed to transplant tree')
    } finally {
      setLoading(false)
    }
  }

  const selectedGrove = availableGroves.find(g => g.id === selectedGroveId)
  const willExceedLimit = selectedGrove && !isLegacyTree && selectedGrove.treeCount >= selectedGrove.treeLimit

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-text-soft">Transplant Tree 🌿</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft transition-soft"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {fetchingGroves ? (
          <div className="text-center py-8 text-text-muted">
            Loading available groves...
          </div>
        ) : availableGroves.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted mb-4">
              You don't have any other groves where you can transplant this tree.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-border-subtle hover:bg-border-subtle/80 text-text-soft rounded transition-soft"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Location */}
            <div className="bg-bg-dark border border-border-subtle rounded p-4">
              <p className="text-sm text-text-muted mb-1">Current Location</p>
              <p className="text-text-soft font-medium">{currentGroveName}</p>
            </div>

            {/* Destination Grove Dropdown */}
            <div>
              <label className="block text-sm text-text-muted mb-2">
                Choose destination Grove
              </label>
              <select
                value={selectedGroveId}
                onChange={(e) => setSelectedGroveId(e.target.value)}
                className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-soft focus:outline-none focus:border-firefly-dim/50 transition-soft"
              >
                {availableGroves.map((grove) => (
                  <option key={grove.id} value={grove.id}>
                    {grove.name} ({grove.treeCount}/{grove.treeLimit} trees)
                  </option>
                ))}
              </select>
            </div>

            {/* Slot Warning for Living Trees */}
            {!isLegacyTree && willExceedLimit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
                <p className="text-red-400 text-sm">
                  ⚠️ The selected grove has reached its tree limit. Please select a different grove or upgrade the destination grove's plan.
                </p>
              </div>
            )}

            {/* Keep Contributors Checkbox */}
            <div className="bg-bg-dark border border-border-subtle rounded p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepContributors}
                  onChange={(e) => setKeepContributors(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border-subtle bg-bg-dark text-firefly-glow focus:ring-firefly-dim/50 focus:ring-offset-0"
                />
                <div>
                  <p className="text-text-soft text-sm font-medium mb-1">
                    Keep contributors and memories attached
                  </p>
                  <p className="text-text-muted text-xs">
                    All existing contributors will maintain access to this tree in its new location
                  </p>
                </div>
              </label>
            </div>

            {/* Confirmation Text */}
            <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded p-4">
              <p className="text-text-soft text-sm">
                This will move <strong>{treeName}</strong> to{' '}
                <strong>{selectedGrove?.name}</strong>. All memories and Fireflies will travel with it.
                {!isLegacyTree && (
                  <>
                    {' '}This will free a tree slot in <strong>{currentGroveName}</strong> and use a slot in{' '}
                    <strong>{selectedGrove?.name}</strong>.
                  </>
                )}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-muted rounded font-medium transition-soft disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransplant}
                disabled={loading || willExceedLimit}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Transplanting...' : 'Transplant Tree'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

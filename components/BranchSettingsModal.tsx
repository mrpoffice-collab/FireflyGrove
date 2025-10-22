'use client'

import { useState, useEffect } from 'react'

interface Heir {
  id: string
  heirEmail: string
  releaseCondition: string
  releaseDate: string | null
  notified: boolean
}

interface BranchSettingsModalProps {
  branchId: string
  onClose: () => void
}

export default function BranchSettingsModal({
  branchId,
  onClose,
}: BranchSettingsModalProps) {
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [loading, setLoading] = useState(true)
  const [addingHeir, setAddingHeir] = useState(false)
  const [newHeirEmail, setNewHeirEmail] = useState('')
  const [releaseCondition, setReleaseCondition] = useState('AFTER_DEATH')
  const [releaseDate, setReleaseDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHeirs()
  }, [])

  const fetchHeirs = async () => {
    try {
      const res = await fetch(`/api/branches/${branchId}/heirs`)
      if (res.ok) {
        const data = await res.json()
        setHeirs(data)
      }
    } catch (error) {
      console.error('Failed to fetch heirs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHeir = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAddingHeir(true)

    try {
      const body: any = {
        heirEmail: newHeirEmail,
        releaseCondition,
      }

      if (releaseCondition === 'AFTER_DATE' && releaseDate) {
        body.releaseDate = releaseDate
      }

      const res = await fetch(`/api/branches/${branchId}/heirs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const newHeir = await res.json()
        setHeirs([...heirs, newHeir])
        setNewHeirEmail('')
        setReleaseDate('')
        setReleaseCondition('AFTER_DEATH')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add heir')
      }
    } catch (error) {
      setError('Failed to add heir')
    } finally {
      setAddingHeir(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-2xl font-light text-text-soft">
            Branch Settings & Heirs
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Heirs Section */}
          <div className="mb-8">
            <h3 className="text-lg text-text-soft mb-4">Legacy Heirs</h3>
            <p className="text-text-muted text-sm mb-4">
              Heirs will receive access to legacy memories when release conditions are met.
            </p>

            {loading ? (
              <div className="text-text-muted text-sm">Loading...</div>
            ) : heirs.length > 0 ? (
              <div className="space-y-3 mb-6">
                {heirs.map((heir) => (
                  <div
                    key={heir.id}
                    className="bg-bg-darker border border-border-subtle rounded p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-text-soft font-medium">
                          {heir.heirEmail}
                        </div>
                        <div className="text-text-muted text-sm mt-1">
                          Release: {heir.releaseCondition.replace('_', ' ').toLowerCase()}
                          {heir.releaseDate && ` on ${new Date(heir.releaseDate).toLocaleDateString()}`}
                        </div>
                        {heir.notified && (
                          <div className="text-firefly-dim text-xs mt-1">
                            ✓ Notified
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-muted text-sm mb-6">
                No heirs added yet.
              </div>
            )}

            {/* Add Heir Form */}
            <form onSubmit={handleAddHeir} className="space-y-4">
              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Heir Email
                </label>
                <input
                  type="email"
                  value={newHeirEmail}
                  onChange={(e) => setNewHeirEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  placeholder="heir@example.com"
                  required
                  disabled={addingHeir}
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Release Condition
                </label>
                <select
                  value={releaseCondition}
                  onChange={(e) => setReleaseCondition(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                  disabled={addingHeir}
                >
                  <option value="AFTER_DEATH">After Death (requires verification)</option>
                  <option value="AFTER_DATE">After Specific Date</option>
                  <option value="MANUAL">Manual Release</option>
                </select>
              </div>

              {releaseCondition === 'AFTER_DATE' && (
                <div>
                  <label className="block text-sm text-text-soft mb-2">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
                    required
                    disabled={addingHeir}
                  />
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={addingHeir}
                className="w-full py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
              >
                {addingHeir ? 'Adding...' : 'Add Heir'}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-border-subtle">
            <button
              onClick={onClose}
              className="w-full py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

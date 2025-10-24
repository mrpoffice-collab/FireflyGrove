'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface PendingMemory {
  id: string
  memoryId: string
  memory: {
    id: string
    text: string
    mediaUrl: string | null
    audioUrl: string | null
    createdAt: string
    author: {
      name: string
    }
    branch: {
      title: string
    }
  }
}

interface PendingApprovalsModalProps {
  branchId: string
  onClose: () => void
  onApprovalChange?: () => void
}

export default function PendingApprovalsModal({
  branchId,
  onClose,
  onApprovalChange,
}: PendingApprovalsModalProps) {
  const [pendingMemories, setPendingMemories] = useState<PendingMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetchPendingMemories()
  }, [branchId])

  const fetchPendingMemories = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/branches/${branchId}/pending-approvals`)
      if (res.ok) {
        const data = await res.json()
        setPendingMemories(data)
      }
    } catch (error) {
      console.error('Failed to fetch pending memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (linkId: string) => {
    setProcessing(linkId)
    try {
      const res = await fetch(`/api/memories/${linkId}/approve`, {
        method: 'POST',
      })

      if (res.ok) {
        setPendingMemories((prev) => prev.filter((m) => m.id !== linkId))
        onApprovalChange?.()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to approve memory')
      }
    } catch (error) {
      alert('Failed to approve memory')
    } finally {
      setProcessing(null)
    }
  }

  const handleDecline = async (linkId: string) => {
    setProcessing(linkId)
    try {
      const res = await fetch(`/api/memories/${linkId}/approve`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setPendingMemories((prev) => prev.filter((m) => m.id !== linkId))
        onApprovalChange?.()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to decline memory')
      }
    } catch (error) {
      alert('Failed to decline memory')
    } finally {
      setProcessing(null)
    }
  }

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return

    try {
      const promises = selectedIds.map((id) =>
        fetch(`/api/memories/${id}/approve`, { method: 'POST' })
      )
      await Promise.all(promises)

      setPendingMemories((prev) => prev.filter((m) => !selectedIds.includes(m.id)))
      setSelectedIds([])
      onApprovalChange?.()
    } catch (error) {
      alert('Failed to approve memories')
    }
  }

  const handleBatchDecline = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Decline ${selectedIds.length} pending memories?`)) return

    try {
      const promises = selectedIds.map((id) =>
        fetch(`/api/memories/${id}/approve`, { method: 'DELETE' })
      )
      await Promise.all(promises)

      setPendingMemories((prev) => prev.filter((m) => !selectedIds.includes(m.id)))
      setSelectedIds([])
      onApprovalChange?.()
    } catch (error) {
      alert('Failed to decline memories')
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center sticky top-0 bg-bg-dark z-10">
          <div>
            <h2 className="text-2xl font-light text-text-soft">
              Pending Approvals
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Review shared memories waiting for your approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-text-muted text-center py-8">Loading...</div>
          ) : pendingMemories.length === 0 ? (
            <div className="text-text-muted text-center py-8">
              No pending approvals
            </div>
          ) : (
            <>
              {/* Batch Actions */}
              {selectedIds.length > 0 && (
                <div className="mb-4 p-4 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg flex items-center justify-between">
                  <span className="text-text-soft">
                    {selectedIds.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBatchApprove}
                      className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
                    >
                      Approve All
                    </button>
                    <button
                      onClick={handleBatchDecline}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-soft"
                    >
                      Decline All
                    </button>
                  </div>
                </div>
              )}

              {/* Pending Memories List */}
              <div className="space-y-4">
                {pendingMemories.map((item) => (
                  <div
                    key={item.id}
                    className="bg-bg-darker border border-border-subtle rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="mt-1"
                      />

                      {/* Memory Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="chip-pending">Pending</span>
                          <span className="text-text-muted text-xs">
                            From: {item.memory.branch.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-firefly-glow">✦</span>
                          <span className="text-text-soft text-sm">
                            {item.memory.author.name}
                          </span>
                          <span className="text-text-muted text-xs">
                            {formatDistanceToNow(new Date(item.memory.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        <p className="text-text-soft leading-relaxed whitespace-pre-wrap mb-3">
                          {item.memory.text}
                        </p>

                        {item.memory.mediaUrl && (
                          <div className="mb-3">
                            <img
                              src={item.memory.mediaUrl}
                              alt="Memory"
                              className="rounded-lg max-w-full h-auto max-h-48 object-cover"
                            />
                          </div>
                        )}

                        {item.memory.audioUrl && (
                          <div className="mb-3">
                            <audio controls className="w-full">
                              <source src={item.memory.audioUrl} type="audio/webm" />
                            </audio>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={processing === item.id}
                            className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
                          >
                            {processing === item.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleDecline(item.id)}
                            disabled={processing === item.id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-soft disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-border-subtle sticky bottom-0 bg-bg-dark">
          <button
            onClick={onClose}
            className="w-full py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Tooltip from './Tooltip'

interface MemoryCardProps {
  entry: {
    id: string
    text: string
    visibility: string
    mediaUrl: string | null
    audioUrl: string | null
    createdAt: string
    author: {
      name: string
      id?: string
    }
  }
  branchOwnerId?: string
  branchId?: string
  onWithdraw?: (entryId: string) => void
  onHide?: (entryId: string) => void
  onRemoveFromBranch?: (entryId: string) => void
}

export default function MemoryCard({ entry, branchOwnerId, branchId, onWithdraw, onHide, onRemoveFromBranch }: MemoryCardProps) {
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sharingInfo, setSharingInfo] = useState<{
    isShared: boolean
    originBranch: string | null
    sharedBranches: string[]
  } | null>(null)

  const userId = (session?.user as any)?.id
  const isAuthor = entry.author.id === userId
  const isBranchOwner = branchOwnerId === userId

  // Fetch sharing information
  useEffect(() => {
    if (!branchId) return

    async function fetchSharingInfo() {
      try {
        const res = await fetch(`/api/memories/${entry.id}/sharing-info?branchId=${branchId}`)
        if (res.ok) {
          const data = await res.json()
          setSharingInfo(data)
        }
      } catch (error) {
        console.error('Failed to fetch sharing info:', error)
      }
    }

    fetchSharingInfo()
  }, [entry.id, branchId])
  const visibilityColors = {
    PRIVATE: 'text-text-muted',
    SHARED: 'text-blue-400',
    LEGACY: 'text-purple-400',
  }

  const visibilityLabels = {
    PRIVATE: 'Private',
    SHARED: 'Shared',
    LEGACY: 'Legacy',
  }

  const handleWithdraw = async () => {
    if (!confirm('Withdraw this memory? You can restore it from your trash within 30 days.')) {
      return
    }

    setIsProcessing(true)
    setShowMenu(false)

    try {
      const res = await fetch(`/api/entries/${entry.id}/withdraw`, {
        method: 'POST',
      })

      if (res.ok) {
        onWithdraw?.(entry.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to withdraw memory')
      }
    } catch (error) {
      console.error('Error withdrawing memory:', error)
      alert('Failed to withdraw memory')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleHide = async () => {
    if (!confirm('Hide this memory from the branch? You can restore it from trash within 30 days.')) {
      return
    }

    setIsProcessing(true)
    setShowMenu(false)

    try {
      const res = await fetch(`/api/entries/${entry.id}/hide`, {
        method: 'POST',
      })

      if (res.ok) {
        onHide?.(entry.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to hide memory')
      }
    } catch (error) {
      console.error('Error hiding memory:', error)
      alert('Failed to hide memory')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveFromBranch = async () => {
    if (!confirm('Remove this memory from this branch? It will remain visible in other branches where it\'s shared.')) {
      return
    }

    setIsProcessing(true)
    setShowMenu(false)

    try {
      const res = await fetch(`/api/memories/${entry.id}/remove-from-branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId }),
      })

      if (res.ok) {
        onRemoveFromBranch?.(entry.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to remove memory from branch')
      }
    } catch (error) {
      console.error('Error removing memory from branch:', error)
      alert('Failed to remove memory from branch')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/50 transition-soft">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-firefly-glow">✦</span>
            <span className="text-text-soft text-sm">{entry.author.name}</span>
            {sharingInfo?.isShared && (
              <Tooltip content="This moment is shared with other branches">
                <span className="chip-shared">
                  Shared
                </span>
              </Tooltip>
            )}
          </div>
          {sharingInfo?.originBranch && (
            <div className="origin-branch-label ml-6">
              From: {sharingInfo.originBranch}
            </div>
          )}
          {sharingInfo?.sharedBranches && sharingInfo.sharedBranches.length > 0 && (
            <div className="origin-branch-label ml-6">
              Also in: {sharingInfo.sharedBranches.join(', ')}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${visibilityColors[entry.visibility as keyof typeof visibilityColors]}`}>
            {visibilityLabels[entry.visibility as keyof typeof visibilityLabels]}
          </span>
          <span className="text-text-muted text-xs">
            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
          </span>

          {/* Actions menu */}
          {(isAuthor || isBranchOwner) && (
            <div className="relative">
              <Tooltip content="Memory actions">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  disabled={isProcessing}
                  className="text-text-muted hover:text-text-soft transition-soft disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </Tooltip>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-bg-darker border border-border-subtle rounded-lg shadow-xl min-w-[180px]">
                    {isAuthor && (
                      <button
                        onClick={handleWithdraw}
                        disabled={isProcessing}
                        className="w-full text-left px-4 py-2 text-sm text-text-soft hover:bg-bg-dark transition-soft disabled:opacity-50"
                      >
                        Withdraw
                      </button>
                    )}
                    {isBranchOwner && !isAuthor && (
                      <button
                        onClick={handleHide}
                        disabled={isProcessing}
                        className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-bg-dark transition-soft disabled:opacity-50"
                      >
                        Hide from Branch
                      </button>
                    )}
                    {isBranchOwner && isAuthor && (
                      <button
                        onClick={handleHide}
                        disabled={isProcessing}
                        className="w-full text-left px-4 py-2 text-sm text-text-soft hover:bg-bg-dark transition-soft disabled:opacity-50"
                      >
                        Hide from Branch
                      </button>
                    )}
                    {/* Show "Remove from this Branch" if shared */}
                    {sharingInfo?.isShared && (isBranchOwner || isAuthor) && (
                      <button
                        onClick={handleRemoveFromBranch}
                        disabled={isProcessing}
                        className="w-full text-left px-4 py-2 text-sm text-text-soft hover:bg-bg-dark transition-soft disabled:opacity-50 border-t border-border-subtle"
                      >
                        Remove from this Branch
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-text-soft leading-relaxed whitespace-pre-wrap">
        {entry.text}
      </p>

      {entry.mediaUrl && (
        <div className="mt-4">
          <img
            src={entry.mediaUrl}
            alt="Memory"
            className="rounded-lg max-w-full h-auto"
          />
        </div>
      )}

      {entry.audioUrl && (
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={entry.audioUrl} type="audio/webm" />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </div>
  )
}

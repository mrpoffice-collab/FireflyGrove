'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Tooltip from './Tooltip'
import SharePanel from './SharePanel'
import MemoryModal from './MemoryModal'

interface MemoryCardProps {
  entry: {
    id: string
    text: string
    visibility: string
    mediaUrl: string | null
    videoUrl: string | null
    audioUrl: string | null
    createdAt: string
    glowCount?: number
    glows?: Array<{ userId: string }>
    _count?: {
      childMemories: number
    }
    author: {
      name: string
      id?: string
    }
  }
  branchOwnerId?: string
  branchId?: string
  branchTitle?: string
  onWithdraw?: (entryId: string) => void
  onHide?: (entryId: string) => void
  onRemoveFromBranch?: (entryId: string) => void
  onMemoryAdded?: () => void
}

export default function MemoryCard({ entry, branchOwnerId, branchId, branchTitle, onWithdraw, onHide, onRemoveFromBranch, onMemoryAdded }: MemoryCardProps) {
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pinningToPinterest, setPinningToPinterest] = useState(false)
  const [showBoardSelector, setShowBoardSelector] = useState(false)
  const [pinterestBoards, setPinterestBoards] = useState<any[]>([])
  const [sharingInfo, setSharingInfo] = useState<{
    isShared: boolean
    originBranch: string | null
    sharedBranches: string[]
  } | null>(null)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Firefly Glow state
  const [glowCount, setGlowCount] = useState(entry.glowCount || 0)
  const [isGlowing, setIsGlowing] = useState(false)
  const [isGlowProcessing, setIsGlowProcessing] = useState(false)

  // Memory threading state
  const [showThreadModal, setShowThreadModal] = useState(false)
  const [showInspiredModal, setShowInspiredModal] = useState(false)
  const [childMemories, setChildMemories] = useState<any[]>([])
  const [showThread, setShowThread] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [threadSpark, setThreadSpark] = useState('')
  const [inspiredSpark, setInspiredSpark] = useState('')

  const userId = (session?.user as any)?.id
  const isAuthor = entry.author.id === userId
  const isBranchOwner = branchOwnerId === userId
  const isAdmin = (session?.user as any)?.isAdmin

  // Check if user has already glowed this memory
  useEffect(() => {
    if (userId && entry.glows) {
      setIsGlowing(entry.glows.some(g => g.userId === userId))
    }
  }, [userId, entry.glows])

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

  const handlePinToPinterest = async () => {
    if (!isAdmin) {
      alert('Pinterest sharing is available to admins only')
      return
    }

    setPinningToPinterest(true)

    try {
      // Fetch boards if we haven't already
      if (pinterestBoards.length === 0) {
        const boardsRes = await fetch('/api/pinterest/boards')
        if (boardsRes.ok) {
          const data = await boardsRes.json()
          setPinterestBoards(data.boards || [])
          setShowBoardSelector(true)
        } else {
          throw new Error('Failed to fetch Pinterest boards')
        }
      } else {
        setShowBoardSelector(true)
      }
    } catch (error) {
      console.error('Error fetching Pinterest boards:', error)
      alert('Failed to connect to Pinterest. Please check your API configuration.')
    } finally {
      setPinningToPinterest(false)
    }
  }

  const handleSelectBoardAndPin = async (boardId: string) => {
    setPinningToPinterest(true)
    setShowBoardSelector(false)

    try {
      const res = await fetch('/api/pinterest/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoryId: entry.id,
          boardId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Successfully pinned to Pinterest!\n\nView at: ${data.pin.url}`)
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create pin')
      }
    } catch (error: any) {
      console.error('Error pinning to Pinterest:', error)
      alert(`Failed to pin to Pinterest: ${error.message}`)
    } finally {
      setPinningToPinterest(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleSaveEdit = async (data: {
    text: string
    visibility: string
    legacyFlag: boolean
    mediaUrl?: string
    videoUrl?: string
    audioUrl?: string
    sharedBranchIds?: string[]
    memoryCard?: string | null
    parentMemoryId?: string
  }) => {
    setIsProcessing(true)

    try {
      const res = await fetch(`/api/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.text,
          mediaUrl: data.mediaUrl,
          videoUrl: data.videoUrl,
          audioUrl: data.audioUrl,
        }),
      })

      if (res.ok) {
        // Update entry with new data
        entry.text = data.text
        if (data.mediaUrl !== undefined) entry.mediaUrl = data.mediaUrl
        if (data.videoUrl !== undefined) entry.videoUrl = data.videoUrl
        if (data.audioUrl !== undefined) entry.audioUrl = data.audioUrl
        setIsEditing(false)

        // Trigger refresh if callback provided
        onMemoryAdded?.()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update memory')
      }
    } catch (error) {
      console.error('Error updating memory:', error)
      alert('Failed to update memory')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleToggleGlow = async () => {
    if (!userId) {
      alert('Please sign in to glow this memory')
      return
    }

    setIsGlowProcessing(true)

    try {
      const method = isGlowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/memories/${entry.id}/glow`, {
        method,
      })

      if (res.ok) {
        const data = await res.json()
        setGlowCount(data.glowCount)
        setIsGlowing(data.isGlowing)
      } else {
        const data = await res.json()
        console.error('Failed to toggle glow:', data.error)
      }
    } catch (error) {
      console.error('Error toggling glow:', error)
    } finally {
      setIsGlowProcessing(false)
    }
  }

  const loadThread = async () => {
    if (showThread || loadingThread) return

    setLoadingThread(true)
    try {
      const res = await fetch(`/api/memories/${entry.id}/thread`)
      if (res.ok) {
        const data = await res.json()
        setChildMemories(data.childMemories)
        setShowThread(true)
      }
    } catch (error) {
      console.error('Error loading thread:', error)
    } finally {
      setLoadingThread(false)
    }
  }

  const fetchSpark = async () => {
    try {
      const res = await fetch('/api/spark')
      if (res.ok) {
        const data = await res.json()
        return data.spark
      }
    } catch (error) {
      console.error('Error fetching spark:', error)
    }
    return 'What memory comes to mind?'
  }

  const handleOpenThreadModal = async () => {
    const spark = await fetchSpark()
    setThreadSpark(spark)
    setShowThreadModal(true)
  }

  const handleOpenInspiredModal = async () => {
    const spark = await fetchSpark()
    setInspiredSpark(spark)
    setShowInspiredModal(true)
  }

  const handleThreadMemorySave = async (data: any) => {
    if (!branchId) return

    try {
      const res = await fetch(`/api/branches/${branchId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setShowThreadModal(false)
        // Reload thread to show new reply
        const threadRes = await fetch(`/api/memories/${entry.id}/thread`)
        if (threadRes.ok) {
          const threadData = await threadRes.json()
          setChildMemories(threadData.childMemories)
          setShowThread(true)
        }
        onMemoryAdded?.()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create threaded memory')
      }
    } catch (error) {
      console.error('Error creating threaded memory:', error)
      alert('Failed to create threaded memory')
    }
  }

  const handleInspiredMemorySave = async (data: any) => {
    if (!branchId) return

    try {
      const res = await fetch(`/api/branches/${branchId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setShowInspiredModal(false)
        onMemoryAdded?.()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create inspired memory')
      }
    } catch (error) {
      console.error('Error creating inspired memory:', error)
      alert('Failed to create inspired memory')
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
    <div
      className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/50 transition-soft memory-card-glow"
      data-glow-count={glowCount}
      style={{
        boxShadow: glowCount > 0
          ? `0 0 ${Math.min(10 + glowCount * 4, 50)}px rgba(255, 217, 102, ${Math.min(0.1 + glowCount * 0.05, 0.6)})`
          : undefined,
        borderColor: glowCount > 0
          ? `rgba(255, 217, 102, ${Math.min(0.2 + glowCount * 0.05, 0.5)})`
          : undefined,
      }}
    >
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

          {/* Share Button */}
          <Tooltip content="Share this memory">
            <button
              onClick={() => setShowSharePanel(true)}
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </Tooltip>

          {/* Pinterest Share Button (Admin Only) */}
          {isAdmin && (
            <Tooltip content="Share to Pinterest">
              <button
                onClick={handlePinToPinterest}
                disabled={pinningToPinterest}
                className="text-text-muted hover:text-red-500 transition-soft disabled:opacity-50"
              >
                {pinningToPinterest ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                )}
              </button>
            </Tooltip>
          )}

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
                      <>
                        <button
                          onClick={handleEdit}
                          disabled={isProcessing}
                          className="w-full text-left px-4 py-2 text-sm text-firefly-glow hover:bg-bg-dark transition-soft disabled:opacity-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={handleWithdraw}
                          disabled={isProcessing}
                          className="w-full text-left px-4 py-2 text-sm text-text-soft hover:bg-bg-dark transition-soft disabled:opacity-50"
                        >
                          Withdraw
                        </button>
                      </>
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
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-memory.jpg'
              target.onerror = null // Prevent infinite loop if placeholder also fails
            }}
          />
        </div>
      )}

      {entry.videoUrl && (
        <div className="mt-4">
          <video
            src={entry.videoUrl}
            controls
            className="rounded-lg max-w-full h-auto"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {entry.audioUrl && (
        <div className="mt-4">
          <audio
            controls
            className="w-full"
            onError={(e) => {
              // Hide audio player if source fails to load
              const target = e.target as HTMLAudioElement
              target.style.display = 'none'
            }}
          >
            <source src={entry.audioUrl} type="audio/webm" />
            <source src={entry.audioUrl} type="audio/mpeg" />
            <source src={entry.audioUrl} type="audio/mp3" />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      {/* Firefly Glow & Conversation Buttons */}
      <div className="mt-4 pt-3 border-t border-border-subtle/50 space-y-3">
        {/* Glow */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleGlow}
            disabled={isGlowProcessing || !userId}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              isGlowing
                ? 'bg-firefly-glow/20 text-firefly-glow border border-firefly-glow/40'
                : 'bg-bg-darker text-text-muted hover:text-firefly-dim hover:border-firefly-dim/30 border border-border-subtle'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isGlowing ? 'Remove your glow' : 'Add your glow'}
          >
            <span className="text-lg">{isGlowing ? '✨' : '✨'}</span>
            <span className="text-sm font-medium">
              {isGlowProcessing ? '...' : isGlowing ? 'Glowing' : 'Glow this'}
            </span>
          </button>
          {glowCount > 0 && (
            <span className="text-text-muted text-sm">
              ✨<sup>{glowCount}</sup> {glowCount === 1 ? 'glow' : 'glows'}
            </span>
          )}
        </div>

        {/* Conversation Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenThreadModal}
            disabled={!userId}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-darker border border-border-subtle text-text-muted hover:text-white hover:border-firefly-dim/40 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add a related memory about the same person/topic"
          >
            <span>💬</span>
            <span>Oh yeah, and...</span>
          </button>
          <button
            onClick={handleOpenInspiredModal}
            disabled={!userId}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-darker border border-border-subtle text-text-muted hover:text-white hover:border-firefly-dim/40 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="This reminds you of a different memory"
          >
            <span>💭</span>
            <span>That reminds me of...</span>
          </button>
          {entry._count && entry._count.childMemories > 0 && (
            <button
              onClick={loadThread}
              disabled={loadingThread}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-firefly-dim/10 border border-firefly-dim/30 text-firefly-glow hover:bg-firefly-dim/20 transition-all text-sm"
            >
              <span>💬</span>
              <span>{entry._count.childMemories} {entry._count.childMemories === 1 ? 'reply' : 'replies'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Pinterest Board Selector Modal */}
      {showBoardSelector && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowBoardSelector(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-bg-dark border border-border-subtle rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl text-text-soft mb-4">Select Pinterest Board</h3>
              {pinterestBoards.length === 0 ? (
                <p className="text-text-muted text-sm">No boards found. Create a board in Pinterest first.</p>
              ) : (
                <div className="space-y-2">
                  {pinterestBoards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => handleSelectBoardAndPin(board.id)}
                      disabled={pinningToPinterest}
                      className="w-full text-left p-4 bg-bg-elevated hover:bg-border-subtle border border-border-subtle rounded transition-soft disabled:opacity-50"
                    >
                      <div className="font-medium text-text-soft">{board.name}</div>
                      {board.description && (
                        <div className="text-sm text-text-muted mt-1">{board.description}</div>
                      )}
                      <div className="text-xs text-text-muted mt-2">{board.pin_count} pins</div>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowBoardSelector(false)}
                className="mt-4 w-full py-2 bg-bg-elevated hover:bg-border-subtle text-text-soft rounded transition-soft"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Thread Modal - "Oh yeah, and..." */}
      {showThreadModal && threadSpark && (
        <MemoryModal
          onClose={() => setShowThreadModal(false)}
          onSave={handleThreadMemorySave}
          spark={threadSpark}
          onRefreshSpark={async () => {
            const spark = await fetchSpark()
            setThreadSpark(spark)
          }}
          currentBranchId={branchId}
          isAdmin={isAdmin}
          parentMemoryId={entry.id}
          threadType="thread"
        />
      )}

      {/* Inspired Modal - "That reminds me of..." */}
      {showInspiredModal && inspiredSpark && (
        <MemoryModal
          onClose={() => setShowInspiredModal(false)}
          onSave={handleInspiredMemorySave}
          spark={inspiredSpark}
          onRefreshSpark={async () => {
            const spark = await fetchSpark()
            setInspiredSpark(spark)
          }}
          currentBranchId={branchId}
          isAdmin={isAdmin}
          threadType="inspired"
        />
      )}

      {/* Edit Modal - Full memory editing */}
      {isEditing && (
        <MemoryModal
          onClose={handleCancelEdit}
          onSave={handleSaveEdit}
          spark={entry.text}
          currentBranchId={branchId}
          isAdmin={isAdmin}
          prePopulatedPhoto={
            entry.mediaUrl
              ? { url: entry.mediaUrl, mediaType: 'photo' }
              : undefined
          }
        />
      )}

      {/* Threaded Replies Display */}
      {showThread && childMemories.length > 0 && (
        <div className="mt-4 pl-6 border-l-2 border-firefly-dim/30 space-y-3">
          <div className="text-sm text-text-muted mb-2">
            💬 Thread ({childMemories.length} {childMemories.length === 1 ? 'reply' : 'replies'})
          </div>
          {childMemories.map((child) => (
            <div
              key={child.id}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm text-text-muted">
                  {child.author.name} • {formatDistanceToNow(new Date(child.createdAt), { addSuffix: true })}
                </div>
              </div>
              <p className="text-text-soft whitespace-pre-wrap">{child.text}</p>
              {child.mediaUrl && (
                <img
                  src={child.mediaUrl}
                  alt="Memory"
                  className="mt-3 rounded max-w-full h-auto"
                />
              )}
              {child.audioUrl && (
                <audio controls className="mt-3 w-full">
                  <source src={child.audioUrl} type="audio/webm" />
                </audio>
              )}
              {child.glowCount > 0 && (
                <div className="mt-2 text-sm text-text-muted">
                  ✨<sup>{child.glowCount}</sup> {child.glowCount === 1 ? 'glow' : 'glows'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share Panel */}
      <SharePanel
        isOpen={showSharePanel}
        onClose={() => setShowSharePanel(false)}
        shareData={{
          title: branchTitle ? `${branchTitle} - Memory by ${entry.author.name}` : `Memory by ${entry.author.name}`,
          text: entry.text.length > 100 ? entry.text.substring(0, 100) + '...' : entry.text,
          url: typeof window !== 'undefined' && branchId ? `${window.location.origin}/branch/${branchId}?share=${Date.now()}` : (typeof window !== 'undefined' ? window.location.href : ''),
        }}
      />
    </div>
  )
}

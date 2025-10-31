'use client'

import { useState, useEffect } from 'react'

interface UndoBannerProps {
  entryId: string
  createdAt: Date
  onUndo: () => void
  onDismiss: () => void
}

export default function UndoBanner({
  entryId,
  createdAt,
  onUndo,
  onDismiss,
}: UndoBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(60)
  const [isUndoing, setIsUndoing] = useState(false)

  useEffect(() => {
    // Calculate initial seconds left
    const now = new Date()
    const elapsed = Math.floor((now.getTime() - new Date(createdAt).getTime()) / 1000)
    const remaining = Math.max(0, 60 - elapsed)

    if (remaining === 0) {
      onDismiss()
      return
    }

    setSecondsLeft(remaining)

    // Update countdown every second
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onDismiss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [createdAt, onDismiss])

  const handleUndo = async () => {
    setIsUndoing(true)

    try {
      const res = await fetch(`/api/entries/${entryId}/undo`, {
        method: 'POST',
      })

      if (res.ok) {
        onUndo()
      } else {
        const data = await res.json()

        if (data.error === 'undo_window_expired') {
          alert('The undo window has expired. You can withdraw this memory from the settings instead.')
          onDismiss()
        } else {
          alert(data.error || 'Failed to undo memory')
        }
      }
    } catch (error) {
      console.error('Error undoing memory:', error)
      alert('Failed to undo memory')
    } finally {
      setIsUndoing(false)
    }
  }

  if (secondsLeft === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-bg-dark border border-firefly-dim rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4 max-w-md">
        <div className="flex-1">
          <div className="text-text-soft font-medium mb-1">
            Memory added
          </div>
          <div className="text-text-muted text-sm">
            {secondsLeft}s to undo
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={isUndoing}
            className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500"
          >
            {isUndoing ? 'Undoing...' : 'Undo'}
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-bg-darker hover:bg-border-subtle text-text-muted rounded transition-soft"
          >
            Dismiss
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-subtle rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-firefly-dim transition-all duration-1000 ease-linear"
            style={{
              width: `${(secondsLeft / 60) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

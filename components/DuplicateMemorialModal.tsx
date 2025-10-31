'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import FocusTrap from 'focus-trap-react'

interface Match {
  id: string
  branchId: string | null
  name: string
  birthDate: string
  deathDate: string
  memoryCount: number
  ownerName: string
  discoveryEnabled: boolean
}

interface DuplicateMemorialModalProps {
  matches: Match[]
  onConnect: (personId: string) => void
  onCreateNew: () => void
  onCancel: () => void
}

export default function DuplicateMemorialModal({
  matches,
  onConnect,
  onCreateNew,
  onCancel,
}: DuplicateMemorialModalProps) {
  const router = useRouter()
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)

  // Store trigger element and restore focus on close
  useEffect(() => {
    setTriggerElement(document.activeElement as HTMLElement)

    return () => {
      if (triggerElement) {
        setTimeout(() => triggerElement.focus(), 0)
      }
    }
  }, [])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <FocusTrap>
        <div
          className="bg-bg-dark border border-[var(--legacy-amber)]/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="duplicate-memorial-title"
        >
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🕯️</div>
              <h2 id="duplicate-memorial-title" className="text-2xl font-light text-[var(--legacy-text)] mb-2">
                Every story deserves a light — even if it shines twice.
              </h2>
              <p className="text-text-muted text-sm">
                We found {matches.length} existing memorial{matches.length > 1 ? 's' : ''} that might match
              </p>
            </div>

          {/* Existing Memorials */}
          <div className="space-y-4 mb-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-bg-darker border border-border-subtle rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg text-[var(--legacy-text)] font-medium mb-1">
                      {match.name}
                    </h3>
                    <div className="text-text-muted text-sm">
                      {formatDate(match.birthDate)} ~ {formatDate(match.deathDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-soft text-sm font-medium">
                      {match.memoryCount} {match.memoryCount === 1 ? 'memory' : 'memories'}
                    </div>
                    <div className="text-text-muted text-xs">
                      Created by {match.ownerName}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (match.branchId) {
                        router.push(`/branch/${match.branchId}`)
                      }
                    }}
                    disabled={!match.branchId}
                    className="flex-1 px-4 py-2 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded text-sm font-medium transition-soft disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
                  >
                    👁️ View Memorial
                  </button>
                  <button
                    onClick={() => onConnect(match.id)}
                    className="flex-1 px-4 py-2 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded text-sm font-medium transition-soft"
                  >
                    🌳 Connect & Contribute
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="border-t border-border-subtle pt-6">
            <div className="mb-4">
              <h3 className="text-text-soft font-medium mb-2 text-sm">What would you like to do?</h3>
              <p className="text-text-muted text-xs mb-4">
                Connecting to an existing memorial helps keep all memories in one place.
                Creating a new memorial is also fine — some families prefer separate trees.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onCreateNew}
                className="flex-1 px-6 py-3 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow border border-firefly-dim/30 rounded font-medium transition-soft"
              >
                🌱 Create My Own Memorial
              </button>
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-bg-darker hover:bg-border-subtle text-text-muted rounded font-medium transition-soft"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-text-muted">
              💡 <strong>Tip:</strong> If you create a separate memorial, we'll track both as potential duplicates.
              You can always merge them later by contacting support.
            </div>
          </div>
        </div>
        </div>
      </FocusTrap>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import FocusTrap from 'focus-trap-react'

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
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSendInvitation = async () => {
    if (!recipientEmail.trim()) {
      setError('Please enter a recipient email address')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/trees/${treeId}/transfer-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          message: message.trim() || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to send tree transfer invitation')
      }
    } catch (err) {
      console.error('Error sending invitation:', err)
      setError('Failed to send tree transfer invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <FocusTrap>
        <div
          className="bg-bg-dark border border-border-subtle rounded-lg max-w-lg w-full p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transplant-modal-title"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 id="transplant-modal-title" className="text-2xl font-light text-text-soft">Transfer Tree 🌿</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-soft transition-soft"
              aria-label="Close transfer tree modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

        <div className="space-y-6">
          {/* Explanation */}
          <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded p-4">
            <p className="text-text-soft text-sm">
              Send an invitation to transfer <strong>{treeName}</strong> to another person.
              They'll receive an email with options to accept the tree into their grove or
              subscribe to a single tree.
            </p>
          </div>

          {/* Current Location */}
          <div className="bg-bg-dark border border-border-subtle rounded p-4">
            <p className="text-sm text-text-muted mb-1">Current Location</p>
            <p className="text-text-soft font-medium">{currentGroveName}</p>
          </div>

          {/* Recipient Email */}
          <div>
            <label className="block text-sm text-text-muted mb-2">
              Recipient's Email Address
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-soft focus:outline-none focus:border-firefly-dim/50 transition-soft"
            />
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-sm text-text-muted mb-2">
              Optional Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              maxLength={500}
              className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-soft focus:outline-none focus:border-firefly-dim/50 transition-soft resize-none"
            />
            <p className="text-xs text-text-muted mt-1">
              {message.length}/500 characters
            </p>
          </div>

          {/* Info about what happens */}
          <div className="bg-bg-dark border border-border-subtle rounded p-4">
            <p className="text-sm text-text-soft mb-2">What happens next:</p>
            <ol className="text-sm text-text-muted space-y-1 list-decimal list-inside">
              <li>Recipient gets an email with an acceptance link</li>
              <li>They can accept into their grove or subscribe to single tree</li>
              <li>Once accepted, the tree moves from your grove to theirs</li>
              <li>You'll retain contributor access to the tree's memories</li>
            </ol>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-muted rounded font-medium transition-soft disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvitation}
            disabled={loading}
            className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
        </div>
      </FocusTrap>
    </div>
  )
}

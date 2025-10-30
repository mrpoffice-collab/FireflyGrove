'use client'

import { useState, useEffect } from 'react'

interface SharePanelProps {
  isOpen: boolean
  onClose: () => void
  shareData: {
    title: string
    text: string
    url: string
  }
}

export default function SharePanel({ isOpen, onClose, shareData }: SharePanelProps) {
  const [copied, setCopied] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        onClose()
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    }
  }

  const isNativeShareSupported = typeof navigator !== 'undefined' && 'share' in navigator

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`
    window.open(url, '_blank', 'width=600,height=400')
    onClose()
  }

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title + ' - ' + shareData.text)}&url=${encodeURIComponent(shareData.url)}`
    window.open(url, '_blank', 'width=600,height=400')
    onClose()
  }

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareData.title + ' - ' + shareData.text + ' ' + shareData.url)}`
    window.open(url, '_blank')
    onClose()
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareData.title)
    const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    onClose()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-bg-elevated border-l border-border-subtle z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-subtle">
            <h2 className="text-xl font-light text-text-soft">Share</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-soft transition-soft"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {/* Native Share (mobile/modern browsers) */}
              {isNativeShareSupported && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-4 p-4 bg-bg-dark hover:bg-bg-elevated border border-border-subtle rounded-lg transition-soft text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-firefly-glow to-firefly-dim rounded-lg flex items-center justify-center text-lg">
                    📱
                  </div>
                  <div>
                    <div className="text-text-soft font-medium">Share via...</div>
                    <div className="text-text-muted text-sm">Use device share menu</div>
                  </div>
                </button>
              )}

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="w-full flex items-center gap-4 p-4 bg-bg-dark hover:bg-bg-elevated border border-border-subtle rounded-lg transition-soft text-left"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                  f
                </div>
                <div>
                  <div className="text-text-soft font-medium">Facebook</div>
                  <div className="text-text-muted text-sm">Share on Facebook</div>
                </div>
              </button>

              {/* Twitter/X */}
              <button
                onClick={handleTwitterShare}
                className="w-full flex items-center gap-4 p-4 bg-bg-dark hover:bg-bg-elevated border border-border-subtle rounded-lg transition-soft text-left"
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-xl">
                  𝕏
                </div>
                <div>
                  <div className="text-text-soft font-medium">X (Twitter)</div>
                  <div className="text-text-muted text-sm">Post on X</div>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-4 p-4 bg-bg-dark hover:bg-bg-elevated border border-border-subtle rounded-lg transition-soft text-left"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                  💬
                </div>
                <div>
                  <div className="text-text-soft font-medium">WhatsApp</div>
                  <div className="text-text-muted text-sm">Send via WhatsApp</div>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={handleEmailShare}
                className="w-full flex items-center gap-4 p-4 bg-bg-dark hover:bg-bg-elevated border border-border-subtle rounded-lg transition-soft text-left"
              >
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white text-xl">
                  📧
                </div>
                <div>
                  <div className="text-text-soft font-medium">Email</div>
                  <div className="text-text-muted text-sm">Share via email</div>
                </div>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-4 p-4 bg-bg-dark hover:bg-bg-elevated border border-border-subtle rounded-lg transition-soft text-left"
              >
                <div className="w-10 h-10 bg-firefly-dim/30 rounded-lg flex items-center justify-center text-firefly-glow text-xl">
                  {copied ? '✓' : '🔗'}
                </div>
                <div>
                  <div className="text-text-soft font-medium">
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </div>
                  <div className="text-text-muted text-sm">
                    {copied ? 'Ready to paste' : 'Copy to clipboard'}
                  </div>
                </div>
              </button>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-bg-dark border border-border-subtle rounded-lg">
              <div className="text-text-muted text-xs mb-2">Preview:</div>
              <div className="text-text-soft font-medium mb-1">{shareData.title}</div>
              <div className="text-text-muted text-sm mb-2">{shareData.text}</div>
              <div className="text-firefly-glow text-xs truncate">{shareData.url}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

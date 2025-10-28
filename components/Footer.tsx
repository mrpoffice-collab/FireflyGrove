'use client'

import Link from 'next/link'
import { useState } from 'react'
import FeedbackModal from './FeedbackModal'

export default function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  return (
    <>
      <footer className="border-t border-border-subtle bg-bg-dark mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-text-muted text-sm mb-3">
              © 2025 Firefly Grove · Where memories take root and stories keep growing
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-text-muted hover:text-firefly-glow transition-soft"
              >
                Privacy Policy
              </Link>
              <span className="text-text-muted">·</span>
              <Link
                href="/terms"
                className="text-text-muted hover:text-firefly-glow transition-soft"
              >
                Terms of Service
              </Link>
              <span className="text-text-muted">·</span>
              <a
                href="/faq.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-firefly-glow transition-soft"
              >
                FAQ
              </a>
              <span className="text-text-muted">·</span>
              <Link
                href="/open-grove"
                className="text-text-muted hover:text-firefly-glow transition-soft"
              >
                Open Grove
              </Link>
              <span className="text-text-muted">·</span>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-text-muted hover:text-firefly-glow transition-soft"
              >
                Feedback
              </button>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  )
}

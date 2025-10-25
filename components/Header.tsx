'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FeedbackModal from './FeedbackModal'

interface HeaderProps {
  userName?: string
  isBetaTester?: boolean
  groveInfo?: {
    planName: string
    treeCount: number
    treeLimit: number
  }
}

export default function Header({ userName, isBetaTester, groveInfo }: HeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-bg-dark border-b border-border-subtle">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-soft">
              <span className="text-firefly-glow text-xl">✦</span>
              <h1 className="text-lg font-light text-text-soft">Firefly Grove</h1>
            </Link>

            <nav className="hidden md:flex items-center gap-3">
              <Link
                href="/grove"
                className="text-text-muted hover:text-firefly-glow text-sm transition-soft"
              >
                My Grove
              </Link>
              <Link
                href="/open-grove"
                className="text-text-muted hover:text-[var(--legacy-glow)] text-sm transition-soft"
              >
                🕯️ Open Grove
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Beta Feedback Button - Visible to all users */}
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium transition-soft flex items-center gap-1"
            >
              <span>💬</span>
              <span className="hidden sm:inline">Beta Feedback</span>
            </button>

            <div className="relative" ref={dropdownRef}>
              {userName ? (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-text-muted hover:text-text-soft text-sm transition-soft"
                  >
                    <span>{userName}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-bg-dark border border-border-subtle rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-3 py-2 border-b border-border-subtle">
                  <div className="text-text-soft text-sm font-medium mb-1.5">{userName}</div>
                  {groveInfo && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Plan:</span>
                        <span className="text-firefly-glow">{groveInfo.planName}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Trees:</span>
                        <span className="text-text-soft">{groveInfo.treeCount} / {groveInfo.treeLimit}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="py-0.5">
                  <button
                    onClick={() => {
                      router.push('/billing')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                  >
                    Manage Plan
                  </button>
                  <button
                    onClick={() => {
                      router.push('/grove-exchange')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                  >
                    🏪 The Grove Exchange
                  </button>
                  {isBetaTester && (
                    <button
                      onClick={() => {
                        router.push('/admin/beta-invites')
                        setIsDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                    >
                      📧 Send Beta Invite
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsFeedbackOpen(true)
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                  >
                    🐛 Report an Issue
                  </button>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/login' })
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </header>
  )
}

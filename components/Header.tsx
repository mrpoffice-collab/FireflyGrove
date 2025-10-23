'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  userName: string
  groveInfo?: {
    planName: string
    treeCount: number
    treeLimit: number
  }
}

export default function Header({ userName, groveInfo }: HeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-soft">
            <span className="text-firefly-glow text-2xl">✦</span>
            <h1 className="text-xl font-light text-text-soft">Firefly Grove</h1>
          </Link>

          <div className="relative" ref={dropdownRef}>
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
              <div className="absolute right-0 mt-2 w-64 bg-bg-dark border border-border-subtle rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border-subtle">
                  <div className="text-text-soft text-sm font-medium mb-2">{userName}</div>
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

                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push('/billing')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                  >
                    Manage Plan
                  </button>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/login' })
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

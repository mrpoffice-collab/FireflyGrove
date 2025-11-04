'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FeedbackModal from './FeedbackModal'

interface HeaderProps {
  userName?: string
  isBetaTester?: boolean
  isAdmin?: boolean
  groveInfo?: {
    planName: string
    treeCount: number
    treeLimit: number
  }
  onTreasureClick?: () => void
  treasureStreak?: number
}

export default function Header({ userName, isBetaTester: propBetaTester, isAdmin: propAdmin, groveInfo, onTreasureClick, treasureStreak }: HeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsSubmenuOpen, setIsSettingsSubmenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get admin/beta status from session if not provided as props
  const isBetaTester = propBetaTester !== undefined
    ? propBetaTester
    : (session?.user as any)?.isBetaTester || false

  const isAdmin = propAdmin !== undefined
    ? propAdmin
    : (session?.user as any)?.isAdmin || false

  // Admin mode toggle - stored in localStorage
  const [adminModeActive, setAdminModeActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminModeActive')
      // ALWAYS default to true for admins (only turn off if explicitly set to false)
      return stored === 'false' ? false : true
    }
    return true // Default to true
  })

  // Update admin mode when isAdmin changes (handles session loading)
  useEffect(() => {
    if (isAdmin && typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminModeActive')
      // If admin status just loaded and no explicit preference is stored, enable admin mode
      if (stored === null) {
        setAdminModeActive(true)
        localStorage.setItem('adminModeActive', 'true')
      } else {
        // Respect stored preference
        setAdminModeActive(stored !== 'false')
      }
    }
  }, [isAdmin])

  // Toggle admin mode and save to localStorage
  const toggleAdminMode = () => {
    const newMode = !adminModeActive
    setAdminModeActive(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminModeActive', newMode.toString())
    }
  }

  // Use adminModeActive instead of isAdmin for UI rendering
  const showAdminFeatures = isAdmin && adminModeActive

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
    <>
    <header className="bg-bg-dark border-b border-border-subtle">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-text-muted hover:text-firefly-glow transition-soft min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

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
                href="/nest"
                className="text-text-muted hover:text-firefly-dim text-sm transition-soft"
              >
                🪺 My Nest
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
            {/* Treasure Chest Badge - Show if user is logged in */}
            {userName && onTreasureClick && (
              <button
                onClick={onTreasureClick}
                className="min-h-[44px] px-3 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow border border-firefly-dim/40 rounded text-xs font-medium transition-soft flex items-center gap-1.5"
                aria-label={treasureStreak ? `Treasure Chest - ${treasureStreak} day streak` : 'Open Treasure Chest'}
              >
                <span>📜</span>
                {treasureStreak !== undefined && treasureStreak > 0 && (
                  <span className="hidden sm:inline">{treasureStreak}✨</span>
                )}
              </button>
            )}

            {/* Beta Invite Button - Visible to beta testers */}
            {isBetaTester && (
              <button
                onClick={() => router.push('/beta-invites')}
                className="min-h-[44px] px-3 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow border border-firefly-dim/40 rounded text-xs font-medium transition-soft flex items-center gap-1.5"
                aria-label="Invite friends to beta"
              >
                <span>📧</span>
                <span className="hidden sm:inline">Invite Friends</span>
              </button>
            )}

            <div className="relative" ref={dropdownRef}>
              {userName ? (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="min-h-[44px] flex items-center gap-2 text-text-muted hover:text-text-soft text-sm transition-soft px-2"
                    aria-label="User menu"
                    aria-expanded={isDropdownOpen}
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

                {/* Admin Mode Toggle - Only for admins */}
                {isAdmin && (
                  <div className="px-3 py-2 border-b border-border-subtle">
                    <button
                      onClick={toggleAdminMode}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded transition-soft ${
                        adminModeActive
                          ? 'bg-firefly-dim/20 text-firefly-glow border border-firefly-dim/40'
                          : 'bg-bg-elevated text-text-muted border border-border-subtle hover:border-firefly-dim/40'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{adminModeActive ? '👑' : '👤'}</span>
                        <span className="text-sm font-medium">
                          {adminModeActive ? 'Admin Mode' : 'User Mode'}
                        </span>
                      </span>
                      <span className="text-xs">
                        {adminModeActive ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Admin Section */}
                {showAdminFeatures && (
                  <>
                    <div className="px-3 py-1.5 border-b border-border-subtle">
                      <div className="text-xs text-firefly-glow font-medium uppercase tracking-wide">Admin</div>
                    </div>
                    <div className="py-0.5 border-b border-border-subtle">
                      {/* Admin Dashboard - Primary Link */}
                      <button
                        onClick={() => {
                          router.push('/admin')
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-firefly-glow hover:bg-firefly-dim/10 hover:text-firefly-dim transition-soft font-medium"
                      >
                        🏠 Admin Dashboard
                      </button>

                      {/* Users & Community */}
                      <button
                        onClick={() => {
                          router.push('/admin/users')
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                      >
                        👥 User Management
                      </button>

                      {/* Content & Moderation */}
                      <button
                        onClick={() => {
                          router.push('/admin/content/reports')
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                      >
                        🛡️ Content Reports
                      </button>

                      {/* System & Analytics */}
                      <button
                        onClick={() => {
                          router.push('/admin/system/health')
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                      >
                        💚 System Health
                      </button>
                      <button
                        onClick={() => {
                          router.push('/admin/analytics')
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                      >
                        📊 Analytics
                      </button>

                      {/* Marketing Tools */}
                      <button
                        onClick={() => {
                          router.push('/marketing-genius')
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                      >
                        🧠 Marketing Intelligence
                      </button>
                      <button
                        onClick={() => {
                          router.push('/blog-video')
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                      >
                        🎥 Video Builder
                      </button>
                    </div>
                  </>
                )}

                <div className="py-0.5">
                  {isBetaTester && (
                    <button
                      onClick={() => {
                        router.push('/beta-invites')
                        setIsDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 transition-soft font-medium"
                    >
                      📧 Invite Friends to Beta
                    </button>
                  )}
                  <button
                    onClick={() => {
                      router.push('/settings/imports')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                  >
                    📥 Import Memories
                  </button>
                  {/* Settings Menu with Submenu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSettingsSubmenuOpen(!isSettingsSubmenuOpen)}
                      className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft flex items-center justify-between"
                    >
                      <span>⚙️ Settings</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${isSettingsSubmenuOpen ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Settings Submenu */}
                    {isSettingsSubmenuOpen && (
                      <div className="pl-4 bg-bg-darker/50">
                        <button
                          onClick={() => {
                            router.push('/spark-collections')
                            setIsDropdownOpen(false)
                            setIsSettingsSubmenuOpen(false)
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                        >
                          ✨ Upload Prompts
                        </button>
                        <button
                          onClick={() => {
                            router.push('/billing')
                            setIsDropdownOpen(false)
                            setIsSettingsSubmenuOpen(false)
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                        >
                          💳 Manage Plan
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsFeedbackOpen(true)
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
                  >
                    🐛 Report an Issue
                  </button>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/login' })
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-border-subtle hover:text-text-soft transition-soft"
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
                  className="min-h-[44px] px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft flex items-center"
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

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <div className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-bg-dark border-r border-border-subtle shadow-2xl overflow-y-auto">
          <div className="px-4 py-6">
            {/* Close button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="text-firefly-glow text-xl">✦</span>
                <h2 className="text-lg font-light text-text-soft">Menu</h2>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-muted hover:text-firefly-glow transition-soft min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

          {/* Menu Items - Features Only */}
          <nav className="flex flex-col gap-2">
            {/* Beta Tester Invite - Prominent */}
            {isBetaTester && (
              <Link
                href="/admin/users/beta-invites"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-blue-300 hover:text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-soft py-3 px-3 rounded-lg mb-2"
                aria-label="Invite friends to beta"
              >
                📧 Invite Friends to Beta
              </Link>
            )}

            <Link
              href="/grove"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-light text-text-soft hover:text-firefly-glow transition-soft py-2.5 border-b border-border-subtle"
            >
              My Grove
            </Link>
            <Link
              href="/nest"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-light text-text-soft hover:text-firefly-dim transition-soft py-2.5 border-b border-border-subtle"
            >
              🪺 My Nest
            </Link>
            <Link
              href="/open-grove"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-light text-text-soft hover:text-[var(--legacy-glow)] transition-soft py-2.5 border-b border-border-subtle"
            >
              🕯️ Open Grove
            </Link>
            <Link
              href="/settings/imports"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-light text-text-soft hover:text-firefly-glow transition-soft py-2.5 border-b border-border-subtle"
            >
              📥 Import Memories
            </Link>

            {/* Admin Mode Toggle - Mobile */}
            {isAdmin && (
              <div className="border-b border-border-subtle pb-3 mb-2">
                <button
                  onClick={toggleAdminMode}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-soft ${
                    adminModeActive
                      ? 'bg-firefly-dim/20 text-firefly-glow border-2 border-firefly-dim/40'
                      : 'bg-bg-elevated text-text-muted border-2 border-border-subtle'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{adminModeActive ? '👑' : '👤'}</span>
                    <span className="text-base font-medium">
                      {adminModeActive ? 'Admin Mode' : 'User Mode'}
                    </span>
                  </span>
                  <span className="text-sm font-bold">
                    {adminModeActive ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            )}

            {/* Admin Section - Mobile */}
            {showAdminFeatures && (
              <>
                <div className="border-b border-border-subtle pb-2">
                  <div className="text-xs text-firefly-glow mb-2 px-2 uppercase tracking-wide font-medium">Admin</div>
                  {/* Admin Dashboard - Primary Link */}
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-medium text-firefly-glow hover:text-firefly-dim transition-soft py-2 px-2 rounded hover:bg-firefly-dim/10"
                  >
                    🏠 Admin Dashboard
                  </Link>
                  {/* Users & Community */}
                  <Link
                    href="/admin/users"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                  >
                    👥 User Management
                  </Link>
                  {/* Content & Moderation */}
                  <Link
                    href="/admin/content/reports"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                  >
                    🛡️ Content Reports
                  </Link>
                  {/* System & Analytics */}
                  <Link
                    href="/admin/system/health"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                  >
                    💚 System Health
                  </Link>
                  <Link
                    href="/admin/analytics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                  >
                    📊 Analytics
                  </Link>
                  {/* Marketing Tools */}
                  <Link
                    href="/marketing-genius"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                  >
                    🧠 Marketing Intelligence
                  </Link>
                  <Link
                    href="/blog-video"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                  >
                    🎥 Video Builder
                  </Link>
                  <Link
                    href="/admin/tutorials"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                  >
                    🎥 Tutorial Videos
                  </Link>
                </div>
              </>
            )}

            {/* Grove Exchange Products - Only Built Features */}
            <div className="border-b border-border-subtle pb-2">
              <div className="text-xs text-text-muted mb-2 px-2 uppercase tracking-wide">Grove Exchange</div>
              <Link
                href="/video-collage"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
              >
                🎬 Memorial Videos
              </Link>
              <Link
                href="/soundart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
              >
                🎵 Sound Wave Art
              </Link>
              <Link
                href="/forever-kit"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
              >
                📦 Forever Kit
              </Link>
              <Link
                href="/cards"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
              >
                💌 Greeting Cards
              </Link>
              <Link
                href="/grove-exchange"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-light text-text-muted hover:text-text-soft transition-soft py-2 px-2 mt-1"
              >
                View All Products →
              </Link>
            </div>

            <Link
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-light text-text-soft hover:text-firefly-glow transition-soft py-2.5 border-b border-border-subtle"
            >
              📖 Blog
            </Link>

            {/* Settings Section - Mobile */}
            {userName && (
              <div className="border-b border-border-subtle pb-2">
                <div className="text-xs text-text-muted mb-2 px-2 uppercase tracking-wide">Settings</div>
                <Link
                  href="/spark-collections"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                >
                  ✨ Upload Prompts
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-light text-text-soft hover:text-firefly-glow transition-soft py-2 px-2 rounded hover:bg-border-subtle/30"
                >
                  💳 Manage Plan
                </Link>
              </div>
            )}

            {!userName && (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-light text-firefly-glow hover:text-firefly-bright transition-soft py-2.5"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* User info at bottom if logged in */}
          {userName && groveInfo && (
            <div className="mt-8 pt-6 border-t border-border-subtle">
              <div className="text-text-soft font-medium mb-2">{userName}</div>
              <div className="text-sm text-text-muted space-y-1">
                <div>Plan: <span className="text-firefly-glow">{groveInfo.planName}</span></div>
                <div>Trees: <span className="text-text-soft">{groveInfo.treeCount} / {groveInfo.treeLimit}</span></div>
              </div>
            </div>
          )}
          </div>
        </div>
      </>
    )}
    </>
  )
}

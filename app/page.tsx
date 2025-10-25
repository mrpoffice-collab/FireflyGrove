'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AnimatePresence } from 'framer-motion'
import StoryModal from '@/components/StoryModal'
import Header from '@/components/Header'

interface Stats {
  groves: number
  trees: number
  branches: number
  memories: number
}

export default function HomePage() {
  const { data: session } = useSession()
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const [stats, setStats] = useState<Stats | null>(null)
  const [showStory, setShowStory] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err))
  }, [])

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0'
    return num.toLocaleString()
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with email service (Resend, ConvertKit, etc.)
    console.log('Email submitted:', email)
    setSubscribed(true)
    setTimeout(() => {
      setSubscribed(false)
      setEmail('')
    }, 3000)
  }

  return (
    <div className="min-h-screen">
      {session && <Header userName={session.user?.name || ''} />}

      <div className="flex items-center justify-center px-4" style={{ minHeight: session ? 'calc(100vh - 73px)' : '100vh' }}>
        <div className="max-w-2xl text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl font-light text-firefly-glow">
              Firefly Grove
            </h1>
            {isDemoMode && (
              <span className="px-3 py-1 text-xs rounded-full bg-firefly-dim/20 text-firefly-glow border border-firefly-dim/30">
                BETA
              </span>
            )}
          </div>
          <p className="text-xl md:text-2xl text-text-soft mb-2">
            Preserve Your Family Legacy Forever
          </p>
          <p className="text-lg text-text-muted mb-6">
            Create memorial tributes, sound wave art, and organize memories beautifully.
            <br />Where memories take root and keep growing.
          </p>

          {stats && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-text-muted text-sm">
              <span className="flex items-center gap-1">
                🌳 <span className="text-text-soft font-medium">{formatNumber(stats.groves)}</span> Groves
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                🌲 <span className="text-text-soft font-medium">{formatNumber(stats.trees)}</span> Trees
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                🌿 <span className="text-text-soft font-medium">{formatNumber(stats.branches)}</span> Branches
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                ✨ <span className="text-text-soft font-medium">{formatNumber(stats.memories)}</span> Memories
              </span>
            </div>
          )}
        </div>

        <div className="mb-12">
          <div className="inline-block p-8">
            <svg width="200" height="150" viewBox="0 0 200 150">
              <circle cx="50" cy="50" r="8" fill="#ffd966" opacity="0.8">
                <animate
                  attributeName="opacity"
                  values="0.4;1;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="100" cy="70" r="6" fill="#ffd966" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.3;0.9;0.3"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="150" cy="50" r="10" fill="#ffd966" opacity="0.9">
                <animate
                  attributeName="opacity"
                  values="0.5;1;0.5"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="80" cy="100" r="7" fill="#ffd966" opacity="0.7">
                <animate
                  attributeName="opacity"
                  values="0.4;0.95;0.4"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="130" cy="110" r="9" fill="#ffd966" opacity="0.75">
                <animate
                  attributeName="opacity"
                  values="0.45;1;0.45"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setShowStory(true)}
            className="w-full max-w-xs mx-auto mb-4 py-3 bg-gradient-to-r from-firefly-dim/30 to-firefly-glow/30 hover:from-firefly-dim/50 hover:to-firefly-glow/50 text-firefly-glow border border-firefly-dim/50 rounded-lg font-medium transition-soft flex items-center justify-center gap-2"
          >
            ✨ Discover Our Story
          </button>

          {!session && (
            <>
              {/* Email Capture Form */}
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-6">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim placeholder:text-text-muted"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft whitespace-nowrap"
                  >
                    Get Started
                  </button>
                </div>
                {subscribed && (
                  <p className="text-green-400 text-sm mt-2 text-center">✓ Thanks! We'll be in touch soon.</p>
                )}
                <p className="text-text-muted text-xs mt-2 text-center">
                  Free forever plan • No credit card required
                </p>
              </form>

              <div className="flex gap-3 max-w-xs mx-auto">
                <Link
                  href="/signup"
                  className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft text-center"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="flex-1 py-3 bg-border-subtle hover:bg-text-muted/20 text-text-soft border border-border-subtle rounded-lg font-medium transition-soft text-center"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}

          {session && (
            <Link
              href="/grove"
              className="block w-full max-w-xs mx-auto py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
            >
              Go to My Grove →
            </Link>
          )}
          <Link
            href="/open-grove"
            className="block w-full max-w-xs mx-auto py-3 bg-border-subtle hover:bg-text-muted/20 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/30 rounded-lg font-medium transition-soft"
          >
            🕯️ Browse Open Grove
          </Link>
          <Link
            href="/memorial/create"
            className="block w-full max-w-xs mx-auto py-3 bg-[var(--legacy-amber)]/20 hover:bg-[var(--legacy-amber)]/30 text-[var(--legacy-text)] border border-[var(--legacy-amber)]/30 rounded-lg font-medium transition-soft"
          >
            Create a Free Memorial
          </Link>
          <p className="text-text-muted text-sm">
            A quiet place to remember what matters most
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <div className="text-firefly-glow text-2xl mb-2">🌿</div>
            <h3 className="text-text-soft font-medium mb-2">Branches</h3>
            <p className="text-text-muted text-sm">
              Each person or relationship becomes a branch in your grove.
            </p>
          </div>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <div className="text-firefly-glow text-2xl mb-2">✦</div>
            <h3 className="text-text-soft font-medium mb-2">Memories</h3>
            <p className="text-text-muted text-sm">
              Small moments that glow like fireflies in the night.
            </p>
          </div>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <div className="text-firefly-glow text-2xl mb-2">🔒</div>
            <h3 className="text-text-soft font-medium mb-2">Legacy</h3>
            <p className="text-text-muted text-sm">
              Share memories with loved ones when the time is right.
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Story Modal */}
      <AnimatePresence>
        {showStory && <StoryModal onClose={() => setShowStory(false)} />}
      </AnimatePresence>
    </div>
  )
}

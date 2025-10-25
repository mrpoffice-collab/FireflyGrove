'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function SoundArtPage() {
  const { data: session } = useSession()
  const [started, setStarted] = useState(false)

  if (started) {
    return <div>Builder coming soon...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-dark to-bg-darker">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-soft">
              <span className="text-firefly-glow text-2xl">✦</span>
              <h1 className="text-xl font-light text-text-soft">Firefly Grove</h1>
            </Link>
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-text-muted text-sm">
                  {session.user?.name}
                </span>
                <Link
                  href="/grove"
                  className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft"
                >
                  My Grove
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-text-muted hover:text-text-soft text-sm transition-soft"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <div className="mb-8">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-5xl font-light text-firefly-glow mb-4">
              Sound Wave Art
            </h2>
            <p className="text-xl text-text-soft mb-2">
              Turn your voice, music, or special moments into beautiful scannable art
            </p>
            <p className="text-text-muted">
              Perfect for gifts, memorials, and keepsakes
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-text-soft font-medium mb-2">Artistic Styles</h3>
              <p className="text-text-muted text-sm">
                Modern, minimal, vintage, neon - customize your waveform art
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-text-soft font-medium mb-2">Scannable QR Code</h3>
              <p className="text-text-muted text-sm">
                Scan to instantly play your audio - works with any phone camera
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">🖼️</div>
              <h3 className="text-text-soft font-medium mb-2">Print-Ready</h3>
              <p className="text-text-muted text-sm">
                Download high-res artwork for mugs, canv ases, blankets, and more
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">💝</div>
              <h3 className="text-text-soft font-medium mb-2">Perfect Gifts</h3>
              <p className="text-text-muted text-sm">
                "I love you," wedding vows, baby's first words, favorite song
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">🕊️</div>
              <h3 className="text-text-soft font-medium mb-2">Memorial Art</h3>
              <p className="text-text-muted text-sm">
                Preserve a loved one's voice, laughter, or favorite song forever
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-text-soft font-medium mb-2">Instant Creation</h3>
              <p className="text-text-muted text-sm">
                Upload audio, customize design, download in minutes
              </p>
            </div>
          </div>

          {/* Example Use Cases */}
          <div className="bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim/30 rounded-lg p-8 mb-12">
            <h3 className="text-2xl font-light text-firefly-glow mb-6">Popular Ideas</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left text-text-muted text-sm">
              <div className="flex items-start gap-2">
                <span className="text-firefly-glow">•</span>
                <span>"I love you" in your voice on a necklace</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-firefly-glow">•</span>
                <span>Wedding vows as wall art</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-firefly-glow">•</span>
                <span>Baby's heartbeat on a blanket</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-firefly-glow">•</span>
                <span>Loved one's laughter as a keepsake</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-firefly-glow">•</span>
                <span>Your song together on canvas</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-firefly-glow">•</span>
                <span>Pet's bark or purr on a mug</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setStarted(true)}
            className="px-12 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft shadow-lg"
          >
            Create Your Sound Art — Free
          </button>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-border-subtle">
            <div className="flex flex-wrap items-center justify-center gap-6 text-text-muted text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>No Sign-up Required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>High-Resolution Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Scannable QR Codes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Private & Secure</span>
              </div>
            </div>
          </div>

          {/* Firefly Grove CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim/30 rounded-lg">
            <p className="text-text-soft mb-4">
              Looking to preserve memories forever?
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-firefly-dim/20 hover:bg-firefly-dim/40 text-firefly-glow border border-firefly-dim/50 rounded-lg font-medium transition-soft"
            >
              Explore Firefly Grove →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import VideoCollageBuilder from '@/components/VideoCollageBuilder'

export default function VideoCollagePage() {
  const [started, setStarted] = useState(false)

  if (started) {
    return <VideoCollageBuilder />
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
            <Link
              href="/login"
              className="text-text-muted hover:text-text-soft text-sm transition-soft"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-5xl font-light text-firefly-glow mb-4">
              Memorial Video Maker
            </h2>
            <p className="text-xl text-text-soft mb-2">
              Create beautiful tribute videos for memorial services
            </p>
            <p className="text-text-muted">
              Completely free. No watermarks. Professional quality.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">🎬</div>
              <h3 className="text-text-soft font-medium mb-2">Professional Transitions</h3>
              <p className="text-text-muted text-sm">
                Fade, slide, zoom, Ken Burns effect, and more
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-text-soft font-medium mb-2">Beautiful Filters</h3>
              <p className="text-text-muted text-sm">
                Vintage, sepia, B&W, and cinematic color grading
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-text-soft font-medium mb-2">Custom Text</h3>
              <p className="text-text-muted text-sm">
                Add names, dates, quotes, and heartfelt messages
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">🎵</div>
              <h3 className="text-text-soft font-medium mb-2">Your Music</h3>
              <p className="text-text-muted text-sm">
                Upload your song or choose from gentle piano melodies
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-text-soft font-medium mb-2">Instant Preview</h3>
              <p className="text-text-muted text-sm">
                See changes in real-time as you build your video
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-4xl mb-3">💾</div>
              <h3 className="text-text-soft font-medium mb-2">Easy Download</h3>
              <p className="text-text-muted text-sm">
                Export high-quality video ready for any screen
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setStarted(true)}
            className="px-12 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft shadow-lg"
          >
            Create Your Video — Free Forever
          </button>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-border-subtle">
            <div className="flex flex-wrap items-center justify-center gap-6 text-text-muted text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>No Watermarks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>No Sign-up Required</span>
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
              Looking for a permanent home for these memories?
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

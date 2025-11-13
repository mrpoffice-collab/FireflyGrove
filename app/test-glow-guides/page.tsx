'use client'

import { useState } from 'react'
import AudioSparksGlowGuide from '@/components/glow-guides/AudioSparksGlowGuide'
import NestGlowGuide from '@/components/glow-guides/NestGlowGuide'
import FireflyBurstsGlowGuide from '@/components/glow-guides/FireflyBurstsGlowGuide'
import MemoryThreadingGlowGuide from '@/components/glow-guides/MemoryThreadingGlowGuide'
import StorySparksGlowGuide from '@/components/glow-guides/StorySparksGlowGuide'

type GuideType = 'audio-sparks' | 'nest' | 'firefly-bursts' | 'memory-threading' | 'story-sparks' | null

export default function TestGlowGuidesPage() {
  const [activeGuide, setActiveGuide] = useState<GuideType>(null)

  const guides = [
    { id: 'audio-sparks', name: 'Audio Sparks', icon: '⚡' },
    { id: 'nest', name: 'The Nest', icon: '🪺' },
    { id: 'firefly-bursts', name: 'Firefly Bursts', icon: '✨' },
    { id: 'memory-threading', name: 'Memory Threading', icon: '🧵' },
    { id: 'story-sparks', name: 'Story Sparks', icon: '💭' },
  ]

  return (
    <div className="min-h-screen bg-bg-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-firefly-glow mb-2">
          Glow Guide Background Test
        </h1>
        <p className="text-text-muted mb-8">
          Click any guide below to test the new solid background
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setActiveGuide(guide.id as GuideType)}
              className="bg-bg-elevated border border-border-subtle hover:border-firefly-dim rounded-lg p-6 text-left transition-soft"
            >
              <div className="text-4xl mb-3">{guide.icon}</div>
              <h3 className="text-xl text-text-soft font-medium">{guide.name}</h3>
              <p className="text-text-muted text-sm mt-2">Click to preview</p>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-bg-elevated border border-border-subtle rounded-lg">
          <h3 className="text-firefly-glow font-medium mb-2">Testing Notes:</h3>
          <ul className="text-text-muted text-sm space-y-1">
            <li>✓ bg-elevated is now defined as #141a24 (solid dark color)</li>
            <li>✓ All Glow Guides use bg-bg-elevated for their background</li>
            <li>✓ Text should be clearly readable on the solid background</li>
          </ul>
        </div>
      </div>

      {/* Render active guide */}
      {activeGuide === 'audio-sparks' && (
        <AudioSparksGlowGuide onClose={() => setActiveGuide(null)} />
      )}
      {activeGuide === 'nest' && (
        <NestGlowGuide onClose={() => setActiveGuide(null)} />
      )}
      {activeGuide === 'firefly-bursts' && (
        <FireflyBurstsGlowGuide onClose={() => setActiveGuide(null)} />
      )}
      {activeGuide === 'memory-threading' && (
        <MemoryThreadingGlowGuide onClose={() => setActiveGuide(null)} />
      )}
      {activeGuide === 'story-sparks' && (
        <StorySparksGlowGuide onClose={() => setActiveGuide(null)} />
      )}
    </div>
  )
}

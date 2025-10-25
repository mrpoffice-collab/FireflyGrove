'use client'

import { useRef, useState } from 'react'
import FireflyParticles from '@/components/FireflyParticles'
import Link from 'next/link'

export default function FBPostPage() {
  const [isMuted, setIsMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggleMute = async () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false
        try {
          await audioRef.current.play()
        } catch (error) {
          console.log('Audio play error:', error)
        }
      } else {
        audioRef.current.muted = true
      }
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark relative overflow-hidden flex items-center justify-center">
      {/* Firefly Background */}
      <FireflyParticles count={40} />

      {/* Audio */}
      <audio ref={audioRef} loop muted>
        <source src="/audio/story-background.mp3" type="audio/mpeg" />
      </audio>

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-bg-dark/80 hover:bg-bg-dark border border-border-subtle text-text-soft hover:text-firefly-glow transition-soft"
        title={isMuted ? 'Play music' : 'Mute music'}
      >
        {isMuted ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-firefly-glow mb-4 leading-tight">
            🌿
            <br />
            My Heart in a Grove of Light
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-lg md:text-xl text-text-soft mb-12 leading-relaxed">
          <p className="font-light">
            This might be one of the most meaningful things I've ever made —{' '}
            <span className="text-firefly-glow">right up there with being a mom, a nana, and a foster mom.</span>
          </p>

          <p className="text-xl md:text-2xl font-light text-firefly-glow">
            It's called Firefly Grove
          </p>

          <p>
            A place where memories take root and light never fades.
          </p>

          <p>
            You plant a tree for someone you love — past or present — and each memory you add becomes a tiny firefly that glows in their light.
          </p>

          <div className="flex items-center justify-center gap-4 text-firefly-dim my-8">
            <span className="text-2xl">✦</span>
            <span className="text-lg">Gentle</span>
            <span className="text-2xl">•</span>
            <span className="text-lg">Private</span>
            <span className="text-2xl">•</span>
            <span className="text-lg">Alive</span>
            <span className="text-2xl">✦</span>
          </div>

          <p>
            We have a small group of early caretakers testing it right now, and I would love to open that circle just a little wider — especially to the people who know me best.
          </p>

          <p className="text-text-muted text-base">
            Take your time. There's soft music, a slideshow, and a story to walk through.
          </p>

          <p className="text-text-muted text-base">
            And if it stirs something in you… maybe plant a tree of your own.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft shadow-lg hover:shadow-firefly-glow/50"
          >
            Enter Firefly Grove
          </Link>
        </div>

        {/* Closing */}
        <p className="text-2xl md:text-3xl font-light text-firefly-glow leading-relaxed">
          Because every story deserves a light
          <br />
          — even if it shines twice 💫
        </p>

        {/* URL */}
        <p className="mt-8 text-text-muted text-sm">
          fireflygrove.app
        </p>
      </div>
    </div>
  )
}

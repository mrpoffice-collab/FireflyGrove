'use client'

import { useRef, useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import FireflyParticles from '@/components/FireflyParticles'
import Link from 'next/link'

export default function FBPostPage() {
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Signup form state
  const [showSignup, setShowSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Auto-play music on load
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = false
      audioRef.current.play().catch(error => {
        console.log('Auto-play prevented:', error)
        // If auto-play is blocked, mute it
        setIsMuted(true)
      })
    }
  }, [])

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create the beta tester account
      const res = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)

        // Automatically sign them in
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (signInResult?.ok) {
          // Redirect to grove after a brief success message
          setTimeout(() => {
            router.push('/grove')
          }, 1500)
        } else {
          // Account created but auto-login failed
          setError('Account created! Please log in manually.')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
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
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 md:py-12 text-center">
        {/* Title */}
        <div className="mb-6 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-light text-firefly-glow mb-3 md:mb-4 leading-tight">
            🌿
            <br />
            My Heart in a Grove of Light
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-4 md:space-y-6 text-base md:text-xl text-text-soft mb-8 md:mb-12 leading-relaxed">
          <p className="font-light">
            This might be one of the most meaningful things I've ever made —{' '}
            <span className="text-firefly-glow">right up there with being a mom, a nana, and a foster mom.</span>
          </p>

          <p className="text-lg md:text-2xl font-light text-firefly-glow">
            It's called Firefly Grove
          </p>

          <p>
            A place where memories take root and light never fades.
          </p>

          <p>
            You plant a tree for someone you love — past or present — and each memory you add becomes a tiny firefly that glows in their light.
          </p>

          <div className="flex items-center justify-center gap-3 md:gap-4 text-firefly-dim my-6 md:my-8">
            <span className="text-xl md:text-2xl">✦</span>
            <span className="text-base md:text-lg">Gentle</span>
            <span className="text-xl md:text-2xl">•</span>
            <span className="text-base md:text-lg">Private</span>
            <span className="text-xl md:text-2xl">•</span>
            <span className="text-base md:text-lg">Alive</span>
            <span className="text-xl md:text-2xl">✦</span>
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

        {/* CTA Section */}
        <div className="mb-8 md:mb-12">
          {!showSignup ? (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft shadow-lg hover:shadow-firefly-glow/50"
              >
                Enter Firefly Grove
              </Link>
              <button
                onClick={() => setShowSignup(true)}
                className="px-8 py-4 bg-bg-dark hover:bg-border-subtle border-2 border-firefly-dim hover:border-firefly-glow text-firefly-dim hover:text-firefly-glow rounded-lg font-medium text-lg transition-soft"
              >
                Become a Beta Tester
              </button>
            </div>
          ) : (
            <div className="bg-bg-dark/50 border border-firefly-dim/30 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-light text-firefly-glow mb-4">Join as a Beta Tester</h3>
              <p className="text-text-muted text-sm mb-6">
                Get immediate access to Firefly Grove. No waiting, no approval needed.
              </p>

              {success ? (
                <div className="bg-firefly-dim/20 border border-firefly-glow/50 rounded p-4 text-center">
                  <p className="text-firefly-glow font-medium mb-2">✨ Welcome to Firefly Grove!</p>
                  <p className="text-text-muted text-sm">Redirecting you to your grove...</p>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-soft focus:outline-none focus:border-firefly-dim/50 transition-soft"
                      placeholder="Your name"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-soft focus:outline-none focus:border-firefly-dim/50 transition-soft"
                      placeholder="your@email.com"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-soft focus:outline-none focus:border-firefly-dim/50 transition-soft"
                      placeholder="At least 6 characters"
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating Account...' : 'Create Beta Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSignup(false)}
                      disabled={loading}
                      className="px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-muted rounded font-medium transition-soft"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Closing */}
        <p className="text-xl md:text-3xl font-light text-firefly-glow leading-relaxed">
          Because every story deserves a light
          <br />
          — even if it shines twice 💫
        </p>

        {/* URL */}
        <p className="mt-6 md:mt-8 text-text-muted text-sm">
          fireflygrove.app
        </p>
      </div>
    </div>
  )
}

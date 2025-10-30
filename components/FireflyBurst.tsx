'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Memory {
  id: string
  text: string
  mediaUrl?: string | null
  audioUrl?: string | null
  videoUrl?: string | null
  author: {
    id: string
    name: string
    email: string
  }
  branch: {
    id: string
    title: string
  }
  createdAt: string
}

interface FireflyBurstProps {
  memories: Memory[]
  burstId: string
  onClose: () => void
  onViewNext?: () => void
}

export default function FireflyBurst({ memories, burstId, onClose, onViewNext }: FireflyBurstProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true) // Default to ON
  const [isPaused, setIsPaused] = useState(false)
  const [audio] = useState(() => {
    if (typeof window !== 'undefined') {
      const bgAudio = new Audio('/sounds/firefly-ambient.mp3')
      bgAudio.loop = true
      bgAudio.volume = 0.3
      return bgAudio
    }
    return null
  })

  const currentMemory = memories[currentIndex]

  // Calculate duration based on text length
  const calculateDuration = (memory: Memory) => {
    const textLength = memory.text.length
    const lines = Math.ceil(textLength / 80) // Approx 80 chars per line

    // Base: 3 seconds, +1 second per line, min 4s, max 12s
    const duration = Math.min(Math.max(3000 + (lines * 1000), 4000), 12000)
    return duration
  }

  // Duck background audio when memory has audio
  useEffect(() => {
    if (!audio) return

    if (currentMemory.audioUrl && audioEnabled) {
      // Duck to 10% volume when memory audio is present
      audio.volume = 0.1
    } else if (audioEnabled) {
      // Restore to 30% when no memory audio
      audio.volume = 0.3
    }
  }, [currentMemory.audioUrl, audioEnabled, audio])

  useEffect(() => {
    // Animation entry effect - longer for smooth fade
    const timer = setTimeout(() => setIsAnimating(false), 600)
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Auto-advance timer
  useEffect(() => {
    if (isPaused || isAnimating) return

    const duration = calculateDuration(currentMemory)
    const timer = setTimeout(() => {
      if (currentIndex < memories.length - 1) {
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1)
        }, 500)
      } else {
        // Reached the end, mark as viewed and close after a pause
        setTimeout(() => {
          markAsViewed()
          fadeOutAudio(() => onClose())
        }, 2000)
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [currentIndex, isPaused, isAnimating, currentMemory, memories.length])

  // Audio management
  useEffect(() => {
    if (audio && audioEnabled) {
      audio.volume = 0.3 // Reset volume when enabling
      audio.play().catch((err) => console.log('Audio autoplay prevented:', err))
    }

    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [audio, audioEnabled])

  // Fade out audio smoothly
  const fadeOutAudio = (callback?: () => void) => {
    if (!audio) {
      callback?.()
      return
    }

    const fadeInterval = 50 // Update every 50ms
    const fadeDuration = 1000 // 1 second fade
    const steps = fadeDuration / fadeInterval
    const volumeStep = audio.volume / steps

    const fade = setInterval(() => {
      if (audio.volume > volumeStep) {
        audio.volume = Math.max(0, audio.volume - volumeStep)
      } else {
        audio.volume = 0
        audio.pause()
        clearInterval(fade)
        callback?.()
      }
    }, fadeInterval)
  }

  const toggleAudio = () => {
    if (!audio) return

    if (audioEnabled) {
      audio.pause()
      setAudioEnabled(false)
    } else {
      audio.play().catch((err) => console.log('Audio play failed:', err))
      setAudioEnabled(true)
    }
  }

  const handleNext = () => {
    if (currentIndex < memories.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
      }, 500)
    } else {
      // Reached the end, mark as viewed and close
      markAsViewed()
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsPaused(true) // Pause auto-advance when manually navigating
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1)
      }, 500)
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const markAsViewed = async () => {
    try {
      await fetch('/api/firefly-burst/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ burstId }),
      })
    } catch (error) {
      console.error('Failed to mark burst as viewed:', error)
    }
  }

  const handleViewBranch = () => {
    router.push(`/branch/${currentMemory.branch.id}`)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div className="fixed inset-0 bg-bg-darker/95 z-50 flex items-center justify-center p-4">
      {/* Firefly particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-firefly-glow rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        {/* Pause/Play Toggle */}
        <button
          onClick={togglePause}
          className="text-text-muted hover:text-firefly-glow transition-soft"
          title={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
        >
          {isPaused ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className="text-text-muted hover:text-firefly-glow transition-soft"
          title={audioEnabled ? 'Mute music' : 'Play music'}
        >
          {audioEnabled ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        {/* Close button */}
        <button
          onClick={() => {
            markAsViewed()
            fadeOutAudio(() => onClose())
          }}
          className="text-text-muted hover:text-text-soft transition-soft"
          title="Close"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-2xl w-full relative">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-light text-firefly-glow mb-2 animate-glow">
            ✨ Firefly Burst
          </h2>
          <p className="text-text-muted">
            {memories.length} {memories.length === 1 ? 'firefly' : 'fireflies'} are glowing tonight
          </p>
        </div>

        {/* Memory card */}
        <div
          className={`bg-bg-elevated border border-firefly-dim/30 rounded-lg overflow-hidden transition-all duration-700 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Media */}
          {currentMemory.mediaUrl && (
            <div className="relative w-full h-80 bg-bg-darker overflow-hidden">
              <img
                key={currentMemory.id}
                src={currentMemory.mediaUrl}
                alt="Memory"
                className={`w-full h-full object-cover transition-opacity duration-700 ${
                  isAnimating ? 'opacity-0' : 'opacity-100'
                }`}
              />
              {/* Glowing overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated/80 to-transparent pointer-events-none" />
            </div>
          )}

          {currentMemory.audioUrl && !currentMemory.mediaUrl && (
            <div className="p-8 bg-bg-darker flex items-center justify-center">
              <audio controls className="w-full max-w-md">
                <source src={currentMemory.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Text-only memory - show decorative background */}
          {!currentMemory.mediaUrl && !currentMemory.audioUrl && (
            <div className="relative w-full h-64 bg-gradient-to-br from-firefly-dim/20 via-bg-darker to-bg-darker flex items-center justify-center overflow-hidden">
              {/* Floating firefly decoration */}
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-firefly-glow rounded-full animate-float"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${30 + (i % 3) * 20}%`,
                      animationDelay: `${i * 0.8}s`,
                      animationDuration: `${4 + i * 0.5}s`,
                      opacity: 0.3,
                    }}
                  />
                ))}
              </div>
              <div className="text-6xl opacity-20">✨</div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Branch title and edit button */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleViewBranch}
                className="text-firefly-glow hover:text-firefly-bright text-sm transition-soft inline-flex items-center gap-1"
              >
                <span>From {currentMemory.branch.title}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Edit button */}
              <button
                onClick={handleViewBranch}
                className="text-text-muted hover:text-firefly-glow text-xs transition-soft inline-flex items-center gap-1"
                title="Edit this memory"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit</span>
              </button>
            </div>

            {/* Memory text */}
            <p className="text-text-soft text-lg leading-relaxed mb-4">
              {currentMemory.text}
            </p>

            {/* Author and date */}
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>By {currentMemory.author.name}</span>
              <span>{formatDate(currentMemory.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-text-soft hover:text-firefly-glow transition-soft disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          {/* Progress indicator - clickable dots */}
          <div className="flex items-center gap-2">
            {memories.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index !== currentIndex) {
                    setIsPaused(true) // Pause auto-advance when manually navigating
                    setIsAnimating(true)
                    setTimeout(() => setCurrentIndex(index), 500)
                  }
                }}
                className={`rounded-full transition-all duration-300 cursor-pointer hover:scale-110 ${
                  index === currentIndex
                    ? 'bg-firefly-glow w-8 h-2'
                    : index < currentIndex
                    ? 'bg-firefly-dim w-2 h-2'
                    : 'bg-border-subtle w-2 h-2'
                }`}
                title={`Go to memory ${index + 1}`}
              />
            ))}
          </div>

          {/* Done button */}
          <button
            onClick={() => {
              markAsViewed()
              fadeOutAudio(() => onClose())
            }}
            className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
          >
            Done
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          10%, 90% {
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 217, 102, 0.5);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 217, 102, 0.8);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

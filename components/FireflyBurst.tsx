'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MemoryText from './MemoryText'

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
  onSnooze?: () => void
}

export default function FireflyBurst({ memories, burstId, onClose, onViewNext, onSnooze }: FireflyBurstProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true) // Default to ON
  const [isPaused, setIsPaused] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const memoryAudioRef = useRef<HTMLAudioElement>(null)
  const memoryAudioWithImageRef = useRef<HTMLAudioElement>(null)
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

  // Reset image loading state when memory changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [currentIndex])

  // Auto-play memory audio when memory changes
  useEffect(() => {
    // Play audio for memory with image
    if (currentMemory.audioUrl && currentMemory.mediaUrl && memoryAudioWithImageRef.current) {
      memoryAudioWithImageRef.current.play().catch(err =>
        console.log('Memory audio autoplay prevented:', err)
      )
    }

    // Play audio for audio-only memory
    if (currentMemory.audioUrl && !currentMemory.mediaUrl && memoryAudioRef.current) {
      memoryAudioRef.current.play().catch(err =>
        console.log('Memory audio autoplay prevented:', err)
      )
    }

    // Cleanup: pause audio when memory changes
    return () => {
      if (memoryAudioWithImageRef.current) {
        memoryAudioWithImageRef.current.pause()
        memoryAudioWithImageRef.current.currentTime = 0
      }
      if (memoryAudioRef.current) {
        memoryAudioRef.current.pause()
        memoryAudioRef.current.currentTime = 0
      }
    }
  }, [currentMemory.audioUrl, currentMemory.mediaUrl, currentIndex])

  // Calculate duration based on text length and media presence
  const calculateDuration = (memory: Memory) => {
    const textLength = memory.text.length
    const lines = Math.ceil(textLength / 80) // Approx 80 chars per line

    // If memory has image/video, add extra time to view both text and media
    const hasMedia = memory.mediaUrl || memory.videoUrl

    // Based on actual reading speed: 6 seconds per line
    const baseTime = hasMedia ? 8000 : 6000 // 8s base for media (time to view image), 6s for text-only
    const extraTime = 6000 // 6 seconds per line (actual measured reading speed)

    // Calculate duration: base + (lines * 6s per line), min 10s for media / 8s for text, max 40s
    const minTime = hasMedia ? 10000 : 8000
    const maxTime = 40000 // Increased max to accommodate longer memories
    const duration = Math.min(Math.max(baseTime + (lines * extraTime), minTime), maxTime)

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
    const isLastMemory = currentIndex === memories.length - 1

    // Start fading audio on last memory
    if (isLastMemory && audio && audioEnabled) {
      const fadeInterval = 50 // Update every 50ms
      const steps = duration / fadeInterval
      const volumeStep = audio.volume / steps
      const startVolume = audio.volume

      const fadeTimer = setInterval(() => {
        if (audio.volume > volumeStep) {
          audio.volume = Math.max(0, audio.volume - volumeStep)
        } else {
          audio.volume = 0
          clearInterval(fadeTimer)
        }
      }, fadeInterval)

      // Clean up fade if user navigates away
      return () => {
        clearInterval(fadeTimer)
        if (audio && audioEnabled) {
          audio.volume = startVolume // Restore if interrupted
        }
      }
    }

    const timer = setTimeout(() => {
      if (currentIndex < memories.length - 1) {
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1)
        }, 500)
      } else {
        // Reached the end, audio already faded, close after a pause
        setTimeout(() => {
          markAsViewed()
          if (audio) {
            audio.pause()
            audio.currentTime = 0
          }
          onClose()
        }, 2000)
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [currentIndex, isPaused, isAnimating, currentMemory, memories.length, audio, audioEnabled])

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
        {/* Snooze Button */}
        {onSnooze && (
          <button
            onClick={() => {
              if (audio) {
                audio.pause()
                audio.currentTime = 0
                audio.volume = 0.3
              }
              onSnooze()
            }}
            className="text-text-muted hover:text-amber-400 transition-soft"
            title="Snooze bursts for 3 hours"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}

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

      {/* Main content - Allow scrolling for long content */}
      <div className="max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6 sticky top-0 bg-bg-darker/95 backdrop-blur-sm z-10 py-4">
          <h2 className="text-3xl font-light text-firefly-glow mb-2 animate-glow">
            ✨ Firefly Burst
          </h2>
          <p className="text-text-muted">
            {memories.length} {memories.length === 1 ? 'firefly' : 'fireflies'} are glowing tonight
          </p>
        </div>

        {/* Memory card - Dynamic sizing */}
        <div
          className={`bg-bg-elevated border border-firefly-dim/30 rounded-lg overflow-hidden transition-all duration-700 mb-6 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Media - Dynamic height based on image aspect ratio */}
          {currentMemory.mediaUrl && (
            <div className="relative w-full bg-bg-darker overflow-hidden min-h-[200px]">
              {/* Loading state */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-text-muted">
                    <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
              )}

              {/* Error state */}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-text-muted text-sm">Image unavailable</p>
                  </div>
                </div>
              )}

              {/* Image */}
              <img
                key={currentMemory.id}
                src={currentMemory.mediaUrl}
                alt="Memory"
                loading="eager"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  console.error('Failed to load image:', currentMemory.mediaUrl)
                  console.error('Image error event:', e)
                  setImageError(true)
                }}
                className={`w-full h-auto max-h-[70vh] object-contain transition-opacity duration-700 ${
                  imageLoaded && !isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  WebkitTransform: 'translateZ(0)', // Force hardware acceleration on Safari
                  WebkitBackfaceVisibility: 'hidden', // Prevent flicker on Safari
                  backfaceVisibility: 'hidden',
                }}
              />

              {/* Glowing overlay effect */}
              {imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated/80 to-transparent pointer-events-none" />
              )}
            </div>
          )}

          {currentMemory.audioUrl && !currentMemory.mediaUrl && (
            <div className="p-8 bg-bg-darker flex items-center justify-center min-h-[8rem]">
              <audio ref={memoryAudioRef} controls className="w-full max-w-md">
                <source src={currentMemory.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Text-only memory - show decorative background with dynamic height */}
          {!currentMemory.mediaUrl && !currentMemory.audioUrl && (
            <div className="relative w-full min-h-[12rem] bg-gradient-to-br from-firefly-dim/20 via-bg-darker to-bg-darker flex items-center justify-center overflow-hidden">
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

          {/* Audio player if memory has audio AND image */}
          {currentMemory.audioUrl && currentMemory.mediaUrl && (
            <div className="px-6 pt-4">
              <audio ref={memoryAudioWithImageRef} controls className="w-full">
                <source src={currentMemory.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Content - Dynamic padding and spacing */}
          <div className="p-6 space-y-4">
            {/* Branch title */}
            <button
              onClick={handleViewBranch}
              className="text-firefly-glow hover:text-firefly-bright text-sm transition-soft inline-flex items-center gap-1"
            >
              <span>From {currentMemory.branch.title}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Memory text - clickable to go to branch, with auto-sizing */}
            <div
              onClick={handleViewBranch}
              className="cursor-pointer group"
            >
              <MemoryText
                text={currentMemory.text}
                className="text-lg break-words group-hover:text-firefly-glow transition-soft"
              />
            </div>

            {/* Author and date */}
            <div className="flex items-center justify-between text-sm text-text-muted pt-2 border-t border-border-subtle">
              <span>By {currentMemory.author.name}</span>
              <span>{formatDate(currentMemory.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Navigation - Sticky at bottom */}
        <div className="sticky bottom-0 bg-bg-darker/95 backdrop-blur-sm py-4 px-4 flex items-center justify-between z-10 border-t border-border-subtle">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="min-h-[44px] min-w-[44px] px-4 py-2 text-text-soft hover:text-firefly-glow transition-soft disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Progress indicator - clickable dots */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
                className={`rounded-full transition-all duration-300 cursor-pointer hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  index === currentIndex
                    ? 'bg-firefly-glow w-8 h-2'
                    : index < currentIndex
                    ? 'bg-firefly-dim w-2 h-2'
                    : 'bg-border-subtle w-2 h-2'
                }`}
                title={`Go to memory ${index + 1}`}
                aria-label={`Go to memory ${index + 1}`}
              />
            ))}
          </div>

          {/* Done button - Mobile optimized */}
          <button
            onClick={() => {
              markAsViewed()
              // Close immediately - no audio fade delay for better mobile UX
              if (audio) {
                audio.pause()
                audio.currentTime = 0
                audio.volume = 0.3 // Reset for next time
              }
              onClose()
            }}
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-firefly-dim hover:bg-firefly-glow active:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft touch-manipulation"
            aria-label="Close Firefly Burst"
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

        /* Custom scrollbar styling */
        .max-h-\[90vh\]::-webkit-scrollbar {
          width: 8px;
        }

        .max-h-\[90vh\]::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .max-h-\[90vh\]::-webkit-scrollbar-thumb {
          background: rgba(255, 217, 102, 0.3);
          border-radius: 4px;
        }

        .max-h-\[90vh\]::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 217, 102, 0.5);
        }
      `}</style>
    </div>
  )
}

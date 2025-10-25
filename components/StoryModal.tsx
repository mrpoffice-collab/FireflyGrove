'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import FireflyParticles from './FireflyParticles'
import Link from 'next/link'

interface StorySlide {
  title: string
  content: string[]
  icon: string
}

const slides: StorySlide[] = [
  {
    title: 'Every Story Deserves a Light',
    icon: '✦',
    content: [
      'It begins quietly — as all sacred things do.',
      'You open Firefly Grove and find yourself standing in a twilight meadow, the kind of calm that hums just before dusk gives way to stars.',
      'This is your Grove — your world of memory, still young and bare, ready for its first Tree.',
    ],
  },
  {
    title: 'Planting the First Tree',
    icon: '🌳',
    content: [
      'To plant a Tree is to say:',
      '"You mattered. You still do."',
      'You add a name — a person you love. Maybe they\'re still here. Maybe they\'ve gone ahead.',
      'A sapling rises from the dark ground, slender but bright.',
      'Each Tree represents a single life — one story among the many that make up your grove.',
    ],
  },
  {
    title: 'Trees That Hold Many Hearts',
    icon: '🤲',
    content: [
      'Not every Tree must stand for one.',
      'Some Trees grow to hold gatherings — the wine club that laughed through years, the kids who grew up side by side, the friends who became family.',
      'A Tree can be a person, yes. But it can also be a circle. A season. A belonging.',
      'Your grove bends to hold what matters most to you.',
      'Because memory doesn\'t always live in one name — sometimes it lives in the spaces between us.',
    ],
  },
  {
    title: 'The Firefly',
    icon: '✨',
    content: [
      'The Firefly is not a decoration. It is a heartbeat.',
      'It carries your memory and drifts gently around the Tree, glowing warmer each time you add another piece of story.',
      'One firefly flickers like a whisper.',
      'Ten light up the grove.',
      'Hundreds turn it into a constellation — a sky you can walk through.',
    ],
  },
  {
    title: 'Inviting Others',
    icon: '🤝',
    content: [
      'Someday, another hand will reach into this digital soil — your sister, your friend, your grandchild.',
      'You\'ll send an invite, and they\'ll step into your grove.',
      'They can plant Trees of their own, add Fireflies to your branches, or even grow their own grove that connects back to yours like intertwining roots.',
      'This is how legacy spreads — not in noise or numbers, but through quiet continuity.',
    ],
  },
  {
    title: 'Legacy and Light',
    icon: '🕯️',
    content: [
      'When someone passes, their Fireflies do not vanish. They slow.',
      'They hover softly, pulsing with that eternal rhythm of was, is, will always be.',
      'Your grove becomes a living map of where you\'ve been and who you\'ve loved.',
      'It\'s not a platform. It\'s a promise.',
      'And every promise here is written in light.',
    ],
  },
  {
    title: 'Keeping What Loss Cannot Take',
    icon: '💛',
    content: [
      'Firefly Grove isn\'t about loss. It\'s about keeping what loss cannot take.',
      'Every photo, every story, every small memory keeps someone present.',
      'Your grove becomes your legacy — and someday, someone else will walk beneath its trees, surrounded by your light, and whisper:',
      '"They lived here. And they are still shining."',
    ],
  },
]

interface StoryModalProps {
  onClose: () => void
}

export default function StoryModal({ onClose }: StoryModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Start music when modal opens
  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.3 // Start at 30% volume
          audioRef.current.muted = false
          const playPromise = audioRef.current.play()

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true)
                console.log('Music started playing')
              })
              .catch((error) => {
                // Autoplay blocked - show unmute button to user
                console.log('Autoplay blocked. Click the speaker icon to play music.')
                setIsMuted(true)
                audioRef.current!.muted = true
              })
          }
        } catch (error) {
          console.log('Audio playback error:', error)
        }
      }
    }

    // Small delay to ensure modal is visible before trying to play
    const timer = setTimeout(playAudio, 300)

    return () => {
      clearTimeout(timer)
      // Stop music when modal closes
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  const toggleMute = async () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false
        if (!isPlaying) {
          try {
            await audioRef.current.play()
            setIsPlaying(true)
            console.log('Music started after unmute')
          } catch (error) {
            console.log('Failed to start playback:', error)
          }
        }
        setIsMuted(false)
      } else {
        audioRef.current.muted = true
        setIsMuted(true)
      }
    }
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const isLastSlide = currentSlide === slides.length - 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <FireflyParticles count={30} />

      {/* Background Audio */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="/audio/story-background.mp3" type="audio/mpeg" />
        <source src="/audio/story-background.ogg" type="audio/ogg" />
      </audio>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-3xl mx-4 px-8 py-12 rounded-2xl bg-gradient-to-b from-bg-dark/80 to-bg-elevated/80 backdrop-blur-xl border border-firefly-dim/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Audio control button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 left-4 text-text-muted hover:text-firefly-glow transition-soft text-2xl"
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          title={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-soft transition-soft text-2xl"
          aria-label="Close story"
        >
          ✕
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-firefly-glow'
                  : index < currentSlide
                  ? 'w-1.5 bg-firefly-dim'
                  : 'w-1.5 bg-border-subtle'
              }`}
              initial={false}
              animate={{
                width: index === currentSlide ? 32 : 6,
              }}
            />
          ))}
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6 min-h-[400px] flex flex-col justify-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-4"
            >
              {slides[currentSlide].icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-light text-firefly-glow mb-6"
            >
              {slides[currentSlide].title}
            </motion.h2>

            {/* Content paragraphs */}
            <div className="space-y-4 text-text-soft leading-relaxed max-w-2xl mx-auto">
              {slides[currentSlide].content.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={paragraph.startsWith('"') ? 'text-firefly-dim italic text-lg' : ''}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-6 py-3 text-text-muted hover:text-text-soft disabled:opacity-30 disabled:cursor-not-allowed transition-soft"
          >
            ← Previous
          </button>

          <div className="text-sm text-text-muted">
            {currentSlide + 1} / {slides.length}
          </div>

          {isLastSlide ? (
            <Link
              href="/signup"
              className="px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
            >
              Enter Your Grove →
            </Link>
          ) : (
            <button
              onClick={nextSlide}
              className="px-6 py-3 bg-firefly-dim/20 hover:bg-firefly-dim/40 text-firefly-glow rounded-lg transition-soft"
            >
              Next →
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

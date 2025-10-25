'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SoundArt {
  id: string
  uniqueCode: string
  audioUrl: string
  audioFilename: string
  audioDuration: number
  waveformData: string
  title: string | null
  primaryColor: string
  backgroundColor: string
  waveformStyle: string
  playCount: number
  createdAt: string
}

export default function SoundArtPlayPage() {
  const params = useParams()
  const router = useRouter()
  const code = params?.code as string

  const [soundArt, setSoundArt] = useState<SoundArt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch sound art data
  useEffect(() => {
    if (!code) return

    const fetchSoundArt = async () => {
      try {
        const response = await fetch(`/api/soundart/${code}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Sound art not found')
          } else {
            setError('Failed to load sound art')
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setSoundArt(data.soundArt)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching sound art:', err)
        setError('Failed to load sound art')
        setLoading(false)
      }
    }

    fetchSoundArt()
  }, [code])

  // Draw waveform when data loads
  useEffect(() => {
    if (soundArt && canvasRef.current) {
      drawWaveform()
    }
  }, [soundArt])

  const drawWaveform = () => {
    if (!soundArt || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Parse waveform data
    const samples = JSON.parse(soundArt.waveformData)

    // Set canvas size
    canvas.width = 1000
    canvas.height = 400

    // Clear canvas
    ctx.fillStyle = soundArt.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const barWidth = canvas.width / samples.length
    const centerY = canvas.height / 2

    ctx.fillStyle = soundArt.primaryColor

    if (soundArt.waveformStyle === 'bars') {
      // Vertical bars
      samples.forEach((sample: number, i: number) => {
        const barHeight = sample * (canvas.height * 0.8)
        const x = i * barWidth
        const y = centerY - barHeight / 2
        ctx.fillRect(x, y, barWidth * 0.8, barHeight)
      })
    } else if (soundArt.waveformStyle === 'curve') {
      // Smooth curve
      ctx.beginPath()
      ctx.strokeStyle = soundArt.primaryColor
      ctx.lineWidth = 3
      samples.forEach((sample: number, i: number) => {
        const x = i * barWidth
        const y = centerY - (sample * (canvas.height * 0.4))
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    } else if (soundArt.waveformStyle === 'mirror') {
      // Mirrored bars
      samples.forEach((sample: number, i: number) => {
        const barHeight = sample * (canvas.height * 0.4)
        const x = i * barWidth
        ctx.fillRect(x, centerY - barHeight, barWidth * 0.8, barHeight)
        ctx.fillRect(x, centerY, barWidth * 0.8, barHeight)
      })
    } else if (soundArt.waveformStyle === 'circular') {
      // Circular waveform
      const radius = Math.min(canvas.width, canvas.height) * 0.35
      const centerX = canvas.width / 2
      ctx.beginPath()
      ctx.strokeStyle = soundArt.primaryColor
      ctx.lineWidth = 2
      samples.forEach((sample: number, i: number) => {
        const angle = (i / samples.length) * Math.PI * 2 - Math.PI / 2
        const r = radius + sample * 80
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.closePath()
      ctx.stroke()
    }

    // Add title if provided
    if (soundArt.title) {
      ctx.fillStyle = soundArt.primaryColor
      ctx.font = '32px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(soundArt.title, canvas.width / 2, 50)
    }
  }

  const handlePlayPause = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      // Track play count
      if (audioRef.current.currentTime === 0) {
        try {
          await fetch(`/api/soundart/${code}/play`, {
            method: 'POST',
          })
        } catch (err) {
          console.error('Error tracking play:', err)
        }
      }

      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-dark to-bg-darker flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎵</div>
          <p className="text-text-soft">Loading sound art...</p>
        </div>
      </div>
    )
  }

  if (error || !soundArt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-dark to-bg-darker flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl text-text-soft mb-2">Sound Art Not Found</h1>
          <p className="text-text-muted mb-6">
            {error || 'This sound art may have been deleted or the link is invalid.'}
          </p>
          <Link
            href="/soundart"
            className="inline-block px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
          >
            Create Your Own
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-dark to-bg-darker">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/soundart" className="flex items-center gap-2 hover:opacity-80 transition-soft">
              <span className="text-firefly-glow text-2xl">✦</span>
              <h1 className="text-xl font-light text-text-soft">Sound Wave Art</h1>
            </Link>
            <Link
              href="/soundart"
              className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft"
            >
              Create Your Own
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Waveform Display */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 mb-6">
            {soundArt.title && (
              <h2 className="text-2xl text-text-soft mb-4 text-center">
                {soundArt.title}
              </h2>
            )}

            <div
              className="rounded-lg overflow-hidden mb-6"
              style={{ backgroundColor: soundArt.backgroundColor }}
            >
              <canvas ref={canvasRef} className="w-full h-auto" />
            </div>

            {/* Audio Player Controls */}
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={soundArt.audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              <button
                onClick={handlePlayPause}
                className="w-full px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft flex items-center justify-center gap-3"
              >
                <span className="text-2xl">{isPlaying ? '⏸' : '▶'}</span>
                <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
              </button>

              {/* Info */}
              <div className="flex items-center justify-between text-sm text-text-muted pt-2">
                <span>
                  {Math.floor(soundArt.audioDuration / 60)}:
                  {String(Math.floor(soundArt.audioDuration % 60)).padStart(2, '0')}
                </span>
                <span>Played {soundArt.playCount} times</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim/30 rounded-lg p-8 text-center">
            <p className="text-text-soft mb-4">
              Create your own scannable sound wave art
            </p>
            <Link
              href="/soundart"
              className="inline-block px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
            >
              Get Started — Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

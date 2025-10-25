'use client'

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface WaveformData {
  samples: number[]
  duration: number
  sampleRate: number
}

export default function SoundArtBuilder() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Customization settings
  const [title, setTitle] = useState('')
  const [stylePreset, setStylePreset] = useState('modern')
  const [primaryColor, setPrimaryColor] = useState('#FFD966')
  const [backgroundColor, setBackgroundColor] = useState('#0A0E14')
  const [waveformStyle, setWaveformStyle] = useState('bars')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Extract waveform data from audio file
  const extractWaveform = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Get channel data (use first channel for mono, or mix for stereo)
      const channelData = audioBuffer.getChannelData(0)

      // Downsample to ~500 points for visualization
      const targetSamples = 500
      const blockSize = Math.floor(channelData.length / targetSamples)
      const samples: number[] = []

      for (let i = 0; i < targetSamples; i++) {
        const start = i * blockSize
        const end = start + blockSize
        let sum = 0
        let count = 0

        // Calculate average amplitude for this block
        for (let j = start; j < end && j < channelData.length; j++) {
          sum += Math.abs(channelData[j])
          count++
        }

        samples.push(count > 0 ? sum / count : 0)
      }

      // Normalize samples to 0-1 range
      const max = Math.max(...samples)
      const normalizedSamples = samples.map(s => s / max)

      setWaveformData({
        samples: normalizedSamples,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
      })

      setIsProcessing(false)
    } catch (err) {
      console.error('Error processing audio:', err)
      setError('Failed to process audio file. Please try a different file.')
      setIsProcessing(false)
    }
  }

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setAudioFile(file)
      setAudioUrl(URL.createObjectURL(file))
      extractWaveform(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  // Draw waveform on canvas
  const drawWaveform = () => {
    if (!waveformData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (high res for export)
    canvas.width = 2000
    canvas.height = 1000

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const samples = waveformData.samples
    const barWidth = canvas.width / samples.length
    const centerY = canvas.height / 2

    ctx.fillStyle = primaryColor

    if (waveformStyle === 'bars') {
      // Vertical bars
      samples.forEach((sample, i) => {
        const barHeight = sample * (canvas.height * 0.8)
        const x = i * barWidth
        const y = centerY - barHeight / 2

        ctx.fillRect(x, y, barWidth * 0.8, barHeight)
      })
    } else if (waveformStyle === 'curve') {
      // Smooth curve
      ctx.beginPath()
      ctx.strokeStyle = primaryColor
      ctx.lineWidth = 4

      samples.forEach((sample, i) => {
        const x = i * barWidth
        const y = centerY - (sample * (canvas.height * 0.4))

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    } else if (waveformStyle === 'mirror') {
      // Mirrored bars
      samples.forEach((sample, i) => {
        const barHeight = sample * (canvas.height * 0.4)
        const x = i * barWidth

        // Top half
        ctx.fillRect(x, centerY - barHeight, barWidth * 0.8, barHeight)
        // Bottom half (mirrored)
        ctx.fillRect(x, centerY, barWidth * 0.8, barHeight)
      })
    } else if (waveformStyle === 'circular') {
      // Circular waveform
      const radius = Math.min(canvas.width, canvas.height) * 0.35
      const centerX = canvas.width / 2

      ctx.beginPath()
      ctx.strokeStyle = primaryColor
      ctx.lineWidth = 3

      samples.forEach((sample, i) => {
        const angle = (i / samples.length) * Math.PI * 2 - Math.PI / 2
        const r = radius + sample * 100
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
    if (title) {
      ctx.fillStyle = primaryColor
      ctx.font = '48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(title, canvas.width / 2, 80)
    }
  }

  // Redraw whenever settings change
  useState(() => {
    if (waveformData) {
      drawWaveform()
    }
  })

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-dark/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-lg font-medium text-text-soft">Sound Wave Art Builder</h1>
              {audioFile && (
                <p className="text-xs text-text-muted">{audioFile.name}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Upload Section */}
          {!audioFile && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-light text-text-soft mb-2">Upload Your Audio</h2>
                <p className="text-text-muted">MP3, WAV, M4A, or OGG • Up to 50MB</p>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-firefly-glow bg-firefly-dim/10'
                    : 'border-border-subtle hover:border-firefly-dim bg-bg-elevated'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-6xl mb-4">🎵</div>
                <p className="text-text-soft text-lg mb-2">
                  {isDragActive ? 'Drop audio file here...' : 'Drag audio here or click to browse'}
                </p>
                <p className="text-text-muted text-sm">
                  Voice recordings, music, or any audio file
                </p>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">🎨</div>
              <h3 className="text-xl text-text-soft mb-2">Analyzing your audio...</h3>
              <p className="text-text-muted text-sm">
                Extracting waveform data
              </p>
            </div>
          )}

          {/* Builder Interface */}
          {waveformData && !isProcessing && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Customization Panel */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
                  <h3 className="text-lg text-text-soft mb-4">Customize</h3>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm text-text-muted mb-2">Title (Optional)</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          setTimeout(drawWaveform, 0)
                        }}
                        placeholder="I Love You"
                        className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                      />
                    </div>

                    {/* Waveform Style */}
                    <div>
                      <label className="block text-sm text-text-muted mb-2">Waveform Style</label>
                      <select
                        value={waveformStyle}
                        onChange={(e) => {
                          setWaveformStyle(e.target.value)
                          setTimeout(drawWaveform, 0)
                        }}
                        className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                      >
                        <option value="bars">Vertical Bars</option>
                        <option value="curve">Smooth Curve</option>
                        <option value="mirror">Mirror Bars</option>
                        <option value="circular">Circular</option>
                      </select>
                    </div>

                    {/* Primary Color */}
                    <div>
                      <label className="block text-sm text-text-muted mb-2">Waveform Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => {
                            setPrimaryColor(e.target.value)
                            setTimeout(drawWaveform, 0)
                          }}
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => {
                            setPrimaryColor(e.target.value)
                            setTimeout(drawWaveform, 0)
                          }}
                          className="flex-1 px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="block text-sm text-text-muted mb-2">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => {
                            setBackgroundColor(e.target.value)
                            setTimeout(drawWaveform, 0)
                          }}
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => {
                            setBackgroundColor(e.target.value)
                            setTimeout(drawWaveform, 0)
                          }}
                          className="flex-1 px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio Preview */}
                {audioUrl && (
                  <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
                    <h3 className="text-lg text-text-soft mb-4">Audio Preview</h3>
                    <audio src={audioUrl} controls className="w-full" />
                    <p className="text-text-muted text-xs mt-2">
                      Duration: {waveformData.duration.toFixed(1)}s
                    </p>
                  </div>
                )}

                {/* Start Over */}
                <button
                  onClick={() => {
                    setAudioFile(null)
                    setAudioUrl(null)
                    setWaveformData(null)
                    setTitle('')
                  }}
                  className="w-full px-4 py-2 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded-lg transition-soft text-sm"
                >
                  ← Upload Different Audio
                </button>
              </div>

              {/* Preview Panel */}
              <div className="lg:col-span-2">
                <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
                  <h3 className="text-lg text-text-soft mb-4">Preview</h3>

                  <div className="bg-bg-darker rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => {
                        // TODO: Generate QR code and add to artwork
                        alert('QR code generation coming next!')
                      }}
                      className="flex-1 px-6 py-3 bg-firefly-dim/20 hover:bg-firefly-dim/40 text-firefly-glow border border-firefly-dim/50 rounded-lg font-medium transition-soft"
                    >
                      Add QR Code
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Export as high-res image
                        if (canvasRef.current) {
                          const link = document.createElement('a')
                          link.download = `soundart-${Date.now()}.png`
                          link.href = canvasRef.current.toDataURL()
                          link.click()
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                    >
                      📥 Download Artwork
                    </button>
                  </div>

                  <p className="text-text-muted text-xs mt-4 text-center">
                    High-resolution 2000x1000px • Perfect for printing
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

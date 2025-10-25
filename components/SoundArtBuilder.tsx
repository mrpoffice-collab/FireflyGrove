'use client'

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import QRCode from 'qrcode'

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

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Customization settings
  const [title, setTitle] = useState('')
  const [stylePreset, setStylePreset] = useState('modern')
  const [primaryColor, setPrimaryColor] = useState('#FFD966')
  const [backgroundColor, setBackgroundColor] = useState('#0A0E14')
  const [waveformStyle, setWaveformStyle] = useState('bars')

  // QR Code
  const [showQRCode, setShowQRCode] = useState(false)
  const [uniqueCode, setUniqueCode] = useState('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState<HTMLImageElement | null>(null)

  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [playUrl, setPlayUrl] = useState<string | null>(null)

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

  // Generate QR Code
  const generateQRCode = async () => {
    // Generate a unique code (6 characters)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setUniqueCode(code)

    // Generate QR code as data URL
    try {
      const url = `${window.location.origin}/soundart/play/${code}`
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 1,
        color: {
          dark: primaryColor,
          light: backgroundColor,
        },
      })
      setQrCodeDataUrl(qrDataUrl)

      // Pre-load the QR code image
      const img = new Image()
      img.onload = () => {
        setQrCodeImage(img)
        setShowQRCode(true)
        // Redraw with QR code after image is loaded
        setTimeout(drawWaveform, 50)
      }
      img.src = qrDataUrl
    } catch (err) {
      console.error('Error generating QR code:', err)
      setError('Failed to generate QR code')
    }
  }

  // Upload to API and save
  const uploadToAPI = async () => {
    if (!audioFile || !waveformData || !uniqueCode) {
      setError('Please add a QR code before saving')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('waveformData', JSON.stringify(waveformData.samples))
      formData.append('uniqueCode', uniqueCode)
      formData.append('audioDuration', waveformData.duration.toString())

      if (title) formData.append('title', title)
      formData.append('primaryColor', primaryColor)
      formData.append('backgroundColor', backgroundColor)
      formData.append('waveformStyle', waveformStyle)
      formData.append('stylePreset', stylePreset)

      // Upload to API
      const response = await fetch('/api/soundart/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()

      setPlayUrl(data.soundArt.playUrl)
      setIsSaved(true)
      setIsUploading(false)

      console.log('✓ Sound art saved successfully:', data.soundArt.playUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save sound art')
      setIsUploading(false)
    }
  }

  // Start recording audio
  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })

        setAudioFile(file)
        setAudioUrl(URL.createObjectURL(file))
        extractWaveform(file)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())

        // Clear recording state
        setRecordingTime(0)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
        }
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordedChunks(chunks)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please grant permission.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
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

    // Add QR code if enabled and loaded
    if (showQRCode && qrCodeImage) {
      // Position QR code in bottom right corner
      const qrSize = 200
      const padding = 40
      const x = canvas.width - qrSize - padding
      const y = canvas.height - qrSize - padding

      // Draw background for QR code
      ctx.fillStyle = backgroundColor
      ctx.fillRect(x - 10, y - 10, qrSize + 20, qrSize + 20)

      // Draw QR code
      ctx.drawImage(qrCodeImage, x, y, qrSize, qrSize)

      // Add "Scan to Play" text above QR code
      ctx.fillStyle = primaryColor
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Scan to Play', x + qrSize / 2, y - 20)
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
          {!audioFile && !isRecording && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-light text-text-soft mb-2">Add Your Audio</h2>
                <p className="text-text-muted">Record your voice or upload an audio file</p>
              </div>

              {/* Recording Interface */}
              <div className="mb-6">
                <button
                  onClick={startRecording}
                  className="w-full px-8 py-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-2 border-red-500/50 hover:border-red-500/70 text-text-soft rounded-lg font-medium text-lg transition-soft flex items-center justify-center gap-3"
                >
                  <span className="text-3xl">🎙️</span>
                  <span>Record Audio</span>
                </button>
                <p className="text-text-muted text-xs text-center mt-2">
                  Say "I love you", record a message, or capture any moment
                </p>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-subtle"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-bg-dark text-text-muted">OR</span>
                </div>
              </div>

              {/* File Upload */}
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
                  MP3, WAV, M4A, or OGG • Up to 50MB
                </p>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Recording State */}
          {isRecording && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="mb-6">
                <div className="inline-block relative">
                  <div className="text-8xl mb-4 animate-pulse">🎙️</div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-2xl text-text-soft mb-2">Recording...</h3>
              <p className="text-4xl text-firefly-glow font-mono mb-6">
                {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
              </p>
              <button
                onClick={stopRecording}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-lg transition-soft"
              >
                ⏹ Stop Recording
              </button>
              <p className="text-text-muted text-sm mt-4">
                Click stop when you're done, or let it run for up to 5 minutes
              </p>
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

                  {/* QR Code Info */}
                  {showQRCode && uniqueCode && (
                    <div className="mt-4 p-3 bg-firefly-glow/10 border border-firefly-glow/30 rounded-lg">
                      <div className="text-xs text-text-muted mb-1">Scan URL:</div>
                      <div className="text-sm text-firefly-glow font-mono break-all">
                        {window.location.origin}/soundart/play/{uniqueCode}
                      </div>
                      <div className="text-xs text-text-muted mt-2">
                        Code: <span className="text-text-soft font-mono">{uniqueCode}</span>
                      </div>
                    </div>
                  )}
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

                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={generateQRCode}
                        disabled={showQRCode}
                        className={`px-6 py-3 border rounded-lg font-medium transition-soft ${
                          showQRCode
                            ? 'bg-firefly-glow/20 text-firefly-glow border-firefly-glow cursor-not-allowed'
                            : 'bg-firefly-dim/20 hover:bg-firefly-dim/40 text-firefly-glow border-firefly-dim/50'
                        }`}
                      >
                        {showQRCode ? '✓ QR Code Added' : '+ Add QR Code'}
                      </button>
                      <button
                        onClick={() => {
                          if (canvasRef.current) {
                            const link = document.createElement('a')
                            link.download = `soundart-${Date.now()}.png`
                            link.href = canvasRef.current.toDataURL()
                            link.click()
                          }
                        }}
                        className="px-6 py-3 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded-lg font-medium transition-soft"
                      >
                        📥 Download
                      </button>
                    </div>

                    <button
                      onClick={uploadToAPI}
                      disabled={!showQRCode || isUploading || isSaved}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-soft ${
                        isSaved
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                          : isUploading
                          ? 'bg-firefly-dim/40 text-text-soft cursor-wait'
                          : showQRCode
                          ? 'bg-firefly-dim hover:bg-firefly-glow text-bg-dark'
                          : 'bg-border-subtle text-text-muted cursor-not-allowed'
                      }`}
                    >
                      {isSaved
                        ? '✓ Saved & Ready to Share'
                        : isUploading
                        ? 'Uploading...'
                        : '💾 Save & Share'}
                    </button>

                    {isSaved && playUrl && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <p className="text-green-400 text-sm font-medium mb-2">
                          🎉 Your sound art is saved!
                        </p>
                        <p className="text-text-muted text-xs mb-2">
                          Scan the QR code or share this link:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}${playUrl}`}
                            className="flex-1 px-3 py-2 bg-bg-dark border border-border-subtle rounded text-text-soft text-xs"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}${playUrl}`)
                              alert('Link copied to clipboard!')
                            }}
                            className="px-3 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-xs font-medium transition-soft"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
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

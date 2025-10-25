'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { VideoRenderer } from './VideoRenderer'

interface Photo {
  id: string
  file: File
  url: string
  duration: number
  filter: string
  transition: string
  caption?: string
}

interface VideoSettings {
  introText: string
  introSubtext: string
  outroText: string
  outroSubtext: string
  musicFile: File | null
  photoDuration: number
  transitionDuration: number
  defaultTransition: string
  defaultFilter: string
}

export default function VideoCollageBuilder() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [settings, setSettings] = useState<VideoSettings>({
    introText: '',
    introSubtext: '',
    outroText: 'Forever in our hearts',
    outroSubtext: 'Created with love at FireflyGrove.app',
    musicFile: null,
    photoDuration: 4,
    transitionDuration: 1,
    defaultTransition: 'fade',
    defaultFilter: 'none',
  })
  const [currentStep, setCurrentStep] = useState<'upload' | 'arrange' | 'customize' | 'preview'>('upload')
  const [isRendering, setIsRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRendererRef = useRef<any>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos: Photo[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      duration: settings.photoDuration,
      filter: settings.defaultFilter,
      transition: settings.defaultTransition,
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
  }, [settings.photoDuration, settings.defaultFilter, settings.defaultTransition])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
  })

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos]
    const [removed] = newPhotos.splice(fromIndex, 1)
    newPhotos.splice(toIndex, 0, removed)
    setPhotos(newPhotos)
  }

  // Step navigation
  const canProceed = () => {
    if (currentStep === 'upload') return photos.length >= 3
    return true
  }

  const nextStep = () => {
    const steps: typeof currentStep[] = ['upload', 'arrange', 'customize', 'preview']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: typeof currentStep[] = ['upload', 'arrange', 'customize', 'preview']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-dark/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/video-collage" className="flex items-center gap-2 text-text-muted hover:text-text-soft transition-soft">
              <span>←</span>
              <span className="text-sm">Back</span>
            </Link>

            <div className="text-center">
              <h1 className="text-lg font-medium text-text-soft">Memorial Video Builder</h1>
              <p className="text-xs text-text-muted">{photos.length} photos</p>
            </div>

            <div className="flex items-center gap-2">
              {photos.length > 0 && (
                <span className="text-xs text-firefly-glow">
                  Estimated: {Math.ceil(photos.length * settings.photoDuration / 60)}min
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border-subtle bg-bg-elevated/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {[
              { key: 'upload', label: 'Upload Photos', icon: '📸' },
              { key: 'arrange', label: 'Arrange', icon: '🎬' },
              { key: 'customize', label: 'Customize', icon: '🎨' },
              { key: 'preview', label: 'Preview & Export', icon: '💾' },
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.key as typeof currentStep)}
                  disabled={step.key === 'arrange' && photos.length < 3}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-soft text-sm ${
                    currentStep === step.key
                      ? 'bg-firefly-dim/20 text-firefly-glow border border-firefly-dim/50'
                      : photos.length >= 3 || step.key === 'upload'
                      ? 'text-text-muted hover:text-text-soft'
                      : 'text-text-muted/30 cursor-not-allowed'
                  }`}
                >
                  <span>{step.icon}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {index < 3 && (
                  <div className="w-8 h-px bg-border-subtle mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {currentStep === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-text-soft mb-2">Upload Your Photos</h2>
              <p className="text-text-muted">Add at least 3 photos to create your memorial video</p>
            </div>

            {/* Upload Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-firefly-glow bg-firefly-dim/10'
                  : 'border-border-subtle hover:border-firefly-dim bg-bg-elevated'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4">📸</div>
              <p className="text-text-soft text-lg mb-2">
                {isDragActive ? 'Drop photos here...' : 'Drag photos here or click to browse'}
              </p>
              <p className="text-text-muted text-sm">
                Supports JPG, PNG, GIF, WebP • Up to 100 photos
              </p>
            </div>

            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-text-soft">{photos.length} Photos Added</h3>
                  <button
                    onClick={() => setPhotos([])}
                    className="text-sm text-text-muted hover:text-red-400 transition-soft"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-bg-darker border border-border-subtle">
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-soft flex items-center justify-center"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            {photos.length >= 3 && (
              <div className="mt-8 text-center">
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                >
                  Continue to Arrange →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'arrange' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-text-soft mb-2">Arrange Your Photos</h2>
              <p className="text-text-muted">Drag to reorder • Click to edit individual settings</p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <p className="text-text-muted text-center py-8">
                Drag-and-drop arrangement coming in next iteration...
                <br />
                For now, photos will play in upload order.
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded-lg transition-soft"
              >
                ← Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Continue to Customize →
              </button>
            </div>
          </div>
        )}

        {currentStep === 'customize' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-text-soft mb-2">Customize Your Video</h2>
              <p className="text-text-muted">Add text, choose transitions, and upload music</p>
            </div>

            <div className="space-y-6">
              {/* Intro/Outro Text */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
                <h3 className="text-lg text-text-soft mb-4">Text Overlays</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Intro Title</label>
                    <input
                      type="text"
                      value={settings.introText}
                      onChange={(e) => setSettings({ ...settings, introText: e.target.value })}
                      placeholder="In Loving Memory"
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-2">Intro Subtitle (Name & Dates)</label>
                    <input
                      type="text"
                      value={settings.introSubtext}
                      onChange={(e) => setSettings({ ...settings, introSubtext: e.target.value })}
                      placeholder="John Smith • 1950 - 2024"
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                  </div>
                </div>
              </div>

              {/* Transitions & Timing */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
                <h3 className="text-lg text-text-soft mb-4">Transitions & Timing</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-2">
                      Photo Duration: {settings.photoDuration} seconds
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="0.5"
                      value={settings.photoDuration}
                      onChange={(e) => setSettings({ ...settings, photoDuration: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-2">Default Transition</label>
                    <select
                      value={settings.defaultTransition}
                      onChange={(e) => setSettings({ ...settings, defaultTransition: e.target.value })}
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    >
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                      <option value="kenburns">Ken Burns (Slow Zoom)</option>
                      <option value="crossfade">Crossfade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-2">Default Filter</label>
                    <select
                      value={settings.defaultFilter}
                      onChange={(e) => setSettings({ ...settings, defaultFilter: e.target.value })}
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    >
                      <option value="none">None</option>
                      <option value="bw">Black & White</option>
                      <option value="sepia">Sepia</option>
                      <option value="vintage">Vintage</option>
                      <option value="warm">Warm</option>
                      <option value="cool">Cool</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Music */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
                <h3 className="text-lg text-text-soft mb-4">Background Music</h3>
                <p className="text-text-muted text-sm mb-4">Upload your own music (MP3, M4A, WAV)</p>

                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSettings({ ...settings, musicFile: e.target.files?.[0] || null })}
                  className="w-full text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-firefly-dim/20 file:text-firefly-glow hover:file:bg-firefly-dim/40"
                />

                {settings.musicFile && (
                  <p className="mt-2 text-sm text-firefly-glow">
                    ✓ {settings.musicFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded-lg transition-soft"
              >
                ← Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Preview & Export →
              </button>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-text-soft mb-2">Preview & Export</h2>
              <p className="text-text-muted">
                {videoBlob
                  ? 'Your video is ready to download!'
                  : 'Generate your memorial video'}
              </p>
            </div>

            {/* Video Info */}
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-firefly-glow text-2xl mb-1">{photos.length}</div>
                  <div className="text-text-muted text-sm">Photos</div>
                </div>
                <div>
                  <div className="text-firefly-glow text-2xl mb-1">
                    {Math.ceil((photos.length * settings.photoDuration + 6) / 60)}min
                  </div>
                  <div className="text-text-muted text-sm">Duration</div>
                </div>
                <div>
                  <div className="text-firefly-glow text-2xl mb-1">1080p</div>
                  <div className="text-text-muted text-sm">Quality</div>
                </div>
              </div>
            </div>

            {/* Rendering Progress */}
            {isRendering && (
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-8 mb-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4 animate-pulse">🎬</div>
                  <h3 className="text-lg text-text-soft mb-2">Creating Your Video...</h3>
                  <p className="text-text-muted text-sm">
                    This may take a few minutes. Please don't close this window.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-bg-darker rounded-full h-3 overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-firefly-dim to-firefly-glow h-3 rounded-full transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
                <div className="text-center text-sm text-firefly-glow">
                  {renderProgress.toFixed(0)}% complete
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Video Preview/Download */}
            {videoBlob && !isRendering && (
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-8 mb-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl text-firefly-glow mb-2">Video Ready!</h3>
                  <p className="text-text-muted text-sm">
                    Your memorial video has been created successfully.
                  </p>
                </div>

                {/* Video Preview */}
                <div className="max-w-2xl mx-auto mb-6">
                  <video
                    src={URL.createObjectURL(videoBlob)}
                    controls
                    className="w-full rounded-lg border border-border-subtle"
                  />
                </div>

                {/* Download Button */}
                <div className="text-center">
                  <a
                    href={URL.createObjectURL(videoBlob)}
                    download={`memorial-video-${Date.now()}.webm`}
                    className="inline-block px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                  >
                    📥 Download Video
                  </a>
                  <p className="text-text-muted text-xs mt-2">
                    File size: {(videoBlob.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {/* Firefly Grove CTA */}
                <div className="mt-8 p-6 bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim/30 rounded-lg text-center">
                  <p className="text-text-soft mb-3">
                    💛 Want to preserve these memories forever?
                  </p>
                  <p className="text-text-muted text-sm mb-4">
                    Create a lasting memorial at Firefly Grove where family can add stories, photos, and keep the light alive.
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-firefly-dim/20 hover:bg-firefly-dim/40 text-firefly-glow border border-firefly-dim/50 rounded-lg font-medium transition-soft"
                  >
                    Create a Memorial Grove →
                  </Link>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isRendering && !videoBlob && (
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-text-muted mb-6">
                  Ready to create your {Math.ceil((photos.length * settings.photoDuration + 6) / 60)}-minute memorial video?
                  <br />
                  <span className="text-sm">This process happens in your browser and may take 2-5 minutes.</span>
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsRendering(true)
                      setError(null)
                      setRenderProgress(0)
                      // Trigger rendering through ref
                      if (videoRendererRef.current) {
                        videoRendererRef.current.renderVideo()
                      }
                    }}
                    className="block w-full max-w-md mx-auto px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                  >
                    🎬 Generate Video
                  </button>

                  <button
                    onClick={prevStep}
                    className="block w-full max-w-md mx-auto px-6 py-3 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded-lg transition-soft"
                  >
                    ← Back to Customize
                  </button>
                </div>
              </div>
            )}

            {/* Create New Video */}
            {videoBlob && !isRendering && (
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    setVideoBlob(null)
                    setRenderProgress(0)
                    setError(null)
                  }}
                  className="text-text-muted hover:text-text-soft text-sm transition-soft"
                >
                  ← Create Another Video
                </button>
              </div>
            )}

            {/* Hidden Video Renderer */}
            <VideoRenderer
              ref={videoRendererRef}
              photos={photos}
              settings={settings}
              onProgress={(progress) => setRenderProgress(progress)}
              onComplete={(blob) => {
                setVideoBlob(blob)
                setIsRendering(false)
              }}
              onError={(err) => {
                setError(err)
                setIsRendering(false)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { BlogVideoScript, formatDuration } from '@/lib/blogVideoParser'
import { VoiceOption } from '@/app/api/generate-voiceover/route'
import BlogVideoRenderer, { BlogVideoRendererHandle } from './BlogVideoRenderer'

interface VoiceInfo {
  id: VoiceOption
  name: string
  description: string
}

interface AudioResult {
  sectionId: string
  audioData: string
  duration: number
  format: string
}

export default function BlogVideoBuilder() {
  const [step, setStep] = useState(1)
  const [selectedPost, setSelectedPost] = useState<string>('')
  const [videoScript, setVideoScript] = useState<BlogVideoScript | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Voice settings
  const [voices, setVoices] = useState<VoiceInfo[]>([])
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('nova')
  const [voiceSpeed, setVoiceSpeed] = useState(0.95)

  // Voiceover generation
  const [generatingVoiceover, setGeneratingVoiceover] = useState(false)
  const [voiceoverProgress, setVoiceoverProgress] = useState(0)
  const [audioResults, setAudioResults] = useState<AudioResult[]>([])
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  // Video rendering
  const videoRendererRef = useRef<BlogVideoRendererHandle>(null)
  const [renderingVideo, setRenderingVideo] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)

  // Load voice options
  useEffect(() => {
    loadVoices()
  }, [])

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/generate-voiceover')
      const data = await response.json()
      setVoices(data.voices)
    } catch (err) {
      console.error('Error loading voices:', err)
    }
  }

  const handleSelectPost = async (slug: string) => {
    if (!slug) return

    setSelectedPost(slug)
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/blog-video/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })

      if (!response.ok) {
        throw new Error('Failed to parse blog post')
      }

      const data = await response.json()
      setVideoScript(data.script)
      setStep(2)
    } catch (err) {
      console.error('Error parsing blog:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse blog post')
    } finally {
      setLoading(false)
    }
  }

  const generateVoiceover = async () => {
    if (!videoScript) return

    setGeneratingVoiceover(true)
    setVoiceoverProgress(0)
    setError('')

    try {
      const sections = videoScript.sections.map(s => ({
        id: s.id,
        text: s.voiceoverText,
      }))

      const response = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections,
          voice: selectedVoice,
          speed: voiceSpeed,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate voiceover')
      }

      const data = await response.json()
      setAudioResults(data.results)
      setVoiceoverProgress(100)
      setStep(3)

      console.log('Voiceover generation complete:', data.metadata)
    } catch (err) {
      console.error('Error generating voiceover:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate voiceover')
    } finally {
      setGeneratingVoiceover(false)
    }
  }

  const playAudioPreview = (sectionId: string) => {
    const result = audioResults.find(r => r.sectionId === sectionId)
    if (!result) return

    // Stop currently playing audio
    if (playingAudio) {
      setPlayingAudio(null)
    }

    // Create audio from base64
    const audio = new Audio(`data:audio/mp3;base64,${result.audioData}`)
    audio.onended = () => setPlayingAudio(null)
    audio.play()
    setPlayingAudio(sectionId)
  }

  const stopAudio = () => {
    setPlayingAudio(null)
  }

  const startVideoRender = () => {
    if (!videoRendererRef.current || !videoScript) return

    setRenderingVideo(true)
    setRenderProgress(0)
    setVideoBlob(null)
    setError('')

    videoRendererRef.current.renderVideo()
  }

  const handleVideoComplete = (blob: Blob) => {
    setVideoBlob(blob)
    setRenderingVideo(false)
    setRenderProgress(100)
    console.log('Video rendering complete:', blob.size, 'bytes')
  }

  const handleVideoError = (error: string) => {
    setError(error)
    setRenderingVideo(false)
  }

  const downloadVideo = () => {
    if (!videoBlob) return

    const url = URL.createObjectURL(videoBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${videoScript?.title.slice(0, 50).replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'blog-video'}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-text-soft mb-2">
            Blog Video <span className="text-firefly-glow">Builder</span>
          </h1>
          <p className="text-text-muted">
            Transform your blog posts into engaging videos with AI voiceover
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-12">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium transition-soft
                ${step >= num ? 'bg-firefly-dim text-bg-dark' : 'bg-bg-elevated border border-border-subtle text-text-muted'}
              `}>
                {num}
              </div>
              <span className={`text-sm ${step >= num ? 'text-text-soft' : 'text-text-muted'}`}>
                {num === 1 && 'Select Post'}
                {num === 2 && 'Customize Script'}
                {num === 3 && 'Generate Voice'}
                {num === 4 && 'Render Video'}
              </span>
              {num < 4 && (
                <div className={`w-12 h-0.5 ${step > num ? 'bg-firefly-dim' : 'bg-border-subtle'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Select Blog Post */}
        {step === 1 && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
            <h2 className="text-2xl font-light text-text-soft mb-6">
              Select a Blog Post
            </h2>

            {/* Temporary: Manual slug input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-2">
                  Enter Blog Post Slug
                </label>
                <input
                  type="text"
                  value={selectedPost}
                  onChange={(e) => setSelectedPost(e.target.value)}
                  placeholder="e.g., elderly-parents-won-t-record-stories-before-it-s-too-late"
                  className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim"
                />
              </div>

              <button
                onClick={() => handleSelectPost(selectedPost)}
                disabled={!selectedPost || loading}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Parse Blog Post'}
              </button>
            </div>

            {/* TODO: Add blog post list when API is ready */}
          </div>
        )}

        {/* Step 2: Customize Script */}
        {step === 2 && videoScript && (
          <div className="space-y-6">
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
              <h2 className="text-2xl font-light text-text-soft mb-2">
                {videoScript.title}
              </h2>
              <p className="text-text-muted mb-6">{videoScript.excerpt}</p>

              <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-bg-dark rounded-lg">
                <div>
                  <div className="text-2xl font-light text-firefly-glow">
                    {videoScript.sections.length}
                  </div>
                  <div className="text-sm text-text-muted">Sections</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-firefly-glow">
                    {formatDuration(videoScript.estimatedDuration)}
                  </div>
                  <div className="text-sm text-text-muted">Duration</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-firefly-glow">
                    {videoScript.wordCount}
                  </div>
                  <div className="text-sm text-text-muted">Words</div>
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-medium text-text-soft">Voice Settings</h3>

                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    AI Voice
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value as VoiceOption)}
                    className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim"
                  >
                    {voices.map(voice => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} - {voice.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Speaking Speed: {voiceSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sections Preview */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-medium text-text-soft mb-4">
                  Video Sections ({videoScript.sections.length})
                </h3>
                {videoScript.sections.map((section, index) => (
                  <div key={section.id} className="p-4 bg-bg-dark border border-border-subtle rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted">#{index + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          section.type === 'title' ? 'bg-firefly-glow/20 text-firefly-glow' :
                          section.type === 'section' ? 'bg-blue-500/20 text-blue-400' :
                          section.type === 'cta' ? 'bg-green-500/20 text-green-400' :
                          'bg-bg-elevated text-text-muted'
                        }`}>
                          {section.type}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {section.duration}s
                      </span>
                    </div>

                    {section.heading && (
                      <div className="font-medium text-text-soft mb-2">
                        {section.heading}
                      </div>
                    )}

                    <div className="text-sm text-text-muted line-clamp-2">
                      {section.voiceoverText}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
                >
                  ← Back
                </button>
                <button
                  onClick={generateVoiceover}
                  disabled={generatingVoiceover}
                  className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingVoiceover ? 'Generating Voiceover...' : 'Generate Voiceover →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview Voiceover */}
        {step === 3 && audioResults.length > 0 && videoScript && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
            <h2 className="text-2xl font-light text-text-soft mb-6">
              Voiceover Generated Successfully ✓
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto mb-8">
              {videoScript.sections.map((section, index) => {
                const audio = audioResults.find(a => a.sectionId === section.id)
                if (!audio) return null

                return (
                  <div key={section.id} className="p-4 bg-bg-dark border border-border-subtle rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-text-soft mb-1">
                          {section.heading || section.text.slice(0, 50)}
                        </div>
                        <div className="text-sm text-text-muted">
                          {audio.duration}s • {audio.format}
                        </div>
                      </div>

                      <button
                        onClick={() => playingAudio === section.id ? stopAudio() : playAudioPreview(section.id)}
                        className="px-4 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow rounded-lg text-sm font-medium transition-soft"
                      >
                        {playingAudio === section.id ? '⏸ Stop' : '▶ Play'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Continue to Video Rendering →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Render Video */}
        {step === 4 && videoScript && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
            <h2 className="text-2xl font-light text-text-soft mb-6">
              Render Video
            </h2>

            {!renderingVideo && !videoBlob && (
              <>
                <div className="mb-6">
                  <p className="text-text-muted mb-4">
                    Ready to create your video! This will combine all {audioResults.length} voiceover clips with animated slides.
                  </p>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-bg-dark rounded-lg">
                    <div>
                      <div className="text-lg font-light text-firefly-glow">
                        {formatDuration(videoScript.estimatedDuration)}
                      </div>
                      <div className="text-sm text-text-muted">Estimated Duration</div>
                    </div>
                    <div>
                      <div className="text-lg font-light text-firefly-glow">
                        1920x1080
                      </div>
                      <div className="text-sm text-text-muted">Resolution</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={startVideoRender}
                    className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                  >
                    Start Rendering →
                  </button>
                </div>
              </>
            )}

            {renderingVideo && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-light text-firefly-glow mb-2">
                    {renderProgress.toFixed(0)}%
                  </div>
                  <div className="text-text-muted">Rendering video...</div>
                </div>

                <div className="w-full bg-bg-dark rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-firefly-dim to-firefly-glow transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>

                <div className="text-sm text-text-muted text-center">
                  This may take 2-5 minutes depending on video length...
                </div>
              </div>
            )}

            {videoBlob && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-light text-text-soft mb-2">
                    Video Ready!
                  </h3>
                  <p className="text-text-muted">
                    Your video has been generated successfully.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-bg-dark rounded-lg">
                  <div>
                    <div className="text-lg font-light text-firefly-glow">
                      {(videoBlob.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                    <div className="text-sm text-text-muted">File Size</div>
                  </div>
                  <div>
                    <div className="text-lg font-light text-firefly-glow">
                      {formatDuration(videoScript.estimatedDuration)}
                    </div>
                    <div className="text-sm text-text-muted">Duration</div>
                  </div>
                  <div>
                    <div className="text-lg font-light text-firefly-glow">
                      WebM
                    </div>
                    <div className="text-sm text-text-muted">Format</div>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="bg-bg-dark rounded-lg p-4">
                  <video
                    src={URL.createObjectURL(videoBlob)}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setStep(1)
                      setVideoBlob(null)
                      setVideoScript(null)
                      setAudioResults([])
                    }}
                    className="px-6 py-3 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
                  >
                    Create New Video
                  </button>
                  <button
                    onClick={downloadVideo}
                    className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                  >
                    ⬇ Download Video
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden Video Renderer */}
        {videoScript && audioResults.length > 0 && (
          <BlogVideoRenderer
            ref={videoRendererRef}
            sections={videoScript.sections}
            audioResults={audioResults}
            onProgress={setRenderProgress}
            onComplete={handleVideoComplete}
            onError={handleVideoError}
          />
        )}
      </div>
    </div>
  )
}

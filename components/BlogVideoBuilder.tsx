'use client'

import { useState, useEffect, useRef } from 'react'
import { BlogVideoScript, formatDuration } from '@/lib/blogVideoParser'
import { VoiceOption } from '@/app/api/generate-voiceover/route'
import BlogVideoRenderer, { BlogVideoRendererHandle } from './BlogVideoRenderer'
import BlogVideoVisualSelector, { SectionMedia } from './BlogVideoVisualSelector'

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

  // Load voice options, existing sessions, and content sources
  useEffect(() => {
    loadVoices()
    loadSessions()
    loadContentSources()
  }, [])

  const loadContentSources = async () => {
    try {
      setLoadingContentSources(true)
      const response = await fetch('/api/blog-video/content-sources')
      if (response.ok) {
        const data = await response.json()
        setContentSources(data.sources || [])
      }
    } catch (error) {
      console.error('Error loading content sources:', error)
    } finally {
      setLoadingContentSources(false)
    }
  }

  const [existingSessions, setExistingSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Content sources
  const [contentSources, setContentSources] = useState<any[]>([])
  const [loadingContentSources, setLoadingContentSources] = useState(false)
  const [contentTab, setContentTab] = useState<'browse' | 'manual'>('browse')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'published-blog' | 'draft-marketing' | 'published-marketing'>('all')

  // Manual content
  const [manualTitle, setManualTitle] = useState('')
  const [manualContent, setManualContent] = useState('')
  const [manualExcerpt, setManualExcerpt] = useState('')

  // Section editing
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editedSections, setEditedSections] = useState<{[key: string]: any}>({})

  // Visual media selection
  const [sectionMedia, setSectionMedia] = useState<{ [sectionId: string]: SectionMedia }>({})

  // Save to database whenever audio results or visual selections change
  useEffect(() => {
    if (audioResults.length > 0 && videoScript) {
      saveSessionToDatabase()
    }
  }, [audioResults, videoScript, selectedPost, selectedVoice, voiceSpeed, sectionMedia])

  const updateSection = (sectionId: string, field: string, value: any) => {
    setEditedSections(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [field]: value,
      }
    }))
  }

  const deleteSection = (sectionId: string) => {
    if (!videoScript) return
    if (!confirm('Remove this section from the video?')) return

    const updatedSections = videoScript.sections.filter(s => s.id !== sectionId)
    setVideoScript({
      ...videoScript,
      sections: updatedSections,
      estimatedDuration: updatedSections.reduce((sum, s) => sum + s.duration, 0),
    })
  }

  const getSectionData = (section: any) => {
    const edited = editedSections[section.id] || {}
    return {
      ...section,
      ...edited,
    }
  }

  const applyEdits = () => {
    if (!videoScript) return

    const updatedSections = videoScript.sections.map(section => {
      const edited = editedSections[section.id]
      if (edited) {
        return { ...section, ...edited }
      }
      return section
    })

    setVideoScript({
      ...videoScript,
      sections: updatedSections,
    })

    setEditedSections({})
    setEditingSection(null)
  }

  const loadSessions = async () => {
    try {
      setLoadingSessions(true)
      const response = await fetch('/api/blog-video/sessions')
      if (response.ok) {
        const data = await response.json()
        setExistingSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const saveSessionToDatabase = async () => {
    if (!videoScript || audioResults.length === 0) return

    try {
      const response = await fetch('/api/blog-video/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogSlug: selectedPost,
          blogTitle: videoScript.title,
          videoScript,
          audioResults,
          sectionMedia, // Save visual selections
          selectedVoice,
          voiceSpeed,
          generationCost: (videoScript.wordCount / 1000) * 0.03, // Estimate cost
        }),
      })

      if (response.ok) {
        console.log('Saved session to database')
        loadSessions() // Refresh list
      }
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  const loadSessionFromDatabase = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog-video/sessions/${encodeURIComponent(slug)}`)

      if (response.ok) {
        const data = await response.json()
        const session = data.session

        setVideoScript(session.videoScript)
        setAudioResults(session.audioResults)
        setSectionMedia(session.sectionMedia || {}) // Restore visual selections
        setSelectedPost(session.blogSlug)
        setSelectedVoice(session.selectedVoice)
        setVoiceSpeed(session.voiceSpeed)
        setStep(4)

        console.log('Loaded session from database:', session.id)
      } else if (response.status === 404) {
        // No existing session, proceed with normal flow
        return false
      }
    } catch (error) {
      console.error('Error loading session:', error)
      return false
    } finally {
      setLoading(false)
    }
    return true
  }

  const deleteSession = async (id: string) => {
    if (!confirm('Delete this video session? Voiceovers cannot be recovered.')) return

    try {
      const response = await fetch(`/api/blog-video/sessions?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log('Deleted session:', id)
        loadSessions() // Refresh list
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/generate-voiceover')
      const data = await response.json()
      setVoices(data.voices)
    } catch (err) {
      console.error('Error loading voices:', err)
    }
  }

  const handleSelectContent = async (source?: any) => {
    setLoading(true)
    setError('')

    try {
      let parseBody: any = {}

      if (source) {
        // Selecting from browse list
        setSelectedPost(source.slug)

        // Check for existing session first
        const existingLoaded = await loadSessionFromDatabase(source.slug)
        if (existingLoaded) {
          return
        }

        // Parse fresh content
        if (source.marketingPostId) {
          parseBody = { marketingPostId: source.marketingPostId }
        } else {
          parseBody = { slug: source.slug }
        }
      } else {
        // Manual content
        if (!manualTitle || !manualContent) {
          setError('Title and content are required')
          setLoading(false)
          return
        }

        const generatedSlug = manualTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
        setSelectedPost(generatedSlug)

        // Check for existing session
        const existingLoaded = await loadSessionFromDatabase(generatedSlug)
        if (existingLoaded) {
          return
        }

        parseBody = {
          manualContent: {
            title: manualTitle,
            content: manualContent,
            excerpt: manualExcerpt || undefined,
          },
        }
      }

      const response = await fetch('/api/blog-video/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parseBody),
      })

      if (!response.ok) {
        throw new Error('Failed to parse content')
      }

      const data = await response.json()
      setVideoScript(data.script)
      setStep(2)
    } catch (err) {
      console.error('Error parsing content:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse content')
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
      setStep(4)

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
          <div className="space-y-6">
            {/* Existing Sessions */}
            {existingSessions.length > 0 && (
              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
                <h2 className="text-2xl font-light text-text-soft mb-4">
                  Continue Existing Video
                </h2>
                <p className="text-text-muted mb-6">
                  You have {existingSessions.length} video{existingSessions.length !== 1 ? 's' : ''} in progress with saved voiceovers
                </p>

                <div className="space-y-3">
                  {existingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-bg-dark border border-border-subtle rounded-lg hover:border-firefly-dim transition-soft"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-text-soft mb-1">
                          {session.blogTitle}
                        </div>
                        <div className="text-sm text-text-muted">
                          {session.sectionCount} sections • {formatDuration(session.estimatedDuration)} •
                          {session.selectedVoice} voice •
                          Updated {new Date(session.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => loadSessionFromDatabase(session.blogSlug)}
                          className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg text-sm font-medium transition-soft"
                        >
                          Continue
                        </button>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-soft"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border-subtle">
                  <p className="text-sm text-text-muted">
                    Or create a new video below
                  </p>
                </div>
              </div>
            )}

            {/* New Video */}
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
              <h2 className="text-2xl font-light text-text-soft mb-6">
                {existingSessions.length > 0 ? 'Create New Video' : 'Select Content'}
              </h2>

              {/* Tabs: Browse vs Manual */}
              <div className="flex gap-2 mb-6 border-b border-border-subtle">
                <button
                  onClick={() => setContentTab('browse')}
                  className={`px-4 py-2 font-medium transition-soft border-b-2 ${
                    contentTab === 'browse'
                      ? 'border-firefly-glow text-firefly-glow'
                      : 'border-transparent text-text-muted hover:text-text-soft'
                  }`}
                >
                  📚 Browse Content
                </button>
                <button
                  onClick={() => setContentTab('manual')}
                  className={`px-4 py-2 font-medium transition-soft border-b-2 ${
                    contentTab === 'manual'
                      ? 'border-firefly-glow text-firefly-glow'
                      : 'border-transparent text-text-muted hover:text-text-soft'
                  }`}
                >
                  ✂️ Paste Content
                </button>
              </div>

              {/* Browse Content Tab */}
              {contentTab === 'browse' && (
                <div className="space-y-4">
                  {/* Filter buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSourceFilter('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-soft ${
                        sourceFilter === 'all'
                          ? 'bg-firefly-dim text-bg-dark'
                          : 'bg-bg-dark text-text-muted hover:text-text-soft'
                      }`}
                    >
                      All ({contentSources.length})
                    </button>
                    <button
                      onClick={() => setSourceFilter('published-blog')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-soft ${
                        sourceFilter === 'published-blog'
                          ? 'bg-firefly-dim text-bg-dark'
                          : 'bg-bg-dark text-text-muted hover:text-text-soft'
                      }`}
                    >
                      📄 Published Blogs ({contentSources.filter(s => s.type === 'published-blog').length})
                    </button>
                    <button
                      onClick={() => setSourceFilter('draft-marketing')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-soft ${
                        sourceFilter === 'draft-marketing'
                          ? 'bg-firefly-dim text-bg-dark'
                          : 'bg-bg-dark text-text-muted hover:text-text-soft'
                      }`}
                    >
                      ✏️ Drafts ({contentSources.filter(s => s.type === 'draft-marketing').length})
                    </button>
                    <button
                      onClick={() => setSourceFilter('published-marketing')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-soft ${
                        sourceFilter === 'published-marketing'
                          ? 'bg-firefly-dim text-bg-dark'
                          : 'bg-bg-dark text-text-muted hover:text-text-soft'
                      }`}
                    >
                      📱 Published ({contentSources.filter(s => s.type === 'published-marketing').length})
                    </button>
                  </div>

                  {/* Content list */}
                  {loadingContentSources ? (
                    <div className="text-center py-8 text-text-muted">Loading content...</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {contentSources
                        .filter(source => sourceFilter === 'all' || source.type === sourceFilter)
                        .map((source) => (
                          <div
                            key={source.id}
                            className="flex items-start justify-between p-4 bg-bg-dark border border-border-subtle rounded-lg hover:border-firefly-dim transition-soft cursor-pointer"
                            onClick={() => handleSelectContent(source)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-text-soft mb-1">
                                {source.title}
                              </div>
                              <div className="text-sm text-text-muted line-clamp-2 mb-2">
                                {source.excerpt}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-text-muted">
                                <span className="px-2 py-0.5 bg-bg-elevated rounded">
                                  {source.source}
                                </span>
                                <span>•</span>
                                <span>{new Date(source.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <button
                              disabled={loading}
                              className="ml-4 px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg text-sm font-medium transition-soft disabled:opacity-50"
                            >
                              {loading ? '...' : 'Select'}
                            </button>
                          </div>
                        ))}

                      {contentSources.filter(source => sourceFilter === 'all' || source.type === sourceFilter).length === 0 && (
                        <div className="text-center py-8 text-text-muted">
                          No content found. Try switching filters or paste content manually.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Manual Content Tab */}
              {contentTab === 'manual' && (
                <div className="space-y-4">
                  <p className="text-sm text-text-muted mb-4">
                    Paste content from anywhere - other websites, Word docs, or write directly.
                    Supports markdown or plain text.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-text-soft mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="e.g., How to Preserve Family Memories"
                      className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-soft mb-2">
                      Excerpt (optional)
                    </label>
                    <input
                      type="text"
                      value={manualExcerpt}
                      onChange={(e) => setManualExcerpt(e.target.value)}
                      placeholder="Short summary (optional)"
                      className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-soft mb-2">
                      Content *
                    </label>
                    <textarea
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      placeholder="Paste or write your content here...

# Use markdown headings to structure your content
## Section 1
Your content here...

## Section 2
More content..."
                      rows={12}
                      className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft font-mono text-sm focus:outline-none focus:border-firefly-dim"
                    />
                    <div className="text-xs text-text-muted mt-2">
                      {manualContent.split(/\s+/).filter(w => w).length} words • Estimated {Math.ceil(manualContent.split(/\s+/).filter(w => w).length / 150)} min video
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectContent()}
                    disabled={!manualTitle || !manualContent || loading}
                    className="w-full px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Parsing...' : 'Parse Content & Continue →'}
                  </button>
                </div>
              )}
            </div>
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

              {/* Sections Preview/Edit */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-soft">
                    Video Sections ({videoScript.sections.length})
                  </h3>
                  {Object.keys(editedSections).length > 0 && (
                    <button
                      onClick={applyEdits}
                      className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm font-medium transition-soft"
                    >
                      ✓ Apply {Object.keys(editedSections).length} Edit{Object.keys(editedSections).length !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>

                {videoScript.sections.map((section, index) => {
                  const sectionData = getSectionData(section)
                  const isEditing = editingSection === section.id

                  return (
                    <div key={section.id} className={`p-4 bg-bg-dark border rounded-lg transition-soft ${
                      isEditing ? 'border-firefly-glow' : 'border-border-subtle'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
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
                          <span className="text-xs text-text-muted">
                            {sectionData.duration}s
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {!isEditing ? (
                            <>
                              <button
                                onClick={() => setEditingSection(section.id)}
                                className="px-2 py-1 bg-bg-elevated hover:bg-border-subtle text-text-muted hover:text-text-soft rounded text-xs transition-soft"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteSection(section.id)}
                                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-soft"
                              >
                                🗑️ Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditingSection(null)}
                              className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs transition-soft"
                            >
                              ✓ Done
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          {section.heading && (
                            <div>
                              <label className="block text-xs text-text-muted mb-1">Heading</label>
                              <input
                                type="text"
                                value={sectionData.heading || ''}
                                onChange={(e) => updateSection(section.id, 'heading', e.target.value)}
                                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft text-sm focus:outline-none focus:border-firefly-dim"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-xs text-text-muted mb-1">
                              On-Screen Text (what viewers see)
                            </label>
                            <textarea
                              value={sectionData.text || ''}
                              onChange={(e) => updateSection(section.id, 'text', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft text-sm focus:outline-none focus:border-firefly-dim"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-text-muted mb-1">
                              Voiceover Script (what AI reads aloud)
                            </label>
                            <textarea
                              value={sectionData.voiceoverText || ''}
                              onChange={(e) => updateSection(section.id, 'voiceoverText', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft text-sm focus:outline-none focus:border-firefly-dim font-mono"
                            />
                            <div className="text-xs text-text-muted mt-1">
                              {sectionData.voiceoverText?.split(/\s+/).length || 0} words • ~{Math.ceil((sectionData.voiceoverText?.split(/\s+/).length || 0) / 150 * 60)}s
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-text-muted mb-1">
                              Duration (seconds)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={sectionData.duration || 5}
                              onChange={(e) => updateSection(section.id, 'duration', parseInt(e.target.value))}
                              className="w-24 px-3 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft text-sm focus:outline-none focus:border-firefly-dim"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {sectionData.heading && (
                            <div className="font-medium text-text-soft mb-2">
                              {sectionData.heading}
                            </div>
                          )}

                          <div className="text-sm text-text-muted mb-2">
                            <div className="font-medium text-xs text-text-muted mb-1">On-Screen:</div>
                            {sectionData.text}
                          </div>

                          <div className="text-sm text-text-muted">
                            <div className="font-medium text-xs text-text-muted mb-1">Voiceover:</div>
                            <div className="line-clamp-2 font-mono text-xs">
                              {sectionData.voiceoverText}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                >
                  Next: Select Visuals →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Select Visuals */}
        {step === 3 && videoScript && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
            <h2 className="text-2xl font-light text-text-soft mb-2">
              Step 3: Select Visuals
            </h2>
            <p className="text-text-muted mb-6">
              Choose images or videos for each section. Auto-suggestions provided based on content.
            </p>

            <BlogVideoVisualSelector
              sections={videoScript.sections}
              onMediaSelected={(sectionId, media) => {
                if (media) {
                  setSectionMedia(prev => ({ ...prev, [sectionId]: media }))
                } else {
                  setSectionMedia(prev => {
                    const newMedia = { ...prev }
                    delete newMedia[sectionId]
                    return newMedia
                  })
                }
              }}
              initialSelections={sectionMedia}
            />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
              >
                ← Back to Edit
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
        )}

        {/* Step 4: Preview Voiceover */}
        {step === 4 && audioResults.length > 0 && videoScript && (
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
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
              >
                ← Back to Visuals
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Continue to Video Rendering →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Render Video */}
        {step === 5 && videoScript && (
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
                    onClick={() => setStep(4)}
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
                      setSelectedPost('')
                      loadSessions() // Refresh the list
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
            sectionMedia={sectionMedia}
            onProgress={setRenderProgress}
            onComplete={handleVideoComplete}
            onError={handleVideoError}
          />
        )}
      </div>
    </div>
  )
}

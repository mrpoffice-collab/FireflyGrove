'use client'

import { useState, useEffect, useRef } from 'react'

interface AudioPrompt {
  id: string
  question: string
  category: string
  isFeatured: boolean
}

interface AudioSparksProps {
  onClose: () => void
  branches: Array<{ id: string; title: string }>
}

export default function AudioSparks({ onClose, branches }: AudioSparksProps) {
  const [prompts, setPrompts] = useState<AudioPrompt[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPrompt, setSelectedPrompt] = useState<AudioPrompt | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Form state
  const [recordedBy, setRecordedBy] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<string>('nest')
  const [isSaving, setIsSaving] = useState(false)

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/audio-sparks/prompts')
      if (res.ok) {
        const data = await res.json()
        setPrompts(data.prompts)
        setCategories(['all', ...data.categories])
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
    }
  }

  const filteredPrompts =
    selectedCategory === 'all'
      ? prompts
      : prompts.filter((p) => p.category === selectedCategory)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check your permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    chunksRef.current = []
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = async () => {
    if (!audioBlob) return

    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('duration', recordingTime.toString())

      if (useCustomPrompt && customPrompt) {
        formData.append('customPrompt', customPrompt)
      } else if (selectedPrompt) {
        formData.append('promptId', selectedPrompt.id)
      }

      if (recordedBy) formData.append('recordedBy', recordedBy)
      if (title) formData.append('title', title)
      if (description) formData.append('description', description)
      if (selectedBranch && selectedBranch !== 'nest') {
        formData.append('branchId', selectedBranch)
      }

      const res = await fetch('/api/audio-sparks/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        alert('Audio Spark saved successfully!')
        onClose()
      } else {
        const data = await res.json()
        alert(`Error: ${data.error || 'Failed to save'}`)
      }
    } catch (error) {
      console.error('Error saving audio spark:', error)
      alert('Failed to save audio')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg-darker/95 flex items-center justify-center p-4">
      <div className="bg-bg-dark border border-firefly-dim/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-bg-dark border-b border-firefly-dim/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-firefly-glow">Audio Sparks ✨</h2>
            <p className="text-sm text-text-soft mt-1">
              Capture meaningful stories with guided prompts
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-soft hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Choose or create prompt */}
          {!audioBlob && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Choose a Prompt</h3>
                <button
                  onClick={() => setUseCustomPrompt(!useCustomPrompt)}
                  className="text-sm text-firefly-glow hover:text-firefly-bright transition-colors"
                >
                  {useCustomPrompt ? 'Use Library' : 'Create Custom'}
                </button>
              </div>

              {useCustomPrompt ? (
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Write your own prompt..."
                  className="w-full px-4 py-3 bg-bg-darker border border-firefly-dim/50 rounded-lg text-white placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-firefly-glow/50 resize-none"
                  rows={3}
                />
              ) : (
                <>
                  {/* Category filter */}
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          selectedCategory === cat
                            ? 'bg-firefly-glow text-bg-darker'
                            : 'bg-bg-darker text-text-soft hover:bg-firefly-dim/20'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Prompts list */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredPrompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        onClick={() => setSelectedPrompt(prompt)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                          selectedPrompt?.id === prompt.id
                            ? 'bg-firefly-dim/30 border-2 border-firefly-glow'
                            : 'bg-bg-darker border border-firefly-dim/20 hover:border-firefly-dim/50'
                        }`}
                      >
                        <p className="text-white">{prompt.question}</p>
                        {prompt.isFeatured && (
                          <span className="inline-block mt-1 text-xs text-firefly-glow">
                            ⭐ Featured
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Recording controls */}
          <div className="bg-bg-darker border border-firefly-dim/30 rounded-xl p-6 space-y-4">
            {/* Display selected prompt */}
            {(selectedPrompt || customPrompt) && !audioBlob && (
              <div className="p-4 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg">
                <p className="text-sm text-text-soft mb-1">Your Prompt:</p>
                <p className="text-white font-medium">
                  {useCustomPrompt ? customPrompt : selectedPrompt?.question}
                </p>
              </div>
            )}

            {/* Recording timer */}
            <div className="text-center">
              <div className="text-4xl font-mono text-firefly-glow">
                {formatTime(recordingTime)}
              </div>
              {isRecording && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-text-soft">Recording...</span>
                </div>
              )}
            </div>

            {/* Playback */}
            {audioUrl && (
              <div className="space-y-3">
                <audio src={audioUrl} controls className="w-full" />
                <button
                  onClick={resetRecording}
                  className="w-full px-4 py-2 bg-bg-dark border border-firefly-dim/50 rounded-lg text-text-soft hover:text-white hover:border-firefly-dim transition-all"
                >
                  Record Again
                </button>
              </div>
            )}

            {/* Recording buttons */}
            {!audioBlob && (
              <div className="flex gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!selectedPrompt && !customPrompt}
                    className="flex-1 py-3 bg-firefly-glow text-bg-darker font-medium rounded-lg hover:bg-firefly-bright transition-all disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    🎙️ Start Recording
                  </button>
                ) : (
                  <>
                    {!isPaused ? (
                      <button
                        onClick={pauseRecording}
                        className="flex-1 py-3 bg-yellow-500 text-bg-darker font-medium rounded-lg hover:bg-yellow-400 transition-all"
                      >
                        ⏸️ Pause
                      </button>
                    ) : (
                      <button
                        onClick={resumeRecording}
                        className="flex-1 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-400 transition-all"
                      >
                        ▶️ Resume
                      </button>
                    )}
                    <button
                      onClick={stopRecording}
                      className="flex-1 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-400 transition-all"
                    >
                      ⏹️ Stop
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Metadata form - only show after recording */}
          {audioBlob && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Add Details</h3>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Who's speaking? (optional)
                </label>
                <input
                  type="text"
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  placeholder="Papa, Nana, Mom, etc."
                  className="w-full px-4 py-2 bg-bg-darker border border-firefly-dim/50 rounded-lg text-white placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-firefly-glow/50"
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this memory a name"
                  className="w-full px-4 py-2 bg-bg-darker border border-firefly-dim/50 rounded-lg text-white placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-firefly-glow/50"
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any context or notes about this memory"
                  className="w-full px-4 py-2 bg-bg-darker border border-firefly-dim/50 rounded-lg text-white placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-firefly-glow/50 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm text-text-soft mb-2">
                  Save to:
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-darker border border-firefly-dim/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-firefly-glow/50"
                >
                  <option value="nest">The Nest (add to branch later)</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-firefly-glow text-bg-darker font-medium rounded-lg hover:bg-firefly-bright transition-all disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : '✨ Save Audio Spark'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

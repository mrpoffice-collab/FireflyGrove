'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TreasureChestModalProps {
  onClose: () => void
  onSave?: () => void
}

interface Prompt {
  id: string
  text: string
  category: string
}

export default function TreasureChestModal({ onClose, onSave }: TreasureChestModalProps) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [graceTokens, setGraceTokens] = useState(2)
  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcribing, setTranscribing] = useState(false)

  // Quick action chips
  const quickChips = [
    { label: 'Amen', value: 'amen', template: 'Amen. ' },
    { label: 'Note to Self', value: 'note_to_self', template: '' },
    { label: 'For My Kids', value: 'for_my_kids', template: 'For my kids: ' },
    { label: 'Gratitude', value: 'gratitude', template: "I'm grateful for " },
  ]

  // Load status and prompt
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch('/api/treasure/status')
        if (res.ok) {
          const data = await res.json()
          setPrompt(data.prompt)
          setStreak({ current: data.currentStreak, longest: data.longestStreak })
          setGraceTokens(data.graceTokensAvailable)
        }
      } catch (error) {
        console.error('Failed to load treasure status:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStatus()
  }, [])

  // Load user's branches
  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await fetch('/api/branches/list')
        if (res.ok) {
          const data = await res.json()
          setBranches(data.branches || [])
          // Auto-select "My Branch" if exists
          const myBranch = data.branches?.find((b: any) =>
            b.title.toLowerCase().includes('my branch') ||
            b.title.toLowerCase().includes('my tree')
          )
          if (myBranch) {
            setSelectedBranch(myBranch.id)
          }
        }
      } catch (error) {
        console.error('Failed to load branches:', error)
      }
    }

    loadBranches()
  }, [])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            // Auto-stop at 30 seconds
            stopRecording()
            return 30
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  // Start recording
  const startRecording = async () => {
    try {
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
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Could not access microphone. Please grant permission and try again.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  // Delete audio recording
  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setText('')
  }

  // Transcribe audio (optional - can be done on save)
  const transcribeAudio = async () => {
    if (!audioBlob) return

    setTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'treasure.webm')

      const res = await fetch('/api/treasure/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setText(data.transcript)
      } else {
        console.error('Transcription failed')
      }
    } catch (error) {
      console.error('Transcription error:', error)
    } finally {
      setTranscribing(false)
    }
  }

  const handleQuickChip = async (chip: typeof quickChips[0]) => {
    if (!prompt) return

    // For chips with templates, auto-save immediately
    if (chip.template) {
      await handleSave(chip.template, chip.value)
    } else {
      // For "Note to Self", just pre-fill
      setText(chip.template)
    }
  }

  const handleSave = async (textOverride?: string, chipUsed?: string) => {
    if (!prompt) return

    const finalText = textOverride || text
    if (!finalText.trim() && !audioBlob) return

    setSaving(true)

    try {
      let uploadedAudioUrl = null

      // Upload audio if exists
      if (audioBlob) {
        const formData = new FormData()
        formData.append('audio', audioBlob, 'treasure.webm')
        formData.append('type', 'treasure')

        const uploadRes = await fetch('/api/upload/audio', {
          method: 'POST',
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          uploadedAudioUrl = uploadData.url
        } else {
          alert('Failed to upload audio. Please try again.')
          setSaving(false)
          return
        }
      }

      const res = await fetch('/api/treasure/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: finalText.trim(),
          audioUrl: uploadedAudioUrl,
          promptId: prompt.id,
          promptText: prompt.text,
          category: prompt.category,
          branchId: selectedBranch || null,
          chipUsed,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setStreak({ current: data.streak.current, longest: data.streak.longest })
        setSuccess(true)
        onSave?.()

        // Close after showing success
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        alert('Failed to save treasure. Please try again.')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 max-w-lg w-full">
          <div className="text-center text-text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 max-w-lg w-full">
          <div className="text-center">
            <p className="text-text-muted mb-4">No prompts available yet.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded-lg transition-soft"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-bg-elevated border border-firefly-dim/50 rounded-lg p-8 max-w-lg w-full text-center">
          <div className="text-5xl mb-4">📜</div>
          <h3 className="text-xl text-text-soft mb-2">Treasure Saved</h3>
          <p className="text-text-muted text-sm mb-4">
            Tucked away safely in your Treasure Chest
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
            <span>🔥 {streak.current} day{streak.current !== 1 ? 's' : ''}</span>
            {streak.current === streak.longest && streak.current > 1 && (
              <span className="text-firefly-glow">✨ New record!</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-elevated border border-border-subtle rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-bg-elevated border-b border-border-subtle p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">📜</span>
                <h2 className="text-2xl font-light text-text-soft">Today's Treasure</h2>
              </div>
              <p className="text-text-muted text-sm italic">
                "{prompt.text}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-soft transition-soft ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Streak Display */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-text-muted">
              🔥 <span className="text-text-soft font-medium">{streak.current}</span> day streak
            </span>
            <span className="text-text-muted">
              ⭐ <span className="text-text-soft font-medium">{streak.longest}</span> longest
            </span>
            {graceTokens > 0 && (
              <span className="text-text-muted">
                🫶 <span className="text-text-soft font-medium">{graceTokens}</span> grace left
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Action Chips */}
          <div>
            <label className="block text-sm font-medium text-text-soft mb-2">
              Quick Save
            </label>
            <div className="flex flex-wrap gap-2">
              {quickChips.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => handleQuickChip(chip)}
                  disabled={saving}
                  className="px-4 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow border border-firefly-dim/40 rounded-lg text-sm font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Recording */}
          <div>
            <label className="block text-sm font-medium text-text-soft mb-2">
              Or record a voice message (15-30s)
            </label>

            {!audioUrl ? (
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={saving}
                    className="min-h-[44px] px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-lg text-sm font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Start Recording
                  </button>
                ) : (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-lg flex-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-400 font-medium">Recording... {recordingTime}s</span>
                      <div className="ml-auto text-xs text-red-400/70">{30 - recordingTime}s left</div>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="min-h-[44px] px-6 py-3 bg-bg-dark hover:bg-border-subtle text-text-soft rounded-lg text-sm font-medium transition-soft"
                    >
                      Stop
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Audio playback */}
                <div className="bg-bg-dark border border-border-subtle rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-5 h-5 text-firefly-glow" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    <span className="text-text-soft font-medium">Voice message recorded</span>
                  </div>
                  <audio src={audioUrl} controls className="w-full" />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={transcribeAudio}
                    disabled={transcribing || saving}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow border border-firefly-dim/40 rounded-lg text-sm font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {transcribing ? 'Transcribing...' : '✍️ Transcribe'}
                  </button>
                  <button
                    onClick={deleteAudio}
                    disabled={saving}
                    className="min-h-[44px] px-4 py-2 bg-bg-dark hover:bg-red-500/20 text-text-muted hover:text-red-400 border border-border-subtle hover:border-red-500/40 rounded-lg text-sm transition-soft disabled:opacity-50"
                  >
                    🗑️ Delete
                  </button>
                </div>

                {transcribing && (
                  <p className="text-xs text-text-muted">
                    💡 Transcribing your audio so you can edit or search it later...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-text-soft mb-2">
              Or write your own
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your wisdom, gratitude, or blessing..."
              rows={4}
              disabled={saving}
              className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder:text-placeholder focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft resize-y disabled:opacity-50"
            />
          </div>

          {/* Branch Assignment */}
          {branches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-soft mb-2">
                Assign to branch (optional)
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft disabled:opacity-50"
              >
                <option value="">My Treasures (no branch)</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-elevated border-t border-border-subtle p-6 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 bg-border-subtle hover:bg-text-muted/20 text-text-soft rounded-lg transition-soft disabled:opacity-50"
          >
            Not today
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving || (!text.trim() && !audioBlob)}
            className="flex-1 px-6 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Add to Treasure Chest'}
          </button>
        </div>

        {/* Helper Text */}
        <div className="px-6 pb-6">
          <p className="text-xs text-text-muted text-center">
            💡 Your treasure entries build a legacy of wisdom for your family
          </p>
        </div>
      </div>
    </div>
  )
}

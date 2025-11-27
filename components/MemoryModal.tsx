'use client'

import { useState, useRef, useEffect } from 'react'
import FocusTrap from 'focus-trap-react'

// Feature flag - disable video uploads
const ENABLE_VIDEO_UPLOADS = false

interface Branch {
  id: string
  title: string
  requiresApproval: boolean
  canBeTagged: boolean
}

interface MemoryModalProps {
  onClose: () => void
  onSave: (data: {
    text: string
    visibility: string
    legacyFlag: boolean
    mediaUrl?: string
    videoUrl?: string
    audioUrl?: string
    sharedBranchIds?: string[]
    memoryCard?: string | null
    parentMemoryId?: string
    contributorEmail?: string
    contributorName?: string
  }) => void
  spark: string
  onRefreshSpark?: () => void
  currentBranchId?: string
  prePopulatedPhoto?: {
    url: string
    mediaType?: string
    nestItemId?: string
  }
  isAdmin?: boolean
  parentMemoryId?: string
  threadType?: 'thread' | 'inspired'
  isOpenGrove?: boolean
  isAnonymous?: boolean
}

export default function MemoryModal({ onClose, onSave, spark, onRefreshSpark, currentBranchId, prePopulatedPhoto, isAdmin = false, parentMemoryId, threadType, isOpenGrove = false, isAnonymous = false }: MemoryModalProps) {
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState(isAnonymous ? 'SHARED' : 'PRIVATE')

  // Anonymous contributor info (for Open Grove)
  const [contributorEmail, setContributorEmail] = useState('')
  const [contributorName, setContributorName] = useState('')
  const [legacyFlag, setLegacyFlag] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    prePopulatedPhoto?.mediaType === 'photo' ? prePopulatedPhoto.url : null
  )
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(
    prePopulatedPhoto?.mediaType === 'video' ? prePopulatedPhoto.url : null
  )
  const [nestItemId, setNestItemId] = useState<string | undefined>(prePopulatedPhoto?.nestItemId)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [memoryCard, setMemoryCard] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)

  // Speech-to-text state
  const [isListening, setIsListening] = useState(false)
  const [isListeningMemoryCard, setIsListeningMemoryCard] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const memoryCardRecognitionRef = useRef<any>(null)

  // Cross-branch sharing state
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([])
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)

  // Nest photo selection state
  const [showNestSelector, setShowNestSelector] = useState(false)
  const [nestItems, setNestItems] = useState<any[]>([])
  const [loadingNestItems, setLoadingNestItems] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Store trigger element and restore focus on close
  useEffect(() => {
    setTriggerElement(document.activeElement as HTMLElement)

    return () => {
      if (triggerElement) {
        setTimeout(() => triggerElement.focus(), 0)
      }
    }
  }, [])

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setSpeechSupported(!!SpeechRecognition)
    }
  }, [])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showNestSelector) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, showNestSelector])

  // Fetch available branches for sharing
  useEffect(() => {
    async function fetchBranches() {
      if (!currentBranchId) return

      setLoadingBranches(true)
      try {
        const res = await fetch(`/api/branches/${currentBranchId}/shareable-branches`)
        if (res.ok) {
          const branches = await res.json()
          setAvailableBranches(branches)
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error)
      } finally {
        setLoadingBranches(false)
      }
    }

    fetchBranches()
  }, [currentBranchId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB for beta)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image file is too large. Please select an image under 5MB.')
        e.target.value = '' // Reset input
        return
      }

      setImage(file)
      setVideo(null) // Clear video if image is selected
      setVideoPreview(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 500MB for admin beta)
      const maxSize = 500 * 1024 * 1024 // 500MB in bytes
      if (file.size > maxSize) {
        alert('Video file is too large. Please select a video under 500MB.')
        e.target.value = '' // Reset input
        return
      }

      setVideo(file)
      setImage(null) // Clear image if video is selected
      setImagePreview(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

        // Validate audio size (max 10MB for beta)
        const maxSize = 10 * 1024 * 1024 // 10MB in bytes
        if (blob.size > maxSize) {
          alert('Audio recording is too large. Please record a shorter clip (under 10MB).')
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Speech-to-text functions
  const startListening = () => {
    if (!speechSupported) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Dedupe consecutive duplicate words (Android Chrome bug workaround)
      const dedupe = (text: string) => {
        const words = text.split(' ')
        return words.filter((word, i) => i === 0 || word !== words[i - 1]).join(' ')
      }

      if (finalTranscript) {
        setText(prev => {
          const newText = prev + dedupe(finalTranscript)
          return newText
        })
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // Speech-to-text for memory card field
  const startListeningMemoryCard = () => {
    if (!speechSupported) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListeningMemoryCard(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript

      // Dedupe consecutive duplicate words (Android Chrome bug workaround)
      const dedupe = (text: string) => {
        const words = text.split(' ')
        return words.filter((word, i) => i === 0 || word !== words[i - 1]).join(' ')
      }

      setMemoryCard(prev => {
        const newText = prev ? prev + ' ' + dedupe(transcript) : dedupe(transcript)
        return newText
      })
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListeningMemoryCard(false)
    }

    recognition.onend = () => {
      setIsListeningMemoryCard(false)
    }

    memoryCardRecognitionRef.current = recognition
    recognition.start()
  }

  const stopListeningMemoryCard = () => {
    if (memoryCardRecognitionRef.current) {
      memoryCardRecognitionRef.current.stop()
      setIsListeningMemoryCard(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isSubmitting) return

    // Validate email for anonymous contributors
    if (isAnonymous && !contributorEmail.trim()) {
      alert('Please enter your email address to contribute')
      return
    }

    setIsSubmitting(true)

    // For MVP, we'll store media as data URLs (in production, upload to storage)
    const data: any = {
      text: text.trim(),
      visibility: isAnonymous ? 'SHARED' : visibility, // Anonymous always shared
      legacyFlag: visibility === 'LEGACY' || legacyFlag,
      sharedBranchIds: selectedBranchIds,
      memoryCard: memoryCard.trim() || null,
      parentMemoryId: parentMemoryId || undefined,
      ...(isAnonymous && {
        contributorEmail: contributorEmail.trim(),
        contributorName: contributorName.trim() || undefined,
      }),
    }

    if (imagePreview) {
      data.mediaUrl = imagePreview
    }

    if (videoPreview) {
      data.videoUrl = videoPreview
    }

    if (audioUrl && audioBlob) {
      // Convert blob to data URL for demo
      const reader = new FileReader()
      reader.onloadend = async () => {
        data.audioUrl = reader.result as string

        // Delete nest item if this media came from the nest
        if (nestItemId) {
          try {
            await fetch(`/api/nest/${nestItemId}`, { method: 'DELETE' })
          } catch (error) {
            console.error('Failed to delete nest item:', error)
          }
        }

        onSave(data)
        // Note: setIsSubmitting is reset in parent component
      }
      reader.readAsDataURL(audioBlob)
      return
    }

    // Delete nest item if this media came from the nest
    if (nestItemId) {
      try {
        await fetch(`/api/nest/${nestItemId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Failed to delete nest item:', error)
      }
    }

    onSave(data)
    // Note: setIsSubmitting is reset in parent component
  }

  const toggleBranchSelection = (branchId: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    )
  }

  const openNestSelector = async () => {
    setShowNestSelector(true)
    setLoadingNestItems(true)
    try {
      const res = await fetch('/api/nest')
      if (res.ok) {
        const data = await res.json()
        setNestItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch nest items:', error)
    } finally {
      setLoadingNestItems(false)
    }
  }

  const selectNestPhoto = (item: any) => {
    if (item.mediaType === 'video') {
      setVideoPreview(item.videoUrl)
      setImagePreview(null)
      setImage(null)
    } else {
      setImagePreview(item.photoUrl)
      setVideoPreview(null)
      setVideo(null)
    }
    setNestItemId(item.id)
    setShowNestSelector(false)
  }

  const handleUseSpark = () => {
    // Append spark as a centered, bold prompt with colon
    const formattedSpark = `**${spark}:**`
    if (text.trim()) {
      setText(text + '\n\n' + formattedSpark + '\n\n')
    } else {
      setText(formattedSpark + '\n\n')
    }
  }

  const modalTitle = threadType === 'thread'
    ? '💬 Oh yeah, and...'
    : threadType === 'inspired'
    ? '💭 That reminds me of...'
    : 'New Memory'

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm touch-auto">
      <FocusTrap>
        <div
          className="bg-bg-dark border border-border-subtle rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-modal-title"
        >
          <h2 id="memory-modal-title" className="text-2xl text-text-soft mb-4 text-center">{modalTitle}</h2>

        {/* Spark Prompt with Actions */}
        <div className="mb-6 bg-bg-darker border border-firefly-dim/30 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-firefly-glow text-base font-medium italic flex-1">
              ✨ "{spark}"
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleUseSpark}
                className="px-2 py-1 bg-firefly-dim/20 border border-firefly-dim text-firefly-glow rounded text-xs hover:bg-firefly-dim/30 transition-soft"
              >
                Use This
              </button>
              {onRefreshSpark && (
                <button
                  type="button"
                  onClick={onRefreshSpark}
                  className="px-2 py-1 bg-bg-dark border border-border-subtle text-text-muted rounded text-xs hover:border-firefly-dim hover:text-firefly-glow transition-soft"
                  title="Get a different spark"
                  aria-label="Get a different spark"
                >
                  🔄
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Anonymous Contributor Info (Open Grove) */}
          {isAnonymous && (
            <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-4 space-y-3">
              <p className="text-firefly-glow text-sm font-medium">Share your connection</p>
              <div>
                <label htmlFor="contributorEmail" className="block text-sm text-text-soft mb-1">
                  Your Email <span className="text-error-text">*</span>
                </label>
                <input
                  id="contributorEmail"
                  type="email"
                  value={contributorEmail}
                  onChange={(e) => setContributorEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="contributorName" className="block text-sm text-text-soft mb-1">
                  Your Name <span className="text-text-muted">(optional)</span>
                </label>
                <input
                  id="contributorName"
                  type="text"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="How you knew them"
                  className="w-full px-3 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="text" className="block text-sm text-text-soft">
                Your Memory
              </label>
              {speechSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`min-h-[36px] px-3 py-1.5 rounded text-xs font-medium transition-soft flex items-center gap-1.5 ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-bg-darker border border-firefly-dim text-firefly-glow hover:bg-firefly-dim hover:text-bg-dark'
                  }`}
                  aria-label={isListening ? 'Stop speech-to-text' : 'Start speech-to-text'}
                >
                  <span>🎤</span>
                  <span>{isListening ? 'Stop' : 'Speak'}</span>
                </button>
              )}
            </div>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write what comes to mind..."
              className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft resize-none touch-auto"
              style={{ touchAction: 'manipulation' }}
              rows={6}
              autoFocus
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-text-soft">
                When was this? <span className="text-text-muted text-xs">(optional)</span>
              </label>
              {speechSupported && (
                <button
                  type="button"
                  onClick={isListeningMemoryCard ? stopListeningMemoryCard : startListeningMemoryCard}
                  className={`min-h-[36px] px-3 py-1.5 rounded text-xs font-medium transition-soft flex items-center gap-1.5 ${
                    isListeningMemoryCard
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-bg-darker border border-firefly-dim text-firefly-glow hover:bg-firefly-dim hover:text-bg-dark'
                  }`}
                  aria-label={isListeningMemoryCard ? 'Stop speech-to-text' : 'Start speech-to-text'}
                >
                  <span>🎤</span>
                  <span>{isListeningMemoryCard ? 'Stop' : 'Speak'}</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={memoryCard}
              onChange={(e) => setMemoryCard(e.target.value)}
              placeholder='Before college, "That summer with Nana," When the twins were little, 10/19/2025...'
              className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm text-text-soft mb-2">
              Add Media <span className="text-text-muted text-xs">(Photo: 5MB max{isAdmin ? ' • Video: 500MB max' : ''})</span>
            </label>
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!!videoPreview}
                className="flex-1 px-3 py-1.5 bg-bg-darker border border-firefly-dim text-firefly-glow rounded hover:bg-firefly-dim hover:text-bg-dark transition-soft text-sm disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
                aria-label="Choose photo file"
              >
                📁 Choose Photo
              </button>
              <button
                type="button"
                onClick={openNestSelector}
                className="flex-1 px-3 py-1.5 bg-bg-darker border border-firefly-dim text-firefly-glow rounded hover:bg-firefly-dim hover:text-bg-dark transition-soft text-sm"
                aria-label="Choose media from your nest"
              >
                🪺 Choose from Nest
              </button>
            </div>
            {ENABLE_VIDEO_UPLOADS && isAdmin && (
              <div className="flex gap-3 mt-2">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={!!imagePreview}
                  className="w-full px-3 py-1.5 bg-purple-900/20 border border-purple-500/50 text-purple-300 rounded hover:bg-purple-900/30 transition-soft text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Choose video file (Admin beta feature)"
                >
                  🎥 Choose Video (Admin Beta)
                </button>
              </div>
            )}
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-lg max-h-48 object-cover"
                />
              </div>
            )}
            {ENABLE_VIDEO_UPLOADS && videoPreview && (
              <div className="mt-3">
                <video
                  src={videoPreview}
                  controls
                  className="rounded-lg max-h-48 w-full"
                />
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-border-subtle my-2"></div>

          <div>
            <label className="block text-sm text-text-soft mb-2">
              Record Audio <span className="text-text-muted text-xs">(max 10MB)</span>
            </label>
            <div className="flex gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={!!audioUrl}
                  className="px-3 py-1.5 bg-bg-darker border border-firefly-dim text-firefly-glow rounded hover:bg-firefly-dim hover:text-bg-dark transition-soft disabled:bg-gray-700 disabled:text-gray-500 text-sm"
                  aria-label={audioUrl ? 'Audio recording saved' : 'Start audio recording'}
                >
                  {audioUrl ? 'Recording Saved' : 'Start Recording'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-soft animate-pulse text-sm"
                  aria-label="Stop audio recording"
                >
                  Stop Recording
                </button>
              )}
            </div>
            {audioUrl && (
              <div className="mt-3">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/webm" />
                </audio>
              </div>
            )}
          </div>

          {/* Cross-Branch Sharing */}
          {availableBranches.length > 0 && (
            <div>
              <label className="block text-sm text-text-soft mb-2">
                Also share with... (optional)
              </label>
              <p className="text-text-muted text-xs mb-3">
                Share this memory with other branches in your grove
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-bg-darker rounded border border-border-subtle">
                {loadingBranches ? (
                  <div className="text-text-muted text-sm">Loading branches...</div>
                ) : (
                  availableBranches.map((branch) => (
                    <label
                      key={branch.id}
                      className="flex items-start gap-2 cursor-pointer p-2 hover:bg-bg-dark rounded transition-soft"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBranchIds.includes(branch.id)}
                        onChange={() => toggleBranchSelection(branch.id)}
                        disabled={!branch.canBeTagged}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-text-soft text-sm">{branch.title}</div>
                        {!branch.canBeTagged && (
                          <div className="text-warning-text text-xs">Cannot be tagged</div>
                        )}
                        {branch.requiresApproval && branch.canBeTagged && (
                          <div className="text-text-muted text-xs">Requires approval</div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
              {selectedBranchIds.length > 0 && (
                <p className="text-firefly-glow text-xs mt-2">
                  Will appear in {selectedBranchIds.length + 1} {selectedBranchIds.length === 0 ? 'branch' : 'branches'}
                </p>
              )}
            </div>
          )}

          {/* Hide visibility options for anonymous users - they're always shared */}
          {!isAnonymous && (
            <div>
              <label className="block text-sm text-text-soft mb-2">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    checked={visibility === 'PRIVATE'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-firefly-glow"
                  />
                  <span className="text-text-soft">Private - Only you can see this</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="SHARED"
                    checked={visibility === 'SHARED'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-firefly-glow"
                  />
                  <span className="text-text-soft">Shared - Visible to branch members</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="LEGACY"
                    checked={visibility === 'LEGACY'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-firefly-glow"
                  />
                  <span className="text-text-soft">Legacy - Hidden until release</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-1.5 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-1.5 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Memory'}
            </button>
          </div>
        </form>
        </div>
      </FocusTrap>

      {/* Nest Photo Selector Modal */}
      {showNestSelector && (
        <FocusTrap>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div
            className="bg-bg-dark border border-border-subtle rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nest-selector-title"
          >
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 id="nest-selector-title" className="text-xl text-text-soft">Choose from Nest</h3>
                <p className="text-text-muted text-sm mt-1">Select media from your nest</p>
              </div>
              <button
                onClick={() => setShowNestSelector(false)}
                className="text-text-muted hover:text-text-soft transition-soft"
                aria-label="Close nest selector"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingNestItems ? (
                <div className="text-center text-text-muted py-12">
                  Loading nest items...
                </div>
              ) : nestItems.length === 0 ? (
                <div className="text-center text-text-muted py-12">
                  <div className="text-4xl mb-3">🪺</div>
                  <p>Your nest is empty</p>
                  <p className="text-sm mt-2">Upload media to the nest first</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {nestItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectNestPhoto(item)}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-firefly-glow transition-all group cursor-pointer"
                      aria-label={`Select ${item.mediaType === 'video' ? 'video' : 'photo'} ${item.filename}`}
                    >
                      {item.mediaType === 'video' ? (
                        <>
                          <video
                            src={item.videoUrl}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            🎥 Video
                          </div>
                        </>
                      ) : (
                        <img
                          src={item.photoUrl}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </FocusTrap>
      )}
    </div>
  )
}

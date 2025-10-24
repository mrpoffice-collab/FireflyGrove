'use client'

import { useState, useRef, useEffect } from 'react'

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
    audioUrl?: string
    sharedBranchIds?: string[]
  }) => void
  prompt: string
  currentBranchId?: string
}

export default function MemoryModal({ onClose, onSave, prompt, currentBranchId }: MemoryModalProps) {
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState('PRIVATE')
  const [legacyFlag, setLegacyFlag] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cross-branch sharing state
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([])
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

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
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isSubmitting) return

    setIsSubmitting(true)

    // For MVP, we'll store media as data URLs (in production, upload to storage)
    const data: any = {
      text: text.trim(),
      visibility,
      legacyFlag: visibility === 'LEGACY' || legacyFlag,
      sharedBranchIds: selectedBranchIds,
    }

    if (imagePreview) {
      data.mediaUrl = imagePreview
    }

    if (audioUrl && audioBlob) {
      // Convert blob to data URL for demo
      const reader = new FileReader()
      reader.onloadend = () => {
        data.audioUrl = reader.result as string
        onSave(data)
        // Note: setIsSubmitting is reset in parent component
      }
      reader.readAsDataURL(audioBlob)
      return
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

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-2xl text-text-soft mb-2">New Memory</h2>
        <p className="text-text-muted text-sm italic mb-6">"{prompt}"</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="text" className="block text-sm text-text-soft mb-2">
              Your Memory
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write what comes to mind..."
              className="w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
              rows={6}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-soft mb-2">
              Add a Photo <span className="text-text-muted text-xs">(max 5MB)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-firefly-dim file:text-bg-dark hover:file:bg-firefly-glow transition-soft"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-lg max-h-48 object-cover"
                />
              </div>
            )}
          </div>

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
                  className="px-4 py-2 bg-bg-darker border border-firefly-dim text-firefly-glow rounded hover:bg-firefly-dim hover:text-bg-dark transition-soft disabled:opacity-50"
                >
                  {audioUrl ? 'Recording Saved' : 'Start Recording'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-soft animate-pulse"
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
                          <div className="text-orange-400 text-xs">Cannot be tagged</div>
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

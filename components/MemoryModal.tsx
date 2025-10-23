'use client'

import { useState, useRef } from 'react'

interface MemoryModalProps {
  onClose: () => void
  onSave: (data: {
    text: string
    visibility: string
    legacyFlag: boolean
    mediaUrl?: string
    audioUrl?: string
  }) => void
  prompt: string
}

export default function MemoryModal({ onClose, onSave, prompt }: MemoryModalProps) {
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState('PRIVATE')
  const [legacyFlag, setLegacyFlag] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
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
              Add a Photo
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
              Record Audio
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

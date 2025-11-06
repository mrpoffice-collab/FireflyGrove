'use client'

import { useState, useRef, useEffect } from 'react'

interface SpeechToTextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
  rows?: number
  required?: boolean
  id?: string
  label?: string
  type?: 'textarea' | 'input'
}

export default function SpeechToTextInput({
  value,
  onChange,
  placeholder = '',
  maxLength,
  className = '',
  rows = 4,
  required = false,
  id,
  label,
  type = 'textarea',
}: SpeechToTextInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setSpeechSupported(!!SpeechRecognition)
    }
  }, [])

  const startListening = () => {
    if (!speechSupported) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    // For textarea, use continuous mode. For input, use single recognition
    recognition.continuous = type === 'textarea'
    recognition.interimResults = type === 'textarea'
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        }
      }

      // Dedupe consecutive duplicate words (Android Chrome bug workaround)
      const dedupe = (text: string) => {
        const words = text.split(' ')
        return words.filter((word, i) => i === 0 || word !== words[i - 1]).join(' ')
      }

      if (finalTranscript) {
        const deduped = dedupe(finalTranscript)
        onChange(value ? value + deduped : deduped)
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

  const baseInputClasses = "w-full px-4 py-3 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 transition-soft touch-auto"
  const textareaClasses = `${baseInputClasses} resize-none`

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={id} className="block text-sm text-text-soft">
            {label}
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
      )}

      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${textareaClasses} ${className}`}
          style={{ touchAction: 'manipulation' }}
          rows={rows}
          required={required}
          maxLength={maxLength}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${baseInputClasses} ${className}`}
          required={required}
          maxLength={maxLength}
        />
      )}
    </div>
  )
}

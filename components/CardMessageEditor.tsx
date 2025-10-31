'use client'

interface CardMessageEditorProps {
  message: string
  onChange: (message: string) => void
  maxLength?: number
}

export default function CardMessageEditor({
  message,
  onChange,
  maxLength = 500,
}: CardMessageEditorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-text-soft text-sm font-medium">
          Your Message *
        </label>
        <span className="text-text-muted text-xs">
          {message.length} / {maxLength}
        </span>
      </div>

      <textarea
        value={message}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onChange(e.target.value)
          }
        }}
        placeholder="Share your heartfelt message..."
        rows={6}
        className="w-full px-4 py-3 bg-[#1a1a1a] border border-border-subtle rounded text-white placeholder:text-placeholder focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 resize-none"
      />

      {/* Suggested Phrases */}
      <div className="mt-3">
        <p className="text-text-muted text-xs mb-2">Suggested phrases:</p>
        <div className="flex flex-wrap gap-2">
          {getSuggestedPhrases(message).map((phrase, index) => (
            <button
              key={index}
              onClick={() => {
                const newMessage = message ? `${message}\n\n${phrase}` : phrase
                if (newMessage.length <= maxLength) {
                  onChange(newMessage)
                }
              }}
              className="px-3 py-1 text-xs bg-bg-elevated border border-border-subtle rounded hover:border-firefly-dim text-text-muted hover:text-text-soft transition-soft"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function getSuggestedPhrases(currentMessage: string): string[] {
  // Simple suggestions - could be made context-aware based on card category
  const phrases = [
    'Thinking of you during this difficult time.',
    'Wishing you peace and comfort.',
    'You are in my thoughts and prayers.',
    'Sending love and light your way.',
    'May beautiful memories bring you comfort.',
  ]

  // Filter out phrases already in message
  return phrases.filter((phrase) => !currentMessage.includes(phrase)).slice(0, 3)
}

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
    if (!finalText.trim()) return

    setSaving(true)

    try {
      const res = await fetch('/api/treasure/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: finalText.trim(),
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
            disabled={saving || !text.trim()}
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

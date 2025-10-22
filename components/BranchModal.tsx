'use client'

import { useState } from 'react'

interface BranchModalProps {
  onClose: () => void
  onSave: (title: string, description: string) => void
}

export default function BranchModal({ onClose, onSave }: BranchModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSave(title.trim(), description.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl text-text-soft mb-6">Create New Branch</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm text-text-soft mb-2">
              Who or what is this branch for?
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grandma Rose, College Days, Mom"
              className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-text-soft mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A few words about this person or time..."
              className="w-full px-4 py-2 bg-bg-darker border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim transition-soft resize-none"
              rows={3}
            />
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
              className="flex-1 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
            >
              Create Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

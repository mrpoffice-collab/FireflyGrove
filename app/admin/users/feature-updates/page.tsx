'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function FeatureUpdatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [targetAudience, setTargetAudience] = useState('mvp')
  const [updates, setUpdates] = useState([
    { emoji: '', title: '', description: '' }
  ])
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Redirect if not admin
  const isAdmin = (session?.user as any)?.isAdmin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/')
    return null
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  const addUpdate = () => {
    setUpdates([...updates, { emoji: '', title: '', description: '' }])
  }

  const removeUpdate = (index: number) => {
    setUpdates(updates.filter((_, i) => i !== index))
  }

  const updateField = (index: number, field: string, value: string) => {
    const newUpdates = [...updates]
    newUpdates[index] = { ...newUpdates[index], [field]: value }
    setUpdates(newUpdates)
  }

  const handleSend = async () => {
    // Validate
    const validUpdates = updates.filter(u => u.emoji && u.title && u.description)
    if (validUpdates.length === 0) {
      alert('Please fill in at least one complete update')
      return
    }

    if (!confirm(`Send feature update to ${targetAudience} users?\n\nThis will send emails to all matching users.`)) {
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/send-feature-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: validUpdates,
          targetAudience,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        alert(`✅ Feature update sent!\n\nSent: ${data.results.sent}\nFailed: ${data.results.failed}`)
      } else {
        const error = await res.json()
        alert(`❌ Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending updates:', error)
      alert('Failed to send feature updates')
    } finally {
      setSending(false)
    }
  }

  // Quick fill for current updates
  const fillCurrentUpdates = () => {
    setUpdates([
      {
        emoji: '✨',
        title: 'Firefly Glow - Collective Memory Power',
        description: 'Memories now glow brighter with each person who witnesses them. Add your glow to celebrate moments that matter, and watch them shine with exponential power (✨³, ✨⁵, and beyond!). It\'s not a like - it\'s saying "I witnessed this."'
      },
      {
        emoji: '💬',
        title: 'Memory Threading - "Oh yeah, and..."',
        description: 'Start conversations right where memories happen! Add threaded replies to memories about the same person or topic. Perfect for "Oh yeah, and remember when..." moments that build on each other.'
      },
      {
        emoji: '💭',
        title: 'Inspired Memories - "That reminds me of..."',
        description: 'One memory sparks another! When a memory reminds you of a different story or person, create an inspired memory. Connect moments across relationships and branches.'
      },
      {
        emoji: '🏡',
        title: 'Shared Branches Visibility',
        description: 'See all the branches you\'ve been invited to from other groves in one place! Your Grove page now shows a "Shared with You" section, making cross-grove collaboration easier than ever.'
      }
    ])
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-soft">
      <Header
        userName={session?.user?.name || ''}
        isBetaTester={(session?.user as any)?.isBetaTester || false}
        isAdmin={(session?.user as any)?.isAdmin || false}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 text-sm text-text-muted">
            <a href="/admin" className="hover:text-firefly-glow transition-soft">Admin</a>
            <span className="mx-2">/</span>
            <span>Users & Community</span>
            <span className="mx-2">/</span>
            <span className="text-text-soft">Feature Updates</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl text-text-soft mb-2">📧 Feature Update Emails</h1>
            <p className="text-text-muted">
              Send feature roundup emails to users
            </p>
          </div>

          {/* Target Audience */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-6">
            <h2 className="text-xl text-text-soft mb-4">Target Audience</h2>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft"
            >
              <option value="mvp">MVP Users (Beta testers + users with memories)</option>
              <option value="beta">Beta Testers Only</option>
              <option value="subscribed">Subscribed Users Only</option>
              <option value="all">All Active Users</option>
            </select>
          </div>

          {/* Quick Fill */}
          <div className="mb-6">
            <button
              onClick={fillCurrentUpdates}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded transition-soft"
            >
              📝 Fill Current Updates (Glow + Threading + Shared Branches)
            </button>
          </div>

          {/* Feature Updates */}
          <div className="space-y-4 mb-6">
            {updates.map((update, index) => (
              <div key={index} className="bg-bg-dark border border-border-subtle rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg text-text-soft">Feature {index + 1}</h3>
                  {updates.length > 1 && (
                    <button
                      onClick={() => removeUpdate(index)}
                      className="text-error-text hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Emoji</label>
                    <input
                      type="text"
                      value={update.emoji}
                      onChange={(e) => updateField(index, 'emoji', e.target.value)}
                      placeholder="✨"
                      maxLength={2}
                      className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft text-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-2">Title</label>
                    <input
                      type="text"
                      value={update.title}
                      onChange={(e) => updateField(index, 'title', e.target.value)}
                      placeholder="Feature Name"
                      className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-2">Description</label>
                    <textarea
                      value={update.description}
                      onChange={(e) => updateField(index, 'description', e.target.value)}
                      placeholder="Describe the feature and how it helps users..."
                      rows={4}
                      className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addUpdate}
              className="w-full py-3 border-2 border-dashed border-border-subtle rounded-lg text-text-muted hover:border-firefly-dim hover:text-firefly-dim transition-soft"
            >
              + Add Another Feature
            </button>
          </div>

          {/* Send Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 py-4 bg-firefly-dim hover:bg-firefly-glow disabled:bg-gray-600 disabled:cursor-not-allowed text-bg-dark rounded-lg font-medium text-lg transition-soft"
            >
              {sending ? 'Sending...' : '📧 Send Feature Update'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-lg text-success-text mb-2">✅ Emails Sent!</h3>
              <div className="text-text-muted text-sm space-y-1">
                <p>Total recipients: {result.results.total}</p>
                <p>Successfully sent: {result.results.sent}</p>
                <p>Failed: {result.results.failed}</p>
              </div>
              {result.results.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-error-text text-sm mb-2">Errors:</p>
                  <div className="text-xs text-text-muted max-h-40 overflow-y-auto">
                    {result.results.errors.map((error: string, i: number) => (
                      <div key={i}>{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

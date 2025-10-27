'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

interface TopicScore {
  id: string
  topic: string
  primaryKeyword: string
  confidenceScore: number
  estimatedUsers: number
  status: string
  reasoningNotes: string
  demandScore: number
  competitionScore: number
  relevanceScore: number
}

export default function TopicsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topics, setTopics] = useState<TopicScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())

  // Batch generation settings
  const [showBatchPanel, setShowBatchPanel] = useState(false)
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [blogCount, setBlogCount] = useState(1)
  const [newsletterCount, setNewsletterCount] = useState(1)
  const [facebookCount, setFacebookCount] = useState(2)
  const [pinterestCount, setPinterestCount] = useState(3)
  const [redditCount, setRedditCount] = useState(2)
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [intervalDays, setIntervalDays] = useState(7)

  // Form state for scoring new topics
  const [showScoreForm, setShowScoreForm] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [scoring, setScoring] = useState(false)

  // Automated generation
  const [generating, setGenerating] = useState(false)
  const [genCount, setGenCount] = useState(20)
  const [genMinConfidence, setGenMinConfidence] = useState(65)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchTopics()
    }
  }, [status, router])

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/marketing/topics?minConfidence=0')
      if (res.ok) {
        const data = await res.json()
        setTopics(data.topics)
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const scoreTopic = async () => {
    if (!newTopic || !newKeyword) return

    setScoring(true)
    try {
      const res = await fetch('/api/marketing/topics/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newTopic,
          primaryKeyword: newKeyword,
          description: newDescription,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTopics([data.topicScore, ...topics])
        setNewTopic('')
        setNewKeyword('')
        setNewDescription('')
        setShowScoreForm(false)
      } else {
        alert('Failed to score topic')
      }
    } catch (error) {
      console.error('Error scoring topic:', error)
      alert('Error scoring topic')
    } finally {
      setScoring(false)
    }
  }

  const autoGenerateTopics = async () => {
    if (!confirm(`Generate ${genCount} topics with AI? (min ${genMinConfidence}% confidence)`)) return

    setGenerating(true)
    try {
      const res = await fetch('/api/marketing/topics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: genCount,
          minConfidence: genMinConfidence,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ ${data.message}\n\nEstimated ${data.stats.totalEstimatedUsers} total users from these topics!`)
        fetchTopics() // Refresh to show new topics
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to generate topics')
      }
    } catch (error) {
      console.error('Error generating topics:', error)
      alert('Error generating topics')
    } finally {
      setGenerating(false)
    }
  }

  const toggleSelection = (topicId: string) => {
    const newSelection = new Set(selectedTopics)
    if (newSelection.has(topicId)) {
      newSelection.delete(topicId)
    } else {
      newSelection.add(topicId)
    }
    setSelectedTopics(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedTopics.size === topics.length) {
      setSelectedTopics(new Set())
    } else {
      setSelectedTopics(new Set(topics.map((t) => t.id)))
    }
  }

  const batchGenerate = async () => {
    if (selectedTopics.size === 0) {
      alert('No topics selected')
      return
    }

    const totalPosts =
      selectedTopics.size *
      (blogCount + newsletterCount + facebookCount + pinterestCount + redditCount)

    if (
      !confirm(
        `Generate ${totalPosts} total pieces of content from ${selectedTopics.size} topics?\n\n` +
          `Per topic:\n` +
          `• ${blogCount} blog post\n` +
          `• ${newsletterCount} newsletter\n` +
          `• ${facebookCount} Facebook posts\n` +
          `• ${pinterestCount} Pinterest pins\n` +
          `• ${redditCount} Reddit posts\n\n` +
          `Starting ${startDate}, main posts every ${intervalDays} days`
      )
    )
      return

    setBatchGenerating(true)
    try {
      const res = await fetch('/api/marketing/topics/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicIds: Array.from(selectedTopics),
          formats: {
            blog: blogCount,
            newsletter: newsletterCount,
            facebook: facebookCount,
            pinterest: pinterestCount,
            reddit: redditCount,
          },
          startDate,
          intervalDays,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ ${data.message}\n\nCheck Draft Posts in Marketing Intelligence!`)
        setSelectedTopics(new Set())
        setShowBatchPanel(false)
        fetchTopics() // Refresh
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Error batch generating:', error)
      alert('Error generating content')
    } finally {
      setBatchGenerating(false)
    }
  }

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Delete this topic? This cannot be undone.')) return

    try {
      const res = await fetch(`/api/marketing/topics/${topicId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Topic deleted')
        setTopics(topics.filter((t) => t.id !== topicId))
        const newSelection = new Set(selectedTopics)
        newSelection.delete(topicId)
        setSelectedTopics(newSelection)
      } else {
        alert('Failed to delete topic')
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
      alert('Error deleting topic')
    }
  }

  const generateBrief = async (topicId: string) => {
    if (!confirm('Generate content brief for this topic?')) return

    try {
      const res = await fetch('/api/marketing/briefs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicScoreId: topicId }),
      })

      if (res.ok) {
        alert('Brief generated successfully!')
        fetchTopics() // Refresh to show updated status
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to generate brief')
      }
    } catch (error) {
      console.error('Error generating brief:', error)
      alert('Error generating brief')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Loading topics...</div>
        </div>
      </div>
    )
  }

  const highConfidence = topics.filter((t) => t.confidenceScore >= 80)
  const mediumConfidence = topics.filter(
    (t) => t.confidenceScore >= 65 && t.confidenceScore < 80
  )

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header userName={session?.user?.name || ''} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketing-genius"
            className="text-firefly-glow hover:text-firefly-dim text-sm mb-2 inline-block"
          >
            ← Back to Marketing Intelligence
          </Link>
          <h1 className="text-4xl font-light text-text-soft mb-3">
            🎯 Topic Intelligence
          </h1>
          <p className="text-text-muted text-lg">
            Score and prioritize content topics for maximum impact
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-elevated border border-green-500/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">High Confidence</div>
            <div className="text-3xl font-light text-green-400">
              {highConfidence.length}
            </div>
            <div className="text-text-muted text-xs">80%+ success rate</div>
          </div>
          <div className="bg-bg-elevated border border-yellow-500/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Medium Confidence</div>
            <div className="text-3xl font-light text-yellow-400">
              {mediumConfidence.length}
            </div>
            <div className="text-text-muted text-xs">65-80% success rate</div>
          </div>
          <div className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-4">
            <div className="text-text-muted text-sm mb-1">Est. Users (Total)</div>
            <div className="text-3xl font-light text-firefly-glow">
              {topics.reduce((sum, t) => sum + (t.estimatedUsers || 0), 0)}
            </div>
            <div className="text-text-muted text-xs">From all topics</div>
          </div>
        </div>

        {/* Automated Generation */}
        <div className="mb-8 bg-gradient-to-r from-green-500/10 to-firefly-glow/10 border border-green-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-light text-text-soft mb-2">🤖 Automated Topic Generation</h2>
          <p className="text-text-muted mb-6">
            Let AI generate and score {genCount} topic ideas, keeping only winners with {genMinConfidence}%+ confidence
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-text-muted text-sm mb-2">Topics to Generate</label>
              <input
                type="number"
                value={genCount}
                onChange={(e) => setGenCount(parseInt(e.target.value))}
                min="10"
                max="50"
                className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
              />
            </div>
            <div>
              <label className="block text-text-muted text-sm mb-2">Min. Confidence (%)</label>
              <input
                type="number"
                value={genMinConfidence}
                onChange={(e) => setGenMinConfidence(parseInt(e.target.value))}
                min="50"
                max="90"
                className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={autoGenerateTopics}
                disabled={generating}
                className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-soft"
              >
                {generating ? '🎯 Generating...' : '🚀 Generate Topics'}
              </button>
            </div>
          </div>

          <div className="text-xs text-text-muted">
            AI will brainstorm {genCount} topics, score them, and save only the ones above {genMinConfidence}% confidence. Typical success rate: 40-60% pass the filter.
          </div>
        </div>

        {/* Manual Scoring */}
        <div className="mb-8">
          <button
            onClick={() => setShowScoreForm(!showScoreForm)}
            className="px-6 py-3 bg-bg-elevated hover:bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
          >
            {showScoreForm ? 'Cancel' : '+ Score Topic Manually'}
          </button>
        </div>

        {/* Score Form */}
        {showScoreForm && (
          <div className="mb-8 bg-bg-elevated border border-border-subtle rounded-xl p-6">
            <h3 className="text-xl text-text-soft font-medium mb-4">
              Score a New Topic
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-text-soft text-sm font-medium mb-2">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g., Recording Your Grandmother's Stories"
                  className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                />
              </div>
              <div>
                <label className="block text-text-soft text-sm font-medium mb-2">
                  Primary Keyword
                </label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g., how to record grandparents stories"
                  className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                />
              </div>
              <div>
                <label className="block text-text-soft text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of what this topic will cover..."
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                />
              </div>
              <button
                onClick={scoreTopic}
                disabled={scoring || !newTopic || !newKeyword}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-soft"
              >
                {scoring ? 'Scoring...' : 'Score Topic'}
              </button>
            </div>
          </div>
        )}

        {/* Batch Actions */}
        {topics.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedTopics.size === topics.length && topics.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-border-subtle bg-bg-dark"
                />
                <div>
                  <h3 className="text-lg text-text-soft font-medium">
                    {selectedTopics.size === 0
                      ? 'Select topics to generate content'
                      : `${selectedTopics.size} selected`}
                  </h3>
                  {selectedTopics.size > 0 && (
                    <p className="text-sm text-text-muted">
                      Est. {topics.filter((t) => selectedTopics.has(t.id)).reduce((sum, t) => sum + (t.estimatedUsers || 0), 0)} total users
                    </p>
                  )}
                </div>
              </div>
              {selectedTopics.size > 0 && (
                <button
                  onClick={() => setShowBatchPanel(!showBatchPanel)}
                  className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                >
                  {showBatchPanel ? 'Cancel' : '📝 Generate Content'}
                </button>
              )}
            </div>

            {/* Batch Generation Panel */}
            {showBatchPanel && selectedTopics.size > 0 && (
              <div className="mt-6 p-6 bg-bg-dark rounded-lg border border-border-subtle">
                <h4 className="text-text-soft font-medium mb-4">Content Repurposing Settings</h4>
                <p className="text-text-muted text-sm mb-6">
                  One blog post per topic will be created, then repurposed into multiple platform-specific pieces
                </p>

                {/* Format Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-bg-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-text-soft text-sm font-medium">📝 Blog Post</label>
                      <span className="text-xs text-green-400">Main content</span>
                    </div>
                    <input
                      type="number"
                      value={blogCount}
                      onChange={(e) => setBlogCount(parseInt(e.target.value))}
                      min="1"
                      max="1"
                      disabled
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                    <div className="text-xs text-text-muted mt-1">Always 1 (source)</div>
                  </div>

                  <div className="p-4 bg-bg-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-text-soft text-sm font-medium">📧 Newsletter</label>
                      <span className="text-xs text-text-muted">Email</span>
                    </div>
                    <input
                      type="number"
                      value={newsletterCount}
                      onChange={(e) => setNewsletterCount(parseInt(e.target.value))}
                      min="0"
                      max="1"
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                    <div className="text-xs text-text-muted mt-1">0 = skip, 1 = generate</div>
                  </div>

                  <div className="p-4 bg-bg-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-text-soft text-sm font-medium">👤 Facebook</label>
                      <span className="text-xs text-text-muted">Personal</span>
                    </div>
                    <input
                      type="number"
                      value={facebookCount}
                      onChange={(e) => setFacebookCount(parseInt(e.target.value))}
                      min="0"
                      max="5"
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                    <div className="text-xs text-text-muted mt-1">Different angles</div>
                  </div>

                  <div className="p-4 bg-bg-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-text-soft text-sm font-medium">📌 Pinterest</label>
                      <span className="text-xs text-text-muted">Pins</span>
                    </div>
                    <input
                      type="number"
                      value={pinterestCount}
                      onChange={(e) => setPinterestCount(parseInt(e.target.value))}
                      min="0"
                      max="5"
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                    <div className="text-xs text-text-muted mt-1">Multiple pins</div>
                  </div>

                  <div className="p-4 bg-bg-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-text-soft text-sm font-medium">💬 Reddit</label>
                      <span className="text-xs text-text-muted">Subreddits</span>
                    </div>
                    <input
                      type="number"
                      value={redditCount}
                      onChange={(e) => setRedditCount(parseInt(e.target.value))}
                      min="0"
                      max="5"
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                    <div className="text-xs text-text-muted mt-1">Different subreddits</div>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-bg-elevated rounded-lg">
                  <div>
                    <label className="block text-text-muted text-sm mb-2">Start Date (Blog Posts)</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted text-sm mb-2">Days Between Blog Posts</label>
                    <input
                      type="number"
                      value={intervalDays}
                      onChange={(e) => setIntervalDays(parseInt(e.target.value))}
                      min="1"
                      max="30"
                      className="w-full px-4 py-2 bg-bg-dark border border-border-subtle rounded-lg text-text-soft"
                    />
                  </div>
                </div>

                {/* Summary & Action */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text-muted">
                    Will generate {selectedTopics.size * (blogCount + newsletterCount + facebookCount + pinterestCount + redditCount)} total pieces from {selectedTopics.size} topics
                  </div>
                  <button
                    onClick={batchGenerate}
                    disabled={batchGenerating}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-soft"
                  >
                    {batchGenerating ? '✍️ Writing...' : '🚀 Generate All'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topics List */}
        <div className="space-y-4">
          {topics.length === 0 ? (
            <div className="text-center py-12 bg-bg-elevated rounded-xl border border-border-subtle">
              <p className="text-text-muted">
                No topics yet. Score your first topic to get started!
              </p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-firefly-dim/50 transition-soft"
              >
                <div className="flex items-start gap-4 mb-4">
                  <input
                    type="checkbox"
                    checked={selectedTopics.has(topic.id)}
                    onChange={() => toggleSelection(topic.id)}
                    className="mt-1 w-5 h-5 rounded border-border-subtle bg-bg-dark"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-text-soft mb-1">
                      {topic.topic}
                    </h3>
                    <p className="text-text-muted text-sm">
                      Keyword: <span className="text-firefly-glow">{topic.primaryKeyword}</span>
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div
                      className={`text-3xl font-light mb-1 ${
                        topic.confidenceScore >= 80
                          ? 'text-green-400'
                          : topic.confidenceScore >= 65
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {topic.confidenceScore}%
                    </div>
                    <div className="text-text-muted text-xs">Confidence</div>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-bg-dark rounded-lg">
                    <div className="text-text-muted text-xs mb-1">Demand</div>
                    <div className="text-lg font-medium text-text-soft">
                      {topic.demandScore}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-bg-dark rounded-lg">
                    <div className="text-text-muted text-xs mb-1">Competition</div>
                    <div className="text-lg font-medium text-text-soft">
                      {topic.competitionScore}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-bg-dark rounded-lg">
                    <div className="text-text-muted text-xs mb-1">Relevance</div>
                    <div className="text-lg font-medium text-text-soft">
                      {topic.relevanceScore}
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-4 p-4 bg-bg-dark rounded-lg">
                  <div className="text-text-muted text-sm whitespace-pre-line">
                    {topic.reasoningNotes}
                  </div>
                </div>

                {/* Estimated Users */}
                <div className="flex items-center justify-between">
                  <div className="text-text-muted text-sm">
                    Est. Users: <span className="text-firefly-glow font-medium">{topic.estimatedUsers}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-xs ${
                      topic.status === 'candidate' ? 'bg-yellow-500/20 text-yellow-400' :
                      topic.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {topic.status}
                    </span>
                    {topic.status === 'candidate' && (
                      <button
                        onClick={() => generateBrief(topic.id)}
                        className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg text-sm font-medium transition-soft"
                      >
                        Generate Brief
                      </button>
                    )}
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-soft"
                      title="Delete topic"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

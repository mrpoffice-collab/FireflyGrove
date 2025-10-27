'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

interface MarketingPost {
  id: string
  platform: string
  title: string
  content: string
  excerpt: string | null
  status: string
  generatedBy: string
  keywords: string[]
  createdAt: string
}

export default function MarketingGeniusPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [draftPosts, setDraftPosts] = useState<MarketingPost[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [autoWriting, setAutoWriting] = useState(false)

  // Content generation form
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      // Fetch draft posts
      const postsRes = await fetch('/api/marketing/posts?status=draft')
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setDraftPosts(postsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePost = async () => {
    if (!topic.trim() || !keywords.trim()) {
      alert('Please enter topic and keywords')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/marketing/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.split(',').map(k => k.trim())
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Blog post generated: "${data.post.title}"`)
        setTopic('')
        setKeywords('')
        fetchData() // Refresh drafts
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating post:', error)
      alert('Error generating post')
    } finally {
      setGenerating(false)
    }
  }

  const handlePublishPost = async (postId: string) => {
    if (!confirm('Publish this post to the blog?')) return

    try {
      const res = await fetch(`/api/marketing/posts/${postId}/publish`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('✅ Post published successfully!')
        fetchData()
      } else {
        alert('Failed to publish post')
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      alert('Error publishing post')
    }
  }

  const handleGenerateContentPlan = async () => {
    if (!confirm('Generate 12 blog topics for the next month?')) return

    setGeneratingPlan(true)
    try {
      const res = await fetch('/api/marketing/generate-content-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postsPerWeek: 3,
          weeks: 4
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`🎯 ${data.message}\n\nNext: Click "Auto-Write All Posts" to generate the content!`)
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating content plan:', error)
      alert('Error generating content plan')
    } finally {
      setGeneratingPlan(false)
    }
  }

  const handleAutoWriteAll = async () => {
    if (!confirm('Auto-write the next 5 blog posts from your content calendar?\n\nThis will take 1-2 minutes.')) return

    setAutoWriting(true)
    try {
      const res = await fetch('/api/marketing/auto-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`🚀 ${data.message}\n\nCheck the Draft Posts section below to review and publish!`)
        fetchData()
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error auto-writing:', error)
      alert('Error auto-writing posts')
    } finally {
      setAutoWriting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header userName={session?.user?.name || ''} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-text-soft mb-3">🧠 Marketing Intelligence</h1>
            <p className="text-text-muted text-lg">
              AI-powered SEO content planning and generation
            </p>
          </div>
          <Link
            href="/marketing-genius/content-plan"
            className="px-6 py-3 bg-bg-elevated hover:bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg transition-soft"
          >
            📅 View Content Plan
          </Link>
        </div>

        {/* Full Automation */}
        <div className="mb-12 bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim rounded-xl p-8">
          <h2 className="text-2xl font-light text-text-soft mb-2">🤖 Full Automation</h2>
          <p className="text-text-muted mb-6">Let AI plan and write your entire month of content</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateContentPlan}
              disabled={generatingPlan}
              className="flex-1 px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPlan ? '🎯 Planning...' : '🎯 Step 1: Generate Content Plan (12 topics)'}
            </button>

            <button
              onClick={handleAutoWriteAll}
              disabled={autoWriting}
              className="flex-1 px-8 py-4 bg-green-500/80 hover:bg-green-500 text-white rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {autoWriting ? '✍️ Writing...' : '✍️ Step 2: Auto-Write All Posts (5 at a time)'}
            </button>
          </div>

          <div className="mt-4 p-4 bg-bg-dark/50 rounded-lg">
            <p className="text-sm text-text-muted">
              <strong>How it works:</strong> Step 1 creates 12 blog topic ideas with SEO keywords.
              Step 2 writes complete 2000-word blog posts for each topic.
              Then review drafts below and publish with 1-click! 🚀
            </p>
          </div>
        </div>

        {/* Manual Content Generator */}
        <div className="mb-12 bg-bg-elevated border border-border-subtle rounded-xl p-8">
          <h2 className="text-2xl font-light text-text-soft mb-6">✍️ AI Content Generator</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Blog Post Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to preserve family memories before it's too late"
                className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim placeholder:text-text-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Target Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., memory preservation, family history, sound wave art"
                className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim placeholder:text-text-muted"
              />
            </div>

            <button
              onClick={handleGeneratePost}
              disabled={generating}
              className="px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? '✨ Generating with AI...' : '✨ Generate Blog Post'}
            </button>
          </div>
        </div>

        {/* Draft Posts */}
        <div className="mb-12 bg-bg-elevated border border-border-subtle rounded-xl p-8">
          <h2 className="text-2xl font-light text-text-soft mb-6">📝 Draft Posts ({draftPosts.length})</h2>

          {draftPosts.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p className="mb-2">No draft posts yet.</p>
              <p className="text-sm">Use "Auto-Write All Posts" above or "Generate Blog Post" to create drafts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {draftPosts.map(post => (
                <div key={post.id} className="bg-bg-dark border border-border-subtle rounded-lg p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl text-text-soft font-medium mb-2">{post.title}</h3>
                      <p className="text-text-muted text-sm mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-firefly-dim/10 text-firefly-glow rounded text-xs">
                          {post.generatedBy === 'ai' ? '🤖 AI Generated' : '✍️ Human Written'}
                        </span>
                        {post.keywords.map(keyword => (
                          <span key={keyword} className="px-2 py-1 bg-bg-elevated text-text-muted rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePublishPost(post.id)}
                      className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded font-medium transition-soft whitespace-nowrap"
                    >
                      Publish
                    </button>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-firefly-glow text-sm">View full content</summary>
                    <pre className="mt-3 p-4 bg-bg-elevated rounded text-text-muted text-xs overflow-x-auto whitespace-pre-wrap">
                      {post.content}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Planning Guide */}
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
          <h2 className="text-2xl font-light text-text-soft mb-6">🎯 SEO Content Planning</h2>

          <div className="space-y-6">
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
              <h3 className="text-lg text-text-soft font-medium mb-3">📊 Your Target Keywords</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm text-firefly-glow font-medium mb-2">Primary Keywords</h4>
                  <ul className="space-y-1 text-text-muted text-sm">
                    <li>• memory preservation</li>
                    <li>• family legacy planning</li>
                    <li>• sound wave art</li>
                    <li>• memorial tribute video</li>
                    <li>• digital family tree</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-firefly-glow font-medium mb-2">Long-Tail Keywords</h4>
                  <ul className="space-y-1 text-text-muted text-sm">
                    <li>• how to preserve family memories</li>
                    <li>• create memorial video online</li>
                    <li>• turn voice into art</li>
                    <li>• organize old family photos</li>
                    <li>• digital legacy planning guide</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
              <h3 className="text-lg text-text-soft font-medium mb-3">💡 Content Ideas</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setTopic('How to Preserve Family Memories Before It\'s Too Late')
                    setKeywords('memory preservation, family history, legacy planning')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full text-left p-4 bg-bg-elevated hover:bg-bg-dark border border-border-subtle hover:border-firefly-dim rounded-lg transition-soft"
                >
                  <div className="text-text-soft font-medium mb-1">How to Preserve Family Memories Before It's Too Late</div>
                  <div className="text-text-muted text-sm">Keywords: memory preservation, family history, legacy planning</div>
                </button>

                <button
                  onClick={() => {
                    setTopic('Complete Guide to Creating Memorial Tribute Videos')
                    setKeywords('memorial video, tribute video, photo slideshow')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full text-left p-4 bg-bg-elevated hover:bg-bg-dark border border-border-subtle hover:border-firefly-dim rounded-lg transition-soft"
                >
                  <div className="text-text-soft font-medium mb-1">Complete Guide to Creating Memorial Tribute Videos</div>
                  <div className="text-text-muted text-sm">Keywords: memorial video, tribute video, photo slideshow</div>
                </button>

                <button
                  onClick={() => {
                    setTopic('Sound Wave Art: Turn Meaningful Voices Into Beautiful Wall Art')
                    setKeywords('sound wave art, voice art, audio visualization')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full text-left p-4 bg-bg-elevated hover:bg-bg-dark border border-border-subtle hover:border-firefly-dim rounded-lg transition-soft"
                >
                  <div className="text-text-soft font-medium mb-1">Sound Wave Art: Turn Meaningful Voices Into Beautiful Wall Art</div>
                  <div className="text-text-muted text-sm">Keywords: sound wave art, voice art, audio visualization</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

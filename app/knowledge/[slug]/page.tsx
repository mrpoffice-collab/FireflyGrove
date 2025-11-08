'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { SkeletonTitle, SkeletonText } from '@/components/SkeletonLoader'
import ReactMarkdown from 'react-markdown'

interface KnowledgeArticle {
  id: string
  slug: string
  title: string
  subtitle: string | null
  category: string
  tags: string[]
  timeToRead: number
  difficulty: string
  content: string
  createdAt: string
  updatedAt: string
  viewCount: number
  helpfulYes: number
  helpfulNo: number
}

export default function KnowledgeArticlePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/knowledge/articles/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data)
      } else {
        router.push('/knowledge')
      }
    } catch (error) {
      console.error('Failed to fetch article:', error)
      router.push('/knowledge')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (helpful: boolean) => {
    if (!article || feedbackSubmitted) return

    try {
      await fetch(`/api/knowledge/articles/${slug}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful }),
      })
      setFeedbackSubmitted(true)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <SkeletonTitle />
          <SkeletonText lines={10} />
        </div>
      </div>
    )
  }

  if (!session || !article) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/knowledge')}
          className="text-firefly-glow hover:text-firefly-glow/80 transition-soft mb-6 flex items-center gap-2"
        >
          ← Back to Knowledge Bank
        </button>

        {/* Article Header */}
        <article>
          <header className="mb-8 pb-8 border-b border-firefly-dim/20">
            <h1 className="text-4xl font-light text-firefly-glow mb-4">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-xl text-text-soft mb-6">
                {article.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <span className="px-3 py-1 bg-bg-elevated rounded-full border border-firefly-dim/30">
                {article.timeToRead} min read
              </span>
              <span className="px-3 py-1 bg-bg-elevated rounded-full border border-firefly-dim/30 capitalize">
                {article.difficulty.toLowerCase()}
              </span>
              {article.viewCount > 0 && (
                <span>{article.viewCount} views</span>
              )}
            </div>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-bg-dark/50 text-text-muted text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-invert prose-firefly max-w-none mb-12">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-light text-firefly-glow mt-8 mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-light text-firefly-glow mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium text-text-primary mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-text-soft leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-text-soft">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-text-soft">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="text-firefly-glow font-medium">
                    {children}
                  </strong>
                ),
                code: ({ children }) => (
                  <code className="px-2 py-1 bg-bg-dark rounded text-firefly-glow text-sm">
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-firefly-glow pl-4 italic text-text-muted my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Feedback Section */}
          <div className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-text-primary mb-4">
              Was this article helpful?
            </h3>

            {feedbackSubmitted ? (
              <p className="text-firefly-glow">
                ✓ Thank you for your feedback!
              </p>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handleFeedback(true)}
                  className="px-6 py-2 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft"
                >
                  👍 Yes
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="px-6 py-2 bg-bg-dark hover:bg-bg-dark/80 text-text-soft rounded-lg font-medium transition-soft border border-firefly-dim/30"
                >
                  👎 No
                </button>
              </div>
            )}
          </div>

          {/* Related Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-firefly-dim/20">
            <a
              href="/knowledge"
              className="text-firefly-glow hover:text-firefly-glow/80 transition-soft"
            >
              ← Browse all guides
            </a>
            <a
              href="/feedback"
              className="text-text-muted hover:text-text-soft transition-soft"
            >
              Suggest improvements →
            </a>
          </div>
        </article>
      </div>
    </div>
  )
}

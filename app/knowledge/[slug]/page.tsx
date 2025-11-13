'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import { getKnowledgeArticle } from '@/lib/knowledgeContent'

export default function KnowledgeArticlePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const article = getKnowledgeArticle(slug)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-12 bg-bg-elevated rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-bg-elevated rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-bg-elevated rounded"></div>
              <div className="h-4 bg-bg-elevated rounded"></div>
              <div className="h-4 bg-bg-elevated rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !article) {
    router.push('/knowledge')
    return null
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/knowledge')}
          className="text-firefly-glow hover:text-firefly-glow/80 transition-soft mb-6 flex items-center gap-2"
        >
          ← Back to Knowledge Bank
        </button>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{article.icon}</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-light text-firefly-glow mb-2">
                {article.title}
              </h1>
              <p className="text-lg text-text-soft">{article.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <div className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-6">
            <p className="text-text-soft text-lg leading-relaxed">{article.overview}</p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-light text-firefly-glow mb-6 flex items-center gap-2">
            <span>📖</span>
            How It Works
          </h2>
          <div className="space-y-6">
            {article.howItWorks.map((step, index) => (
              <div key={index} className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-firefly-glow/20 text-firefly-glow rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-firefly-glow mb-2">{step.title}</h3>
                    <p className="text-text-soft leading-relaxed">{step.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-light text-firefly-glow mb-6 flex items-center gap-2">
            <span>💡</span>
            When to Use This
          </h2>
          <div className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-6">
            <ul className="space-y-3">
              {article.useCases.map((useCase, index) => (
                <li key={index} className="flex gap-3 text-text-soft">
                  <span className="text-firefly-glow mt-1">✓</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tips & Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-light text-firefly-glow mb-6 flex items-center gap-2">
            <span>✨</span>
            Tips & Best Practices
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {article.tips.map((tip, index) => (
              <div key={index} className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-4">
                <p className="text-text-soft text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-light text-firefly-glow mb-6 flex items-center gap-2">
            <span>❓</span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {article.faqs.map((faq, index) => (
              <div key={index} className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-6">
                <h3 className="text-lg font-medium text-firefly-glow mb-3">{faq.question}</h3>
                <p className="text-text-soft leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Guides */}
        {article.relatedGuides.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-light text-firefly-glow mb-6 flex items-center gap-2">
              <span>🔗</span>
              Related Guides
            </h2>
            <div className="flex flex-wrap gap-3">
              {article.relatedGuides.map((relatedSlug) => (
                <a
                  key={relatedSlug}
                  href={`/knowledge/${relatedSlug}`}
                  className="px-4 py-2 bg-bg-elevated border border-firefly-dim/30 rounded-lg text-firefly-glow hover:border-firefly-glow transition-soft"
                >
                  {relatedSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-8 border-t border-firefly-dim/20">
          <a
            href="/knowledge"
            className="text-firefly-glow hover:text-firefly-glow/80 transition-soft text-center sm:text-left"
          >
            ← Browse all guides
          </a>
          <a
            href="/feedback"
            className="text-text-muted hover:text-text-soft transition-soft text-center sm:text-right"
          >
            Suggest improvements →
          </a>
        </div>
      </div>
    </div>
  )
}

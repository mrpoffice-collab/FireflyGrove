import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import { getPostBySlug, getAllPosts } from '@/lib/blog'

type Props = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Firefly Grove Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [post.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header userName="" />

      <article className="max-w-3xl mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-text-muted">
          <Link href="/" className="hover:text-firefly-glow">Home</Link>
          <span className="mx-2">→</span>
          <Link href="/blog" className="hover:text-firefly-glow">Blog</Link>
          <span className="mx-2">→</span>
          <span className="text-text-soft">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-firefly-glow bg-firefly-glow/10 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-sm text-text-muted">
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="text-sm text-text-muted">
              {post.readTime}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-light text-text-soft mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-text-muted">
            {post.excerpt}
          </p>

          {post.image && (
            <div className="mt-8 rounded-xl overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div
          className="prose prose-invert prose-firefly max-w-none
            prose-headings:text-text-soft prose-headings:font-light
            prose-p:text-text-muted prose-p:leading-relaxed
            prose-a:text-firefly-glow prose-a:no-underline hover:prose-a:text-firefly-bright
            prose-strong:text-text-soft prose-strong:font-medium
            prose-ul:text-text-muted prose-ol:text-text-muted
            prose-li:my-2
            prose-code:text-firefly-glow prose-code:bg-firefly-glow/10 prose-code:px-2 prose-code:py-1 prose-code:rounded
            prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-border-subtle
            prose-blockquote:border-l-4 prose-blockquote:border-firefly-dim prose-blockquote:text-text-muted prose-blockquote:italic"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author */}
        <div className="mt-12 pt-8 border-t border-border-subtle">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-firefly-glow/10 flex items-center justify-center text-firefly-glow text-xl font-medium">
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="text-text-soft font-medium">{post.author}</div>
              <div className="text-text-muted text-sm">Memory Preservation Expert</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-bg-elevated border border-border-subtle rounded-xl p-8 text-center">
          <h3 className="text-2xl font-light text-text-soft mb-3">
            Start Preserving Your Family's Memories
          </h3>
          <p className="text-text-muted mb-6">
            Create memorial tributes, sound wave art, and organize your family's story beautifully
          </p>
          <Link
            href="/signup"
            className="inline-block px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
          >
            Try Firefly Grove Free →
          </Link>
        </div>

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="text-firefly-glow hover:text-firefly-bright text-sm font-medium"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </div>
  )
}

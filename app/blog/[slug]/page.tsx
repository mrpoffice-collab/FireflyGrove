import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
  const session = await getServerSession(authOptions)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} />

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

          {/* Share Buttons */}
          <div className="mt-8 flex items-center gap-4 pb-8 border-b border-border-subtle">
            <span className="text-text-muted text-sm">Share:</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://fireflygrove.app/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1877f2] hover:bg-[#0c63d4] text-white rounded-lg text-sm font-medium transition-soft"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
            <a
              href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`https://fireflygrove.app/blog/${post.slug}`)}&media=${encodeURIComponent(post.image || '')}&description=${encodeURIComponent(post.excerpt)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#e60023] hover:bg-[#c2001d] text-white rounded-lg text-sm font-medium transition-soft"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
              </svg>
              Pinterest
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

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

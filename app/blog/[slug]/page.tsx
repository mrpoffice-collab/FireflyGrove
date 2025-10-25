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
        <div className="blog-content">
          <style jsx>{`
            .blog-content {
              color: #A8B3C0;
              line-height: 1.8;
              font-size: 1.125rem;
            }

            .blog-content h2 {
              color: #E8EDF2;
              font-size: 2rem;
              font-weight: 300;
              margin-top: 3rem;
              margin-bottom: 1.5rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid #2D3748;
            }

            .blog-content h3 {
              color: #E8EDF2;
              font-size: 1.5rem;
              font-weight: 400;
              margin-top: 2.5rem;
              margin-bottom: 1rem;
            }

            .blog-content h4 {
              color: #CBD5E0;
              font-size: 1.25rem;
              font-weight: 500;
              margin-top: 2rem;
              margin-bottom: 0.75rem;
            }

            .blog-content p {
              margin-bottom: 1.5rem;
              color: #A8B3C0;
            }

            .blog-content a {
              color: #FFD966;
              text-decoration: none;
              border-bottom: 1px solid transparent;
              transition: border-color 0.2s;
            }

            .blog-content a:hover {
              color: #FFE599;
              border-bottom-color: #FFD966;
            }

            .blog-content strong {
              color: #CBD5E0;
              font-weight: 600;
            }

            .blog-content ul, .blog-content ol {
              margin-bottom: 1.5rem;
              padding-left: 1.5rem;
            }

            .blog-content li {
              margin-bottom: 0.75rem;
              color: #A8B3C0;
            }

            .blog-content code {
              background: rgba(255, 217, 102, 0.1);
              color: #FFD966;
              padding: 0.125rem 0.375rem;
              border-radius: 0.25rem;
              font-size: 0.9em;
              font-family: 'Monaco', 'Courier New', monospace;
            }

            .blog-content pre {
              background: #1A202C;
              border: 1px solid #2D3748;
              border-radius: 0.5rem;
              padding: 1.5rem;
              overflow-x: auto;
              margin-bottom: 1.5rem;
            }

            .blog-content pre code {
              background: transparent;
              padding: 0;
            }

            .blog-content blockquote {
              border-left: 4px solid #FFD966;
              padding-left: 1.5rem;
              margin-left: 0;
              margin-bottom: 1.5rem;
              font-style: italic;
              color: #CBD5E0;
            }

            .blog-content hr {
              border: none;
              border-top: 1px solid #2D3748;
              margin: 3rem 0;
            }

            .blog-content img {
              border-radius: 0.5rem;
              margin: 2rem 0;
            }
          `}</style>
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

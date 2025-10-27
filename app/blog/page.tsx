import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { getAllPosts } from '@/lib/blog'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Blog - Family Memory & Legacy Preservation Tips',
  description: 'Learn how to preserve family memories, create memorial tributes, and build your digital legacy. Expert tips on genealogy, memory keeping, and storytelling.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-text-soft mb-4">
            Memory Preservation <span className="text-firefly-glow">Blog</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Learn how to preserve, organize, and share your family's most precious memories
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-bg-elevated border border-border-subtle rounded-xl">
            <p className="text-text-muted text-lg mb-4">No blog posts yet.</p>
            <p className="text-text-muted text-sm">
              Check back soon for memory preservation tips and guides!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="bg-bg-elevated border border-border-subtle rounded-xl p-8 hover:border-firefly-dim/50 transition-soft">
                <Link href={`/blog/${post.slug}`}>
                  <div className="flex items-start gap-6">
                    {post.image && (
                      <div className="hidden md:block w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-firefly-glow bg-firefly-glow/10 px-3 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-text-muted">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-text-muted">
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="text-2xl font-medium text-text-soft mb-3 hover:text-firefly-glow transition-soft">
                        {post.title}
                      </h2>
                      <p className="text-text-muted mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="text-firefly-glow text-sm font-medium">
                        Read more →
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-bg-elevated border border-border-subtle rounded-xl p-8 text-center">
          <h3 className="text-2xl font-light text-text-soft mb-3">
            Get Memory Preservation Tips
          </h3>
          <p className="text-text-muted mb-6">
            Join our newsletter for weekly tips on preserving family memories
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

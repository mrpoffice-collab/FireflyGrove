import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import { prisma } from '@/lib/prisma'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  author: string
  category: string
  readTime: string
  image?: string
}

/**
 * Get published blog posts from database
 */
async function getPostsFromDatabase(): Promise<BlogPost[]> {
  try {
    const posts = await prisma.marketingPost.findMany({
      where: {
        platform: 'blog',
        status: 'published',
      },
      orderBy: {
        publishedAt: 'desc',
      },
    })

    // Convert database posts to BlogPost format
    const blogPosts = await Promise.all(
      posts.map(async (post) => {
        if (!post.slug) return null

        // Convert markdown content to HTML
        const processedContent = await remark()
          .use(remarkGfm)
          .use(html, { sanitize: false })
          .process(post.content)
        const contentHtml = processedContent.toString()

        // Calculate read time
        const wordCount = post.content.split(/\s+/).length
        const readTime = Math.ceil(wordCount / 200)

        return {
          slug: post.slug,
          title: post.title,
          date: post.publishedAt?.toISOString() || new Date().toISOString(),
          excerpt: post.excerpt || post.metaDescription || '',
          content: contentHtml,
          author: 'Firefly Grove Team',
          category: 'Memory Preservation',
          readTime: `${readTime} min read`,
          image: post.image || undefined,
        }
      })
    )

    return blogPosts.filter((post): post is BlogPost => post !== null)
  } catch (error) {
    console.error('Error fetching posts from database:', error)
    return []
  }
}

/**
 * Get all published blog posts from both files and database
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const filePosts: BlogPost[] = []
  const dbPosts = await getPostsFromDatabase()

  // Try to read from files (for pre-deployed content)
  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory)
      const filePostsData = await Promise.all(
        fileNames
          .filter((fileName) => fileName.endsWith('.md'))
          .map(async (fileName) => {
            const slug = fileName.replace(/\.md$/, '')
            return await getPostFromFile(slug)
          })
      )
      filePosts.push(...filePostsData.filter((post): post is BlogPost => post !== null))
    }
  } catch (error) {
    console.log('Could not read from files (expected in production):', error)
  }

  // Combine posts from both sources, removing duplicates (prefer DB version)
  const dbSlugs = new Set(dbPosts.map(p => p.slug))
  const uniqueFilePosts = filePosts.filter(p => !dbSlugs.has(p.slug))

  const allPosts = [...dbPosts, ...uniqueFilePosts]

  // Sort by date
  return allPosts.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
}

/**
 * Get a single post from markdown file
 */
async function getPostFromFile(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Parse metadata
    const { data, content } = matter(fileContents)

    // Convert markdown to HTML with enhanced formatting
    const processedContent = await remark()
      .use(remarkGfm) // GitHub Flavored Markdown for better formatting
      .use(html, { sanitize: false }) // Allow all HTML for better formatting
      .process(content)
    const contentHtml = processedContent.toString()

    return {
      slug,
      title: data.title || '',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      content: contentHtml,
      author: data.author || 'Firefly Grove Team',
      category: data.category || 'Memory Preservation',
      readTime: data.readTime || '5 min read',
      image: data.image,
    }
  } catch (error) {
    console.error(`Error reading post from file ${slug}:`, error)
    return null
  }
}

/**
 * Get a single post by slug from either file or database
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Try file first (for pre-deployed content)
  try {
    const filePost = await getPostFromFile(slug)
    if (filePost) return filePost
  } catch (error) {
    console.log(`Post ${slug} not found in files, checking database...`)
  }

  // Try database
  try {
    const post = await prisma.marketingPost.findFirst({
      where: {
        slug: slug,
        platform: 'blog',
        status: 'published',
      },
    })

    if (!post) return null

    // Convert markdown content to HTML
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(post.content)
    const contentHtml = processedContent.toString()

    // Calculate read time
    const wordCount = post.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    return {
      slug: post.slug,
      title: post.title,
      date: post.publishedAt?.toISOString() || new Date().toISOString(),
      excerpt: post.excerpt || post.metaDescription || '',
      content: contentHtml,
      author: 'Firefly Grove Team',
      category: 'Memory Preservation',
      readTime: `${readTime} min read`,
      image: post.image || undefined,
    }
  } catch (error) {
    console.error(`Error reading post ${slug} from database:`, error)
    return null
  }
}

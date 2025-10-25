import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

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

export async function getAllPosts(): Promise<BlogPost[]> {
  // Create directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '')
        return await getPostBySlug(slug)
      })
  )

  // Filter out any null posts and sort by date
  return allPostsData
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Parse metadata
    const { data, content } = matter(fileContents)

    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
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
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

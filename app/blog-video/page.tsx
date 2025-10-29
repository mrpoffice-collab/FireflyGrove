import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BlogVideoBuilder from '@/components/BlogVideoBuilder'

export const metadata: Metadata = {
  title: 'Blog Video Builder - Firefly Grove',
  description: 'Transform your blog posts into engaging videos with AI voiceover',
}

export default async function BlogVideoPage() {
  const session = await getServerSession(authOptions)

  // Require authentication
  if (!session?.user) {
    redirect('/signin?callbackUrl=/blog-video')
  }

  return <BlogVideoBuilder />
}

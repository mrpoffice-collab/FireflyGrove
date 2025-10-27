import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Generate Unsplash image URL based on keywords
 * (Same logic as contentWriter.ts)
 */
function generateUnsplashImage(keywords: string[]): string {
  // Keyword to Unsplash photo ID mapping (curated for memory preservation topics)
  const keywordImageMap: Record<string, string> = {
    // Family & Photos
    'family': 'photo-1511895426328-dc8714191300',
    'photos': 'photo-1551269901-5c5e14c25df7',
    'memories': 'photo-1516733725897-1aa73b87c8e8',
    'album': 'photo-1551269901-5c5e14c25df7',
    'scrapbook': 'photo-1452421822248-d4c2b47f0c81',

    // Digital & Technology
    'digital': 'photo-1488590528505-98d2b5aba04b',
    'cloud': 'photo-1544197150-b99a580bb7a8',
    'backup': 'photo-1544197150-b99a580bb7a8',
    'storage': 'photo-1597852074816-d933c7d2b988',
    'scan': 'photo-1588600878108-578307a3cc9d',

    // Heritage & Legacy
    'legacy': 'photo-1532187863486-abf9dbad1b69',
    'heritage': 'photo-1581579186913-45ac3e6efe93',
    'ancestry': 'photo-1532187863486-abf9dbad1b69',
    'genealogy': 'photo-1532187863486-abf9dbad1b69',
    'generations': 'photo-1532187863486-abf9dbad1b69',

    // Video & Audio
    'video': 'photo-1574717024653-61fd2cf4d44d',
    'audio': 'photo-1598488035139-bdbb2231ce04',
    'recording': 'photo-1598488035139-bdbb2231ce04',
    'voice': 'photo-1589903308904-1010c2294adc',

    // Documents & Letters
    'documents': 'photo-1586281380349-632531db7ed4',
    'letters': 'photo-1455390582262-044cdead277a',
    'handwritten': 'photo-1455390582262-044cdead277a',
    'diary': 'photo-1517842645767-c639042777db',

    // Organization & Preservation
    'organize': 'photo-1544816155-12df9643f363',
    'preserve': 'photo-1551269901-5c5e14c25df7',
    'archive': 'photo-1507003211169-0a1dd7228f2d',
    'collection': 'photo-1551269901-5c5e14c25df7',
  }

  // Pool of general memory preservation images for fallback
  const fallbackImages = [
    'photo-1551269901-5c5e14c25df7',
    'photo-1511895426328-dc8714191300',
    'photo-1516733725897-1aa73b87c8e8',
    'photo-1532187863486-abf9dbad1b69',
    'photo-1452421822248-d4c2b47f0c81',
  ]

  // Try to find matching keyword
  let photoId: string | null = null

  for (const keyword of keywords) {
    const normalized = keyword.toLowerCase().trim()

    // Check direct match
    if (keywordImageMap[normalized]) {
      photoId = keywordImageMap[normalized]
      break
    }

    // Check partial matches
    for (const [key, value] of Object.entries(keywordImageMap)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        photoId = value
        break
      }
    }

    if (photoId) break
  }

  // If no match found, use hash of first keyword to consistently pick from fallback pool
  if (!photoId) {
    const keyword = keywords[0] || 'memory'
    const hash = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = hash % fallbackImages.length
    photoId = fallbackImages[index]
  }

  return `https://images.unsplash.com/${photoId}?w=1200&h=630&fit=crop`
}

/**
 * POST /api/marketing/posts/fix-missing-images
 * Bulk update all posts missing images
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all posts without images
    const postsWithoutImages = await prisma.marketingPost.findMany({
      where: {
        OR: [
          { image: null },
          { image: '' }
        ]
      },
      select: {
        id: true,
        keywords: true,
        title: true,
      }
    })

    console.log(`📸 Found ${postsWithoutImages.length} posts without images`)

    let updated = 0
    const errors = []

    for (const post of postsWithoutImages) {
      try {
        // Generate image based on keywords
        const image = generateUnsplashImage(post.keywords)

        await prisma.marketingPost.update({
          where: { id: post.id },
          data: { image }
        })

        console.log(`  ✅ Updated: ${post.title}`)
        updated++
      } catch (error) {
        console.error(`  ❌ Failed to update ${post.title}:`, error)
        errors.push({ id: post.id, title: post.title, error: (error as Error).message })
      }
    }

    return NextResponse.json({
      success: true,
      totalFound: postsWithoutImages.length,
      updated,
      errors: errors.length,
      message: `Updated ${updated} posts with images`,
      errorDetails: errors
    })
  } catch (error: any) {
    console.error('Error fixing missing images:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fix missing images' },
      { status: 500 }
    )
  }
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixFacebookTitles() {
  try {
    // Get all FB posts with generic titles
    const fbPosts = await prisma.marketingPost.findMany({
      where: {
        platform: 'facebook',
        postType: 'social_post',
        title: {
          startsWith: 'FB:',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`\n🔍 Found ${fbPosts.length} Facebook posts with generic titles\n`)

    for (const post of fbPosts) {
      // Extract meaningful title from FB post content
      const fbContent = post.content || ''

      // Take first sentence or up to first emoji/newline
      let fbTitle = fbContent.split(/[.\n\r]/)[0].substring(0, 80).trim()

      // Clean up common sentence endings that might get cut off
      fbTitle = fbTitle.replace(/[,;:]$/, '')

      // If title is too short, try second sentence
      if (fbTitle.length < 20) {
        const sentences = fbContent.split(/[.\n\r]/).filter(s => s.trim().length > 0)
        fbTitle = sentences.slice(0, 2).join('. ').substring(0, 80).trim()
      }

      console.log(`📝 Post ${post.id.substring(0, 8)}...`)
      console.log(`   Old: ${post.title}`)
      console.log(`   New: ${fbTitle}`)

      // Update the post
      await prisma.marketingPost.update({
        where: { id: post.id },
        data: { title: fbTitle },
      })

      console.log(`   ✅ Updated\n`)
    }

    console.log(`\n✅ Fixed ${fbPosts.length} Facebook post titles!`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixFacebookTitles()

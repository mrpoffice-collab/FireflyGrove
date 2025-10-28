import { prisma } from '../lib/prisma'

async function checkBlogPosts() {
  const posts = await prisma.marketingPost.findMany({
    where: { platform: 'blog' },
    select: {
      id: true,
      title: true,
      status: true,
      slug: true,
      excerpt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  console.log('\n📝 Blog Posts Available:\n')

  if (posts.length === 0) {
    console.log('❌ No blog posts found!')
  } else {
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Slug: ${post.slug || 'N/A'}`)
      console.log(`   ID: ${post.id}`)
      console.log(`   Excerpt: ${post.excerpt?.substring(0, 80)}...`)
      console.log('')
    })
  }

  console.log(`Total: ${posts.length} blog posts\n`)
}

checkBlogPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

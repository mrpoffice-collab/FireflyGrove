import { prisma } from '../lib/prisma'
import { generateContentBrief } from '../lib/marketing/briefGenerator'
import { writeContentFromBrief } from '../lib/marketing/contentWriter'

async function generateFromTopTopics() {
  console.log('\n🎯 Generating content from top 5 high-value topics...\n')

  // Get top 5 topics with score >= 85
  const topics = await prisma.topicScore.findMany({
    where: {
      confidenceScore: {
        gte: 85,
      },
      status: 'candidate', // Only generate from topics not yet drafted
    },
    orderBy: {
      confidenceScore: 'desc',
    },
    take: 5,
  })

  console.log(`Found ${topics.length} high-value topics to generate from:\n`)

  let generated = 0
  let currentDate = new Date()

  for (const topic of topics) {
    try {
      console.log(`\n📝 Processing: ${topic.topic}`)
      console.log(`   Score: ${topic.confidenceScore}/100 | Estimated Users: ${topic.estimatedUsers}`)

      // Generate brief
      console.log('   → Generating content brief...')
      const briefData = await generateContentBrief({ topicScoreId: topic.id })

      const brief = await prisma.contentBrief.create({
        data: {
          topicScoreId: topic.id,
          title: briefData.title,
          targetKeywords: briefData.targetKeywords,
          suggestedLength: briefData.suggestedLength,
          outlinePoints: JSON.stringify(briefData.outlinePoints),
          suggestedH2s: briefData.suggestedH2s,
          ctaRecommendation: briefData.ctaRecommendation,
          toneNotes: briefData.toneNotes,
          status: 'completed',
        },
      })

      // Generate blog post
      console.log('   → Writing blog post...')
      const blogContent = await writeContentFromBrief(brief.id)

      const blogPost = await prisma.marketingPost.create({
        data: {
          platform: 'blog',
          postType: 'blog_post',
          title: blogContent.title,
          content: blogContent.content,
          excerpt: blogContent.excerpt,
          slug: blogContent.slug,
          metaDescription: blogContent.metaDescription,
          image: blogContent.image,
          keywords: brief.targetKeywords,
          status: 'draft',
          scheduledFor: currentDate,
          generatedBy: 'ai',
          topic: topic.topic,
        },
      })

      // Update topic status
      await prisma.topicScore.update({
        where: { id: topic.id },
        data: {
          status: 'drafted',
          postId: blogPost.id,
        },
      })

      console.log(`   ✅ Blog post created: "${blogContent.title}"`)
      console.log(`   ID: ${blogPost.id}`)

      generated++

      // Next post scheduled 7 days later
      currentDate.setDate(currentDate.getDate() + 7)
    } catch (error) {
      console.error(`   ❌ Error: ${error}`)
    }
  }

  console.log(`\n✅ Successfully generated ${generated} blog posts!`)
  console.log(`\n📱 View them at: https://firefly-grove.vercel.app/marketing-genius/drafts\n`)
}

generateFromTopTopics()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

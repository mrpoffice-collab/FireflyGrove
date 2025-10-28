import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeDraftValue() {
  console.log('📊 Analyzing Draft Content Value...\n')

  // Get all drafts with their topics
  const drafts = await prisma.marketingPost.findMany({
    select: {
      id: true,
      title: true,
      topic: true,
      platform: true,
      status: true,
      isApproved: true,
      keywords: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Get topic scores
  const topicScores = await prisma.topicScore.findMany({
    select: {
      topic: true,
      confidenceScore: true,
      relevanceScore: true,
      demandScore: true,
      competitionScore: true,
      estimatedUsers: true,
      postId: true,
    },
  })

  // Create topic score map
  const topicScoreMap = new Map(
    topicScores.map((t) => [t.topic.toLowerCase(), t])
  )

  // Categorize drafts by value
  const highValue: any[] = []
  const mediumValue: any[] = []
  const lowValue: any[] = []
  const noScore: any[] = []

  for (const draft of drafts) {
    const topicScore = topicScoreMap.get(draft.topic?.toLowerCase() || '')

    const score = topicScore?.confidenceScore || 0
    const estimatedUsers = topicScore?.estimatedUsers || 0

    const draftInfo = {
      id: draft.id,
      title: draft.title,
      topic: draft.topic,
      platform: draft.platform,
      score,
      estimatedUsers,
      approved: draft.isApproved,
    }

    if (!topicScore) {
      noScore.push(draftInfo)
    } else if (score >= 70) {
      highValue.push(draftInfo)
    } else if (score >= 50) {
      mediumValue.push(draftInfo)
    } else {
      lowValue.push(draftInfo)
    }
  }

  // Calculate total estimated users
  const totalEstimatedUsersHigh = highValue.reduce((sum, d) => sum + (d.estimatedUsers || 0), 0)
  const totalEstimatedUsersMed = mediumValue.reduce((sum, d) => sum + (d.estimatedUsers || 0), 0)
  const totalEstimatedUsersLow = lowValue.reduce((sum, d) => sum + (d.estimatedUsers || 0), 0)

  // Print results
  console.log('🌟 HIGH VALUE (Score >= 70) - KEEP THESE!')
  console.log(`   Total: ${highValue.length} posts | Est. Users: ${totalEstimatedUsersHigh}`)
  highValue.forEach((d, i) => {
    console.log(
      `   ${i + 1}. [Score: ${Math.round(d.score)} | Users: ${d.estimatedUsers || 0}] ${d.platform.toUpperCase()}: ${d.title.substring(0, 50)}...`
    )
  })

  console.log('\n📊 MEDIUM VALUE (Score 50-69) - Review These')
  console.log(`   Total: ${mediumValue.length} posts | Est. Users: ${totalEstimatedUsersMed}`)
  mediumValue.forEach((d, i) => {
    console.log(
      `   ${i + 1}. [Score: ${Math.round(d.score)} | Users: ${d.estimatedUsers || 0}] ${d.platform.toUpperCase()}: ${d.title.substring(0, 50)}...`
    )
  })

  console.log('\n⚠️  LOW VALUE (Score < 50) - Consider Deleting')
  console.log(`   Total: ${lowValue.length} posts | Est. Users: ${totalEstimatedUsersLow}`)
  lowValue.forEach((d, i) => {
    console.log(
      `   ${i + 1}. [Score: ${Math.round(d.score)} | Users: ${d.estimatedUsers || 0}] ${d.platform.toUpperCase()}: ${d.title.substring(0, 50)}...`
    )
  })

  console.log('\n❓ NO SCORE - No topic match found')
  console.log(`   Total: ${noScore.length}`)

  console.log('\n📈 SUMMARY:')
  console.log(`   High Value (Keep):      ${highValue.length}`)
  console.log(`   Medium Value (Review):  ${mediumValue.length}`)
  console.log(`   Low Value (Delete):     ${lowValue.length}`)
  console.log(`   No Score:               ${noScore.length}`)
  console.log(`   TOTAL DRAFTS:           ${drafts.length}`)

  // Get IDs for bulk operations
  console.log('\n🔧 BULK OPERATIONS:')
  console.log('\nLow Value Draft IDs (for deletion):')
  console.log(JSON.stringify(lowValue.map((d) => d.id)))

  await prisma.$disconnect()
}

analyzeDraftValue()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

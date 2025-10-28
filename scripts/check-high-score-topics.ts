import { prisma } from '../lib/prisma'

async function checkHighScoreTopics() {
  const topics = await prisma.topicScore.findMany({
    where: {
      confidenceScore: {
        gte: 70, // High-value topics only
      },
    },
    select: {
      id: true,
      topic: true,
      confidenceScore: true,
      relevanceScore: true,
      demandScore: true,
      competitionScore: true,
      estimatedUsers: true,
      status: true,
    },
    orderBy: {
      confidenceScore: 'desc',
    },
    take: 10,
  })

  console.log('\n🎯 High-Value Topics (Score 70+):\n')

  if (topics.length === 0) {
    console.log('❌ No high-scoring topics found!')
    console.log('💡 Try generating new topics first.')
  } else {
    topics.forEach((topic, i) => {
      console.log(`${i + 1}. ${topic.topic}`)
      console.log(`   Confidence Score: ${topic.confidenceScore}/100`)
      console.log(`   Relevance: ${topic.relevanceScore} | Demand: ${topic.demandScore} | Competition: ${topic.competitionScore}`)
      console.log(`   Estimated Users: ${topic.estimatedUsers}`)
      console.log(`   Status: ${topic.status}`)
      console.log(`   ID: ${topic.id}`)
      console.log('')
    })
  }

  console.log(`Total: ${topics.length} high-value topics\n`)
}

checkHighScoreTopics()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

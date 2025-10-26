import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Standard sparks - always available
const STANDARD_SPARKS = [
  // Childhood
  { text: 'What was your first memory with this person?', category: 'Childhood' },
  { text: 'Describe a favorite childhood game you played together', category: 'Childhood' },
  { text: 'What was your favorite meal they made for you?', category: 'Childhood' },
  { text: 'Share a memory from a family vacation or trip', category: 'Childhood' },

  // Family
  { text: 'What life lesson did they teach you?', category: 'Family' },
  { text: 'Describe their laugh or smile', category: 'Family' },
  { text: 'What was a tradition you shared together?', category: 'Family' },
  { text: 'Share a story about a family celebration', category: 'Family' },
  { text: 'What would you want to thank them for?', category: 'Family' },

  // Relationships
  { text: 'How did you first meet this person?', category: 'Relationships' },
  { text: 'What made you laugh together?', category: 'Relationships' },
  { text: 'Describe a moment when they made you feel loved', category: 'Relationships' },
  { text: 'What was their signature saying or phrase?', category: 'Relationships' },

  // Achievements
  { text: 'Share a proud moment you witnessed', category: 'Achievements' },
  { text: 'What was something they were passionate about?', category: 'Achievements' },
  { text: 'Describe a challenge they overcame', category: 'Achievements' },

  // Daily Life
  { text: 'What was a typical day like with them?', category: 'Hobbies' },
  { text: 'Share a memory from an ordinary moment that meant something special', category: 'Hobbies' },
  { text: 'What hobby or interest did you share?', category: 'Hobbies' },

  // Wisdom
  { text: 'What advice would they give you?', category: 'Wisdom' },
  { text: 'Share a story that shows who they really were', category: 'Wisdom' },
  { text: 'What do you wish you could tell them now?', category: 'Wisdom' },
  { text: 'How did they make the world a better place?', category: 'Wisdom' },

  // Special Moments
  { text: 'Describe the last time you saw them', category: 'Relationships' },
  { text: 'Share your favorite photo of them and the story behind it', category: 'Relationships' },
  { text: 'What sound, smell, or song reminds you of them?', category: 'Relationships' },

  // Career
  { text: 'What were they most proud of professionally?', category: 'Career' },
  { text: 'Share a story about their work ethic or career', category: 'Career' },

  // General
  { text: 'If you could relive one day with them, which would it be?', category: 'Other' },
  { text: 'What would you like future generations to know about them?', category: 'Other' },
]

// Challenge sparks - seasonal/themed prompts
const CHALLENGE_SPARKS = [
  // Fall/Autumn
  { text: 'Share a favorite fall memory - hayrides, pumpkin patches, or cozy moments', category: 'Seasonal' },
  { text: 'What was your favorite Thanksgiving tradition together?', category: 'Seasonal' },
  { text: 'Describe a memory of raking leaves or jumping in leaf piles', category: 'Seasonal' },

  // Winter/Holidays
  { text: 'Share a favorite winter holiday memory', category: 'Seasonal' },
  { text: 'What was your favorite gift they ever gave you?', category: 'Seasonal' },
  { text: 'Describe a cozy winter moment together by the fire', category: 'Seasonal' },

  // Spring
  { text: 'Share a memory of spring flowers or gardening together', category: 'Seasonal' },
  { text: 'What was your favorite outdoor spring activity?', category: 'Seasonal' },

  // Summer
  { text: 'Describe a favorite summer adventure or road trip', category: 'Seasonal' },
  { text: 'Share a memory from the beach, lake, or pool', category: 'Seasonal' },
  { text: 'What was your favorite summer treat you enjoyed together?', category: 'Seasonal' },

  // Timeless Challenges
  { text: 'If they could see you now, what would make them most proud?', category: 'Reflection' },
  { text: 'Share a story you\'ve never told anyone about them', category: 'Reflection' },
  { text: 'What habit or trait of theirs do you now find yourself doing?', category: 'Reflection' },
]

async function seedSparks() {
  console.log('🌟 Seeding global sparks...')

  try {
    // Create standard sparks (always available)
    console.log('📝 Creating standard sparks...')
    for (const spark of STANDARD_SPARKS) {
      await prisma.spark.create({
        data: {
          ...spark,
          sparkType: 'standard',
          userId: null,
          branchId: null,
          isGlobal: true,
          isActive: true,
          usageCount: 0,
        },
      })
    }
    console.log(`✅ Created ${STANDARD_SPARKS.length} standard sparks`)

    // Create challenge sparks (seasonal/themed)
    console.log('🎯 Creating challenge sparks...')
    for (const spark of CHALLENGE_SPARKS) {
      await prisma.spark.create({
        data: {
          ...spark,
          sparkType: 'challenge',
          userId: null,
          branchId: null,
          isGlobal: true,
          isActive: true, // Can toggle seasonally
          usageCount: 0,
        },
      })
    }
    console.log(`✅ Created ${CHALLENGE_SPARKS.length} challenge sparks`)

    const totalSparks = STANDARD_SPARKS.length + CHALLENGE_SPARKS.length
    console.log(`\n🎉 Successfully created ${totalSparks} global sparks`)
    console.log(`   - ${STANDARD_SPARKS.length} standard (always available)`)
    console.log(`   - ${CHALLENGE_SPARKS.length} challenge (seasonal/themed)`)
  } catch (error) {
    console.error('❌ Error seeding sparks:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedSparks()
  .then(() => {
    console.log('🎉 Spark seeding complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to seed sparks:', error)
    process.exit(1)
  })

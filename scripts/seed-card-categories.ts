import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CARD_CATEGORIES = [
  {
    name: 'Sympathy & Condolence',
    icon: '🕯️',
    description: 'Cards to express sympathy and support during difficult times',
    displayOrder: 1,
  },
  {
    name: 'Birthday',
    icon: '🎂',
    description: 'Celebrate another year with heartfelt birthday wishes',
    displayOrder: 2,
  },
  {
    name: 'Christmas & Holiday',
    icon: '🎄',
    description: 'Spread holiday cheer and seasonal greetings',
    displayOrder: 3,
  },
  {
    name: 'Thank You',
    icon: '💐',
    description: 'Express gratitude and appreciation',
    displayOrder: 4,
  },
  {
    name: 'Thinking of You',
    icon: '💭',
    description: 'Let someone know they are in your thoughts',
    displayOrder: 5,
  },
  {
    name: 'Anniversary',
    icon: '💒',
    description: 'Celebrate love and commitment milestones',
    displayOrder: 6,
  },
  {
    name: 'New Baby',
    icon: '🌱',
    description: 'Welcome a new little light to the world',
    displayOrder: 7,
  },
  {
    name: 'Graduation',
    icon: '🎓',
    description: 'Congratulate achievement and new beginnings',
    displayOrder: 8,
  },
  {
    name: 'Encouragement & Healing',
    icon: '🌅',
    description: 'For recovery, resilience, and gentle hope.',
    displayOrder: 9,
  },
  {
    name: 'Friendship & Connection',
    icon: '✨',
    description: 'To celebrate the people who keep your world bright.',
    displayOrder: 10,
  },
  {
    name: 'Pet Remembrance',
    icon: '🐾',
    description: 'For the companions who left paw prints on our hearts.',
    displayOrder: 11,
  },
  {
    name: 'Just Because',
    icon: '💛',
    description: 'For no reason other than kindness.',
    displayOrder: 12,
  },
]

async function main() {
  console.log('🌟 Seeding card categories...')

  // Check if categories already exist
  const existingCount = await prisma.cardCategory.count()

  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing categories. Skipping seed.`)
    console.log('   Delete existing categories first if you want to re-seed.')
    return
  }

  // Create all categories
  for (const category of CARD_CATEGORIES) {
    const created = await prisma.cardCategory.create({
      data: category,
    })
    console.log(`✓ Created: ${created.icon} ${created.name}`)
  }

  console.log(`\n✨ Successfully seeded ${CARD_CATEGORIES.length} card categories!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding card categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

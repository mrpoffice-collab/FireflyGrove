import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Map CSV category names to correct category data
const CATEGORY_MAPPING = [
  {
    oldName: 'In the Quiet of Loss',
    newData: {
      name: 'Sympathy & Condolence',
      icon: '🕯️',
      description: 'Cards to express sympathy and support during difficult times',
      displayOrder: 1,
    },
  },
  {
    oldName: 'Another Year of Light',
    newData: {
      name: 'Birthday',
      icon: '🎂',
      description: 'Celebrate another year with heartfelt birthday wishes',
      displayOrder: 2,
    },
  },
  {
    oldName: 'Season of Warmth',
    newData: {
      name: 'Christmas & Holiday',
      icon: '🎄',
      description: 'Spread holiday cheer and seasonal greetings',
      displayOrder: 3,
    },
  },
  {
    oldName: 'Gratitude in Bloom',
    newData: {
      name: 'Thank You',
      icon: '💐',
      description: 'Express gratitude and appreciation',
      displayOrder: 4,
    },
  },
  {
    oldName: 'Under the Same Sky',
    newData: {
      name: 'Thinking of You',
      icon: '💭',
      description: 'Let someone know they are in your thoughts',
      displayOrder: 5,
    },
  },
  {
    oldName: 'Love, Still Growing',
    newData: {
      name: 'Anniversary',
      icon: '💒',
      description: 'Celebrate love and commitment milestones',
      displayOrder: 6,
    },
  },
  {
    oldName: 'New Light in the Grove',
    newData: {
      name: 'New Baby',
      icon: '🌱',
      description: 'Welcome a new little light to the world',
      displayOrder: 7,
    },
  },
  {
    oldName: 'Stepping Into the Light',
    newData: {
      name: 'Graduation',
      icon: '🎓',
      description: 'Congratulate achievement and new beginnings',
      displayOrder: 8,
    },
  },
]

async function main() {
  console.log('🔄 Updating card categories to correct names...\n')

  for (const mapping of CATEGORY_MAPPING) {
    const existing = await prisma.cardCategory.findFirst({
      where: { name: mapping.oldName },
    })

    if (existing) {
      const updated = await prisma.cardCategory.update({
        where: { id: existing.id },
        data: mapping.newData,
      })
      console.log(`✓ Updated: "${mapping.oldName}" → "${updated.name}" ${updated.icon}`)
    } else {
      console.log(`⚠️  Skipped: "${mapping.oldName}" (not found)`)
    }
  }

  // Deactivate categories not in the main 8
  const categoriesToDeactivate = [
    'Encouragement & Healing',
    'Friendship & Connection',
    'Pet Remembrance',
    'Just Because',
  ]

  console.log('\n⏸️  Deactivating extra categories...\n')

  for (const categoryName of categoriesToDeactivate) {
    const existing = await prisma.cardCategory.findFirst({
      where: { name: categoryName },
    })

    if (existing) {
      await prisma.cardCategory.update({
        where: { id: existing.id },
        data: { isActive: false },
      })
      console.log(`✓ Deactivated: "${categoryName}"`)
    }
  }

  console.log('\n✨ Successfully updated card categories!')
}

main()
  .catch((e) => {
    console.error('❌ Error updating card categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

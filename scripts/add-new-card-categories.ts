import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Beautiful new Firefly Grove card categories
const NEW_CATEGORIES = [
  {
    name: 'Encouragement & Healing',
    icon: '🌅',
    tagline: 'For recovery, resilience, and gentle hope.',
    description: 'The light always returns — even after the longest night.',
    displayOrder: 9,
  },
  {
    name: 'Friendship & Connection',
    icon: '✨',
    tagline: 'To celebrate the people who keep your world bright.',
    description: 'You\'re one of the steady lights I look for in the dark.',
    displayOrder: 10,
  },
  {
    name: 'Pet Remembrance',
    icon: '🐾',
    tagline: 'For the companions who left paw prints on our hearts.',
    description: 'Their joy was simple, their love was pure — and it still glows.',
    displayOrder: 11,
  },
  {
    name: 'Just Because',
    icon: '💛',
    tagline: 'For no reason other than kindness.',
    description: 'No occasion, no need — just a little light to remind you you\'re loved.',
    displayOrder: 12,
  },
]

async function addNewCategories() {
  console.log('✨ Adding new card categories to Firefly Grove...\n')

  let added = 0

  for (const category of NEW_CATEGORIES) {
    // Check if category already exists
    const existing = await prisma.cardCategory.findFirst({
      where: {
        name: category.name,
      },
    })

    if (existing) {
      console.log(`⚠️  "${category.name}" already exists - skipping`)
      continue
    }

    // Create the new category
    await prisma.cardCategory.create({
      data: {
        name: category.name,
        icon: category.icon,
        description: `${category.tagline}\n\n${category.description}`,
        displayOrder: category.displayOrder,
        isActive: true,
      },
    })

    console.log(`${category.icon} Added: "${category.name}"`)
    added++
  }

  console.log(`\n✅ Successfully added ${added} new card categories!`)
  console.log('🌟 Your Grove now has even more ways to share light.')
}

addNewCategories()
  .catch((e) => {
    console.error('❌ Error adding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ADDITIONAL_CATEGORIES = [
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
  console.log('🔄 Activating additional card categories...\n')

  for (const categoryData of ADDITIONAL_CATEGORIES) {
    const existing = await prisma.cardCategory.findFirst({
      where: { name: categoryData.name },
    })

    if (existing) {
      const updated = await prisma.cardCategory.update({
        where: { id: existing.id },
        data: {
          ...categoryData,
          isActive: true,
        },
      })
      console.log(`✓ Activated: ${updated.icon} ${updated.name}`)
      console.log(`  "${updated.description}"`)
    } else {
      // Create if doesn't exist
      const created = await prisma.cardCategory.create({
        data: {
          ...categoryData,
          isActive: true,
        },
      })
      console.log(`✓ Created: ${created.icon} ${created.name}`)
      console.log(`  "${created.description}"`)
    }
  }

  console.log('\n✨ Successfully activated all 12 card categories!')
}

main()
  .catch((e) => {
    console.error('❌ Error activating categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

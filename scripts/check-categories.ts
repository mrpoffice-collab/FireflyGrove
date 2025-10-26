import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Checking existing card categories...\n')

  const categories = await prisma.cardCategory.findMany({
    orderBy: {
      displayOrder: 'asc',
    },
    select: {
      id: true,
      name: true,
      icon: true,
      displayOrder: true,
      isActive: true,
    },
  })

  console.log(`Total categories: ${categories.length}\n`)

  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.icon} ${cat.name}`)
    console.log(`   ID: ${cat.id}`)
    console.log(`   Order: ${cat.displayOrder}`)
    console.log(`   Active: ${cat.isActive}`)
    console.log('')
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

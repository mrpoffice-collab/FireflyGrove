import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simplified templates for MVP - More can be added later
const TEMPLATES = [
  // Sympathy & Condolence
  {
    categoryName: 'Sympathy & Condolence',
    name: 'In Loving Memory',
    description: 'A gentle tribute with soft firefly silhouette',
    digitalPrice: 0.99,
    physicalPrice: 4.99,
    maxPhotos: 3,
    htmlTemplate: '<div class="template-sympathy-1"></div>',
    cssStyles: '.template-sympathy-1 { /* Custom styles */ }',
  },
  {
    categoryName: 'Sympathy & Condolence',
    name: 'Thinking of You',
    description: 'Gentle twilight scene with warm comfort',
    digitalPrice: 0.99,
    physicalPrice: 4.99,
    maxPhotos: 2,
    htmlTemplate: '<div class="template-sympathy-2"></div>',
    cssStyles: '.template-sympathy-2 { /* Custom styles */ }',
  },

  // Birthday
  {
    categoryName: 'Birthday',
    name: 'Celebrate Your Light',
    description: 'Fireflies forming balloons in celebration',
    digitalPrice: 1.99,
    physicalPrice: 5.99,
    maxPhotos: 3,
    htmlTemplate: '<div class="template-birthday-1"></div>',
    cssStyles: '.template-birthday-1 { /* Custom styles */ }',
  },
  {
    categoryName: 'Birthday',
    name: 'Another Year Brighter',
    description: 'Firefly cake candles glowing warmly',
    digitalPrice: 1.99,
    physicalPrice: 5.99,
    maxPhotos: 3,
    htmlTemplate: '<div class="template-birthday-2"></div>',
    cssStyles: '.template-birthday-2 { /* Custom styles */ }',
  },

  // Christmas & Holiday
  {
    categoryName: 'Christmas & Holiday',
    name: "Season's Glow",
    description: 'Fireflies on winter branches with holiday magic',
    digitalPrice: 1.99,
    physicalPrice: 6.99,
    maxPhotos: 3,
    htmlTemplate: '<div class="template-holiday-1"></div>',
    cssStyles: '.template-holiday-1 { /* Custom styles */ }',
  },
  {
    categoryName: 'Christmas & Holiday',
    name: 'Warm Wishes',
    description: 'Cozy firefly scene with holiday warmth',
    digitalPrice: 1.99,
    physicalPrice: 6.99,
    maxPhotos: 2,
    htmlTemplate: '<div class="template-holiday-2"></div>',
    cssStyles: '.template-holiday-2 { /* Custom styles */ }',
  },

  // Thank You
  {
    categoryName: 'Thank You',
    name: 'Grateful for You',
    description: 'Fireflies dancing among flowers',
    digitalPrice: 0.99,
    physicalPrice: 4.99,
    maxPhotos: 2,
    htmlTemplate: '<div class="template-thankyou-1"></div>',
    cssStyles: '.template-thankyou-1 { /* Custom styles */ }',
  },
  {
    categoryName: 'Thank You',
    name: "You're Appreciated",
    description: 'Simple firefly heart design',
    digitalPrice: 0.99,
    physicalPrice: 4.99,
    maxPhotos: 1,
    htmlTemplate: '<div class="template-thankyou-2"></div>',
    cssStyles: '.template-thankyou-2 { /* Custom styles */ }',
  },

  // Thinking of You
  {
    categoryName: 'Thinking of You',
    name: 'Sending Light Your Way',
    description: 'Single firefly path of connection',
    digitalPrice: 0.99,
    physicalPrice: 4.99,
    maxPhotos: 2,
    htmlTemplate: '<div class="template-thinking-1"></div>',
    cssStyles: '.template-thinking-1 { /* Custom styles */ }',
  },
  {
    categoryName: 'Thinking of You',
    name: 'Missing You',
    description: 'Distant fireflies bridging the gap',
    digitalPrice: 0.99,
    physicalPrice: 4.99,
    maxPhotos: 2,
    htmlTemplate: '<div class="template-thinking-2"></div>',
    cssStyles: '.template-thinking-2 { /* Custom styles */ }',
  },

  // Anniversary
  {
    categoryName: 'Anniversary',
    name: 'Love Still Glows',
    description: 'Two fireflies dancing together',
    digitalPrice: 1.99,
    physicalPrice: 5.99,
    maxPhotos: 3,
    htmlTemplate: '<div class="template-anniversary-1"></div>',
    cssStyles: '.template-anniversary-1 { /* Custom styles */ }',
  },
  {
    categoryName: 'Anniversary',
    name: 'Forever Bright',
    description: 'Eternal flame motif with intertwined lights',
    digitalPrice: 1.99,
    physicalPrice: 5.99,
    maxPhotos: 3,
    htmlTemplate: '<div class="template-anniversary-2"></div>',
    cssStyles: '.template-anniversary-2 { /* Custom styles */ }',
  },

  // New Baby
  {
    categoryName: 'New Baby',
    name: 'Welcome Little Light',
    description: 'Tiny firefly beginning to glow',
    digitalPrice: 1.99,
    physicalPrice: 5.99,
    maxPhotos: 2,
    htmlTemplate: '<div class="template-baby-1"></div>',
    cssStyles: '.template-baby-1 { /* Custom styles */ }',
  },
  {
    categoryName: 'New Baby',
    name: 'A New Glow',
    description: 'Firefly family welcoming the newest member',
    digitalPrice: 1.99,
    physicalPrice: 5.99,
    maxPhotos: 2,
    htmlTemplate: '<div class="template-baby-2"></div>',
    cssStyles: '.template-baby-2 { /* Custom styles */ }',
  },

  // Graduation
  {
    categoryName: 'Graduation',
    name: 'Shine Bright Graduate',
    description: 'Upward firefly path toward the future',
    digitalPrice: 1.99,
    physicalPrice: 5.99,
    maxPhotos: 3,
    htmlTemplate: '<div class="template-grad-1"></div>',
    cssStyles: '.template-grad-1 { /* Custom styles */ }',
  },
  {
    categoryName: 'Graduation',
    name: 'Your Future Glows',
    description: 'Horizon with fireflies illuminating the path ahead',
    digitalPrice: 1.99,
    physicalPrice: 5.99,
    maxPhotos: 3,
    htmlTemplate: '<div class="template-grad-2"></div>',
    cssStyles: '.template-grad-2 { /* Custom styles */ }',
  },
]

async function main() {
  console.log('🎨 Seeding card templates...')

  // Check if templates already exist
  const existingCount = await prisma.cardTemplate.count()

  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing templates. Skipping seed.`)
    console.log('   Delete existing templates first if you want to re-seed.')
    return
  }

  // Fetch all categories for mapping
  const categories = await prisma.cardCategory.findMany()
  const categoryMap = new Map(categories.map((cat) => [cat.name, cat.id]))

  let created = 0

  for (const template of TEMPLATES) {
    const categoryId = categoryMap.get(template.categoryName)

    if (!categoryId) {
      console.log(`⚠️  Category not found: ${template.categoryName}. Skipping template: ${template.name}`)
      continue
    }

    await prisma.cardTemplate.create({
      data: {
        categoryId,
        name: template.name,
        description: template.description,
        digitalPrice: template.digitalPrice,
        physicalPrice: template.physicalPrice,
        maxPhotos: template.maxPhotos,
        htmlTemplate: template.htmlTemplate,
        cssStyles: template.cssStyles,
        isActive: true,
      },
    })

    console.log(`✓ Created: ${template.name} (${template.categoryName})`)
    created++
  }

  console.log(`\n✨ Successfully seeded ${created} card templates across ${categories.length} categories!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding card templates:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Beautiful Firefly Grove-inspired messages for each category
// Format: { cover: "Short message for front", inside: "Longer message inside" }
const messages: Record<string, { cover: string; inside: string }> = {
  // Sympathy
  'In Loving Memory': {
    cover: "Some people aren't just part of our story — they are the light we see it by.",
    inside: `In quiet moments, their memory glows softly,
reminding us of love that never fades.
Like fireflies dancing through dusk,
their light continues to guide us home.`,
  },

  'Thinking of You': {
    cover: "Some people aren't just part of our story — they are the light we see it by.",
    inside: `You cross my mind in the quiet hours,
and I'm reminded how steady friendship feels.
Thank you for being one of my constants,
one of my gentle joys.`,
  },

  // Birthday
  'Happy Birthday': {
    cover: "Another year of light shared, another year of memories made.",
    inside: `May your day glow as bright as fireflies on a summer evening.
Here's to celebrating you—
the warmth you bring, the joy you share,
and all the beautiful moments yet to come.`,
  },

  // Thank You
  'Thank You': {
    cover: "Some kindnesses glow long after they're given.",
    inside: `Like a firefly's gentle light in the darkness,
your thoughtfulness brightened my world.
I'm grateful for you and the warmth you bring
to every moment we share.`,
  },

  // Default for templates without custom messages
  'Default': {
    cover: "Sending light and love your way.",
    inside: `Like fireflies dancing through the evening,
this card carries warmth across the miles.
You're thought of, you're cherished,
and you're always in my heart.`,
  },
}

async function updateMessages() {
  console.log('🔄 Updating card templates with Front/Inside messages...\n')

  const templates = await prisma.cardTemplate.findMany({
    include: { category: true },
  })

  let updated = 0
  for (const template of templates) {
    const message = messages[template.name] || messages['Default']

    await prisma.cardTemplate.update({
      where: { id: template.id },
      data: {
        coverMessage: message.cover,
        insideMessage: message.inside,
        // Update pricing to complimentary
        digitalPrice: 0.00,
        physicalPrice: 0.00,
      },
    })
    console.log(`✓ Updated "${template.name}" (${template.category.name})`)
    updated++
  }

  console.log(`\n✅ Updated ${updated} templates with Front/Inside messages!`)
  console.log('💰 All cards are complimentary for Firefly Grove members.')
}

updateMessages()
  .catch((e) => {
    console.error('Error updating messages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

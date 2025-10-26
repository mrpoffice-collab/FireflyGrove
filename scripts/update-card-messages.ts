import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Beautiful Firefly Grove-inspired messages for each category
const messages: Record<string, string> = {
  // Sympathy
  'In Loving Memory': `In the gentle glow of memory's light, we remember the warmth you brought to our lives. Like fireflies dancing in twilight, your spirit continues to illuminate our hearts. Though you journey beyond our sight, your love remains our guiding light.`,

  'Condolences': `In this quiet moment of reflection, we hold you close in thought and prayer. May the memories you treasure shine bright like fireflies in the darkness, bringing comfort and peace to your grieving heart.`,

  // Birthday
  'Happy Birthday': `Like a firefly glowing in the summer night, may your special day shine with joy and delight. Here is to another year of beautiful memories, surrounded by those who cherish you most.`,

  'Birthday Wishes': `On your birthday, we celebrate not just another year, but the light you bring into our lives. Like the warm glow of fireflies on a summer evening, your presence makes every moment brighter.`,

  // Holiday
  'Season\'s Greetings': `As the season twinkles with lights and joy, may your home be filled with warmth and love. Like fireflies dancing through winter night, may these memories glow bright in your heart.`,

  'Holiday Wishes': `In this season of wonder and reflection, we send you wishes as bright as fireflies in the evening sky. May your holidays be filled with love, laughter, and moments that become cherished memories.`,

  // Thank You
  'Thank You': `Like a firefly gently glowing, illuminating the darkness, your kindness has brightened our world. We are grateful for your thoughtfulness and the light you bring into our lives.`,

  'Grateful Heart': `In the garden of life, you are a light that guides us. Thank you for being a beacon of warmth and kindness, like fireflies dancing through our journey together.`,

  // Thinking of You
  'Thinking of You': `Though miles may separate us, you are always in our thoughts. Like fireflies carrying light through the distance, this card brings our love to remind you that you are cherished.`,

  'You\'re in Our Thoughts': `In quiet moments, we think of you. Like gentle fireflies glowing in the evening, may these words bring a soft light of comfort and remind you that you are loved.`,

  // Anniversary
  'Happy Anniversary': `Your love story continues to inspire, glowing brighter with each passing year. Like fireflies dancing together through the seasons, your journey illuminates the beauty of lasting love.`,

  'Celebrating Your Love': `Through the years, your love has been a constant light. Like fireflies in perfect harmony, you've created a beautiful dance that inspires all who witness it.`,

  // New Baby
  'Welcome Little One': `A new light has entered the world, tiny and perfect. Like a newborn firefly discovering its glow, may this precious soul shine bright and bring joy to all who love them.`,

  'Congratulations on Your Baby': `In the garden of your family, a new light begins to glow. Welcome this beautiful blessing, as precious and magical as fireflies on a summer night.`,

  // Graduation
  'Congratulations Graduate': `Your hard work has brought you to this bright moment. Like a firefly spreading its wings for the first time, you are ready to soar and illuminate the world with your unique light.`,

  'Proud of Your Achievement': `As you step into this new chapter, remember that your potential glows as bright as fireflies lighting up the night. The world awaits the light only you can bring.`,
}

async function updateMessages() {
  console.log('🔄 Updating card templates with Firefly Grove messages...\n')

  const templates = await prisma.cardTemplate.findMany({
    include: { category: true },
  })

  let updated = 0
  for (const template of templates) {
    const message = messages[template.name]

    if (message) {
      await prisma.cardTemplate.update({
        where: { id: template.id },
        data: {
          prewrittenMessage: message,
          // Update pricing to complimentary
          digitalPrice: 0.00,
          physicalPrice: 0.00,
        },
      })
      console.log(`✓ Updated "${template.name}" (${template.category.name})`)
      updated++
    } else {
      console.log(`⚠ No message found for "${template.name}"`)
    }
  }

  console.log(`\n✅ Updated ${updated} templates with Firefly Grove messages!`)
  console.log('💰 All cards are now complimentary for Firefly Grove members.')
}

updateMessages()
  .catch((e) => {
    console.error('Error updating messages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

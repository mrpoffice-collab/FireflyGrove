import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const audioPrompts = [
  // Childhood memories
  {
    question: "What's your earliest childhood memory?",
    category: 'childhood',
    isFeatured: true,
    displayOrder: 1,
  },
  {
    question: "Tell me about your favorite toy or game when you were little.",
    category: 'childhood',
    isFeatured: false,
    displayOrder: 2,
  },
  {
    question: "What was your neighborhood like when you were growing up?",
    category: 'childhood',
    isFeatured: false,
    displayOrder: 3,
  },
  {
    question: "What's a childhood adventure you'll never forget?",
    category: 'childhood',
    isFeatured: false,
    displayOrder: 4,
  },

  // Family stories
  {
    question: "Tell me about a time when you laughed so hard with family.",
    category: 'family',
    isFeatured: true,
    displayOrder: 5,
  },
  {
    question: "What's a family tradition you loved most?",
    category: 'family',
    isFeatured: false,
    displayOrder: 6,
  },
  {
    question: "Share a memory about your parents or grandparents.",
    category: 'family',
    isFeatured: false,
    displayOrder: 7,
  },
  {
    question: "What's something your family always said or did that was unique to them?",
    category: 'family',
    isFeatured: false,
    displayOrder: 8,
  },

  // Holiday memories
  {
    question: "What made Thanksgiving special in your family?",
    category: 'holidays',
    isFeatured: true,
    displayOrder: 9,
  },
  {
    question: "Share your favorite Christmas or holiday memory.",
    category: 'holidays',
    isFeatured: false,
    displayOrder: 10,
  },
  {
    question: "Tell me about a birthday celebration you'll always remember.",
    category: 'holidays',
    isFeatured: false,
    displayOrder: 11,
  },

  // Life wisdom
  {
    question: "What's the best advice you ever received?",
    category: 'wisdom',
    isFeatured: true,
    displayOrder: 12,
  },
  {
    question: "What's something you learned that you want others to know?",
    category: 'wisdom',
    isFeatured: false,
    displayOrder: 13,
  },
  {
    question: "If you could tell your younger self one thing, what would it be?",
    category: 'wisdom',
    isFeatured: false,
    displayOrder: 14,
  },

  // Traditions
  {
    question: "What's a tradition you hope continues for generations?",
    category: 'traditions',
    isFeatured: false,
    displayOrder: 15,
  },
  {
    question: "Share a meal or recipe that brings back special memories.",
    category: 'traditions',
    isFeatured: false,
    displayOrder: 16,
  },
  {
    question: "Tell me about a family gathering that stands out in your mind.",
    category: 'traditions',
    isFeatured: false,
    displayOrder: 17,
  },

  // Funny moments
  {
    question: "What's the funniest thing that ever happened to you?",
    category: 'funny',
    isFeatured: false,
    displayOrder: 18,
  },
  {
    question: "Share a story that still makes you laugh when you think about it.",
    category: 'funny',
    isFeatured: false,
    displayOrder: 19,
  },

  // Career/achievements
  {
    question: "What's something you accomplished that you're really proud of?",
    category: 'career',
    isFeatured: false,
    displayOrder: 20,
  },
  {
    question: "Tell me about your first job.",
    category: 'career',
    isFeatured: false,
    displayOrder: 21,
  },

  // Love & relationships
  {
    question: "Tell me about when you first met your partner.",
    category: 'relationships',
    isFeatured: false,
    displayOrder: 22,
  },
  {
    question: "Share a memory about your best friend.",
    category: 'relationships',
    isFeatured: false,
    displayOrder: 23,
  },

  // Places
  {
    question: "Tell me about a place that holds special meaning for you.",
    category: 'places',
    isFeatured: false,
    displayOrder: 24,
  },
  {
    question: "Share a memory from a trip or vacation you'll never forget.",
    category: 'places',
    isFeatured: false,
    displayOrder: 25,
  },
]

async function main() {
  console.log('Seeding audio prompts...')

  for (const prompt of audioPrompts) {
    await prisma.audioPrompt.create({
      data: prompt,
    })
  }

  console.log(`✅ Created ${audioPrompts.length} audio prompts`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

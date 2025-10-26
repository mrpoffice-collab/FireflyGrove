import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Beautiful, on-brand Firefly Grove category descriptions
const UPDATED_CATEGORIES = [
  {
    oldName: 'Sympathy & Condolence',
    newName: 'In the Quiet of Loss',
    icon: '🌿',
    tagline: 'Cards that honor grief with gentleness, presence, and light.',
    description: 'When loss leaves no words, these cards offer the language of warmth and remembrance.',
    displayOrder: 1,
  },
  {
    oldName: 'Birthday',
    newName: 'Another Year of Light',
    icon: '🌸',
    tagline: 'Celebrate the glow of a life still unfolding.',
    description: 'Birthdays in the Grove aren\'t about candles; they\'re about gratitude for another orbit around love, laughter, and belonging.',
    displayOrder: 2,
  },
  {
    oldName: 'Christmas & Holiday',
    newName: 'Season of Warmth',
    icon: '🌲',
    tagline: 'Wishes wrapped in quiet wonder.',
    description: 'Gentle greetings for the nights that glimmer with meaning — peace, memory, and home.',
    displayOrder: 3,
  },
  {
    oldName: 'Thank You',
    newName: 'Gratitude in Bloom',
    icon: '🌼',
    tagline: 'Because kindness should never go unspoken.',
    description: 'Words of appreciation that linger like the afterglow of a kind act — soft, sincere, enduring.',
    displayOrder: 4,
  },
  {
    oldName: 'Thinking of You',
    newName: 'Under the Same Sky',
    icon: '🌙',
    tagline: 'When you want someone to feel seen, even from afar.',
    description: 'For the friends, family, or souls you can\'t reach today — a reminder that distance doesn\'t dim connection.',
    displayOrder: 5,
  },
  {
    oldName: 'Anniversary',
    newName: 'Love, Still Growing',
    icon: '💞',
    tagline: 'Celebrate the constancy that time can\'t erode.',
    description: 'Each year adds a new ring to the tree — another story, another reason to say "still you."',
    displayOrder: 6,
  },
  {
    oldName: 'New Baby',
    newName: 'New Light in the Grove',
    icon: '🌱',
    tagline: 'Welcome a new soul with wonder and tenderness.',
    description: 'A card for beginnings — tiny hands, new laughter, and a light that changes everything.',
    displayOrder: 7,
  },
  {
    oldName: 'Graduation',
    newName: 'Stepping Into the Light',
    icon: '🎓',
    tagline: 'Honor the courage it takes to begin the next chapter.',
    description: 'These cards mark the turning of pages — celebrating growth, effort, and hope that shines ahead.',
    displayOrder: 8,
  },
]

async function updateCategories() {
  console.log('✨ Updating card categories with Firefly Grove magic...\n')

  let updated = 0

  for (const category of UPDATED_CATEGORIES) {
    // Find category by old name
    const existing = await prisma.cardCategory.findFirst({
      where: {
        name: category.oldName,
      },
    })

    if (existing) {
      await prisma.cardCategory.update({
        where: { id: existing.id },
        data: {
          name: category.newName,
          icon: category.icon,
          description: `${category.tagline}\n\n${category.description}`,
          displayOrder: category.displayOrder,
        },
      })
      console.log(`${category.icon} Updated: "${category.oldName}" → "${category.newName}"`)
      updated++
    } else {
      console.log(`⚠️  Not found: "${category.oldName}" - skipping`)
    }
  }

  console.log(`\n✅ Successfully updated ${updated} card categories!`)
  console.log('🌟 Your card categories now shine with Firefly Grove\'s voice.')
}

updateCategories()
  .catch((e) => {
    console.error('❌ Error updating categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

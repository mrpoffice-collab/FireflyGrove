import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TREASURE_PROMPTS = [
  // WISDOM
  {
    text: "Share a piece of advice you wish you'd known at 20",
    category: 'WISDOM',
    weight: 3,
  },
  {
    text: "What's one life lesson you'd want your children to remember?",
    category: 'WISDOM',
    weight: 3,
  },
  {
    text: 'Share wisdom from your parents that proved true',
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: 'What would you tell your younger self?',
    category: 'WISDOM',
    weight: 3,
  },
  {
    text: "What's the most important thing you've learned about relationships?",
    category: 'WISDOM',
    weight: 2,
  },

  // SPIRITUAL
  {
    text: 'Share a spiritual thought that brings you peace',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'What do you want your family to know about your faith?',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'Record a prayer or blessing for your loved ones',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'Share a verse or quote that speaks to your soul',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'What gives you hope on difficult days?',
    category: 'SPIRITUAL',
    weight: 3,
  },

  // GRATITUDE
  {
    text: 'What are you grateful for today?',
    category: 'GRATITUDE',
    weight: 4,
  },
  {
    text: 'Share something that made you smile this week',
    category: 'GRATITUDE',
    weight: 3,
  },
  {
    text: 'Who made a difference in your life recently?',
    category: 'GRATITUDE',
    weight: 3,
  },
  {
    text: 'What simple pleasure brought you joy today?',
    category: 'GRATITUDE',
    weight: 3,
  },
  {
    text: 'Name three things you appreciate about your life right now',
    category: 'GRATITUDE',
    weight: 2,
  },

  // LIFE_LESSON
  {
    text: "What's the hardest lesson you've learned?",
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'Share a mistake that taught you something valuable',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'What experience changed how you see the world?',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'Share a time when failure led to something better',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'What did you learn from your biggest challenge?',
    category: 'LIFE_LESSON',
    weight: 2,
  },

  // FAMILY_STORY
  {
    text: 'Share a family tradition that matters to you',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'Tell a story about someone you love',
    category: 'FAMILY_STORY',
    weight: 3,
  },
  {
    text: 'What makes your family unique?',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'Share a memory from your childhood that shaped who you are',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'What do you want your grandchildren to know about your family?',
    category: 'FAMILY_STORY',
    weight: 2,
  },

  // PARENTING
  {
    text: "What's the best advice you can give about raising children?",
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'Share something you learned from being a parent',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'What do you hope your children remember about you?',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'What would you do differently as a parent, knowing what you know now?',
    category: 'PARENTING',
    weight: 2,
  },

  // NOTE_TO_SELF
  {
    text: 'What do you need to remember today?',
    category: 'NOTE_TO_SELF',
    weight: 3,
  },
  {
    text: 'Write yourself a reminder for tough days ahead',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },
  {
    text: 'What truth do you need to hold onto right now?',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },

  // BLESSING
  {
    text: 'Write a blessing for someone you love',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: "Share a hope you have for your family's future",
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'What blessing would you speak over your children?',
    category: 'BLESSING',
    weight: 2,
  },
]

async function main() {
  console.log('📜 Seeding Treasure Chest prompts...')

  // Check if prompts already exist
  const existingCount = await prisma.treasurePrompt.count()

  if (existingCount > 0) {
    console.log(`⚠️  ${existingCount} prompts already exist. Skipping seed.`)
    console.log('   To re-seed, delete existing prompts first.')
    return
  }

  // Create all prompts
  let created = 0
  for (const promptData of TREASURE_PROMPTS) {
    await prisma.treasurePrompt.create({
      data: {
        ...promptData,
        isActive: true,
      },
    })
    created++
  }

  console.log(`✅ Created ${created} treasure prompts!`)
  console.log('')
  console.log('Categories:')
  console.log('  🧠 WISDOM: Life lessons and advice')
  console.log('  ✨ SPIRITUAL: Faith and meaning')
  console.log('  🙏 GRATITUDE: Appreciation and joy')
  console.log('  📚 LIFE_LESSON: Growth from experience')
  console.log('  👨‍👩‍👧‍👦 FAMILY_STORY: Memories and traditions')
  console.log('  👶 PARENTING: Wisdom for raising children')
  console.log('  📝 NOTE_TO_SELF: Personal reminders')
  console.log('  🫶 BLESSING: Hopes and prayers')
  console.log('')
  console.log('Ready to go! 🚀')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

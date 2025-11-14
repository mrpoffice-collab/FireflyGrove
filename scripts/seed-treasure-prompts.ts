import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TREASURE_PROMPTS = [
  // WISDOM (15 prompts - more variety)
  {
    text: "Share a piece of advice you wish you'd known at 20",
    category: 'WISDOM',
    weight: 3,
  },
  {
    text: "What's one life lesson you'd want to pass on to the next generation?",
    category: 'WISDOM',
    weight: 3,
  },
  {
    text: 'Share wisdom from your parents or mentors that proved true',
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
  {
    text: 'What truth took you the longest to accept?',
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: 'Share advice about handling money or resources wisely',
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: "What's one thing you know now that you wish everyone understood?",
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: 'What lesson did you learn the hard way?',
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: 'Share your best advice about choosing what matters in life',
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: "What's the wisest decision you ever made?",
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: 'What do you know about friendship that took years to learn?',
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: 'Share wisdom about dealing with difficult people or situations',
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: 'What advice would you give about pursuing dreams?',
    category: 'WISDOM',
    weight: 2,
  },
  {
    text: 'What do you wish more people understood about life?',
    category: 'WISDOM',
    weight: 2,
  },

  // SPIRITUAL (12 prompts)
  {
    text: 'Share a spiritual thought that brings you peace',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'What do you want your family to know about your faith or beliefs?',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'Record a prayer, intention, or blessing for your loved ones',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'Share a verse, quote, or saying that speaks to your soul',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'What gives you hope on difficult days?',
    category: 'SPIRITUAL',
    weight: 3,
  },
  {
    text: 'Share a moment when you felt deeply connected to something greater',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'What does spirituality or meaning look like in your daily life?',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'Share a practice or ritual that grounds you',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'What question about life or existence do you ponder most?',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'Share something that restores your faith in humanity',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'What miracle, small or large, are you grateful for?',
    category: 'SPIRITUAL',
    weight: 2,
  },
  {
    text: 'Share a belief or value that guides your decisions',
    category: 'SPIRITUAL',
    weight: 2,
  },

  // GRATITUDE (15 prompts - high frequency for daily practice)
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
    weight: 3,
  },
  {
    text: 'Share something beautiful you noticed today',
    category: 'GRATITUDE',
    weight: 3,
  },
  {
    text: 'Who are you thankful for and why?',
    category: 'GRATITUDE',
    weight: 3,
  },
  {
    text: 'What comfort or convenience are you grateful to have?',
    category: 'GRATITUDE',
    weight: 2,
  },
  {
    text: 'Share a moment of unexpected kindness you experienced',
    category: 'GRATITUDE',
    weight: 2,
  },
  {
    text: 'What ability or skill are you thankful you have?',
    category: 'GRATITUDE',
    weight: 2,
  },
  {
    text: 'Name something in nature that fills you with appreciation',
    category: 'GRATITUDE',
    weight: 2,
  },
  {
    text: 'What challenge are you grateful you overcame?',
    category: 'GRATITUDE',
    weight: 2,
  },
  {
    text: 'Share a favorite memory that always makes you smile',
    category: 'GRATITUDE',
    weight: 2,
  },
  {
    text: 'What meal, song, or experience brought you joy recently?',
    category: 'GRATITUDE',
    weight: 2,
  },
  {
    text: 'Who showed you love or support when you needed it?',
    category: 'GRATITUDE',
    weight: 2,
  },

  // LIFE_LESSON (15 prompts)
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
  {
    text: 'Share a time when things didn\'t go as planned but worked out anyway',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'What did you learn from a difficult relationship or situation?',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'Share something you learned about yourself during a tough time',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'What assumption or belief did life prove wrong?',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'Share a time when listening changed everything',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'What did losing something teach you?',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'Share a lesson you learned from someone unexpected',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'What experience taught you resilience or perseverance?',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'Share what you learned from taking a risk',
    category: 'LIFE_LESSON',
    weight: 2,
  },
  {
    text: 'What did you learn about letting go?',
    category: 'LIFE_LESSON',
    weight: 2,
  },

  // FAMILY_STORY (12 prompts - inclusive for all family structures)
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
    text: 'What makes your family or chosen family unique?',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'Share a memory from your childhood that shaped who you are',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'What do you want future generations to know about your family?',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'Share a funny or heartwarming family moment',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'Tell a story about a family member who inspired you',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'What family recipe, phrase, or inside joke do you treasure?',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'Share a story about your heritage or where you come from',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'What gathering or celebration holds special meaning for your family?',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'Tell a story about how you or your family overcame something difficult',
    category: 'FAMILY_STORY',
    weight: 2,
  },
  {
    text: 'Share a lesson passed down through your family',
    category: 'FAMILY_STORY',
    weight: 2,
  },

  // PARENTING (10 prompts - made inclusive for non-parents)
  {
    text: "What's the best advice you can give about raising or nurturing children?",
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'Share something you learned about parenting (from being a parent, observing parents, or being parented)',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'What do you hope children in your life remember about you?',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'What would you do differently in raising children, knowing what you know now?',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'Share wisdom about what children really need to thrive',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'What did your parents or caregivers get right that you appreciate now?',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'Share advice about balancing structure and freedom for kids',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'What do you wish you had known about childhood development?',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'Share a value or trait you hope to pass on to younger generations',
    category: 'PARENTING',
    weight: 2,
  },
  {
    text: 'What advice would you give about loving and guiding children?',
    category: 'PARENTING',
    weight: 2,
  },

  // NOTE_TO_SELF (10 prompts)
  {
    text: 'What do you need to remember today?',
    category: 'NOTE_TO_SELF',
    weight: 3,
  },
  {
    text: 'Write yourself a reminder for tough days ahead',
    category: 'NOTE_TO_SELF',
    weight: 3,
  },
  {
    text: 'What truth do you need to hold onto right now?',
    category: 'NOTE_TO_SELF',
    weight: 3,
  },
  {
    text: 'Write down what you need to let go of',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },
  {
    text: 'Remind yourself of something you often forget',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },
  {
    text: 'What boundary or limit do you need to honor?',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },
  {
    text: 'Write yourself an encouragement for when you doubt',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },
  {
    text: 'What promise do you want to keep to yourself?',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },
  {
    text: 'Remind yourself why you keep going',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },
  {
    text: 'What do you need to celebrate about yourself today?',
    category: 'NOTE_TO_SELF',
    weight: 2,
  },

  // BLESSING (11 prompts)
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
    text: 'What blessing would you speak over the children in your life?',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'Write a blessing for someone going through a difficult time',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'Share a hope you have for the world or your community',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'What blessing do you wish for your own future?',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'Write words of encouragement for someone starting a new chapter',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'Share a blessing of protection and peace',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'What do you hope for the next generation?',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'Write a blessing of gratitude for your loved ones',
    category: 'BLESSING',
    weight: 2,
  },
  {
    text: 'Share a hope or prayer for healing in your life or others',
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
  console.log('  🧠 WISDOM: 15 prompts - Life lessons and advice')
  console.log('  ✨ SPIRITUAL: 12 prompts - Faith and meaning')
  console.log('  🙏 GRATITUDE: 15 prompts - Appreciation and joy')
  console.log('  📚 LIFE_LESSON: 15 prompts - Growth from experience')
  console.log('  👨‍👩‍👧‍👦 FAMILY_STORY: 12 prompts - Memories and traditions')
  console.log('  👶 PARENTING: 10 prompts - Wisdom about children (inclusive)')
  console.log('  📝 NOTE_TO_SELF: 10 prompts - Personal reminders')
  console.log('  🫶 BLESSING: 11 prompts - Hopes and prayers')
  console.log('')
  console.log(`Total: ${created} diverse, inclusive prompts`)
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

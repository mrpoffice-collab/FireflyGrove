// Story Sparks Collections
// Organized by theme and season

export interface Spark {
  text: string
  theme: string
  month?: number // 1-12, optional for seasonal sparks
}

export interface SparkCollection {
  id: string
  name: string
  icon: string
  description: string
  sparks: Spark[]
  active: boolean
  startDate?: string // ISO date when this collection becomes active
  endDate?: string // ISO date when this collection expires
}

// Fall Gratitude Collection
export const fallGratitude: SparkCollection = {
  id: 'fall-gratitude',
  name: 'Fall Gratitude',
  icon: '🍂',
  description: 'Reflect on the gifts, the people, and the moments that fill your heart this season',
  active: true,
  startDate: '2024-10-01',
  endDate: '2024-12-31',
  sparks: [
    {
      text: "Who taught you what gratitude means without ever saying the word?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What's a tradition that fills you with warmth every November?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Describe the feeling of a perfect autumn day you'll never forget.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What small, everyday blessing do you often take for granted?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Tell about a time someone showed up for you when you needed them most.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What family recipe or meal brings everyone to the table?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Who always makes you laugh, even on the hardest days?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What place feels like home to you, and why?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Describe a moment when you felt deeply seen and understood.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What gift—tangible or not—changed your life?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Tell about a stranger's kindness you've never forgotten.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What loss taught you to appreciate what remains?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Who believed in you before you believed in yourself?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What simple pleasure brings you peace?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Describe the hands that held you when you were small.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What childhood memory still makes you smile?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Tell about a holiday that didn't go as planned but became precious anyway.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What lesson did hardship teach you?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Who do you wish you could thank one more time?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What are you grateful for right now, in this moment?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What song or piece of music always lifts your spirits?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Describe a teacher or mentor who changed the way you see the world.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What talent or skill are you thankful to have learned?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Tell about a difficult goodbye that taught you something valuable.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What book or story has stayed with you through the years?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Who made you feel welcome when you were the outsider?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What family heirloom or keepsake means the most to you, and why?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Describe a moment of unexpected beauty that took your breath away.",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "What challenge are you grateful to have overcome?",
      theme: 'gratitude',
      month: 11,
    },
    {
      text: "Who reminds you to slow down and appreciate the little things?",
      theme: 'gratitude',
      month: 11,
    },
  ],
}

// All available spark collections
export const sparkCollections: SparkCollection[] = [
  fallGratitude,
  // Future collections will be added here:
  // decemberMemories, holidayLegacy, newYearReflections, etc.
]

// Get currently active challenge spark collection
export function getActiveChallenge(): SparkCollection | null {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const active = sparkCollections.find(collection => {
    if (!collection.active) return false
    if (!collection.startDate || !collection.endDate) return collection.active

    return today >= collection.startDate && today <= collection.endDate
  })

  return active || null
}

// Get a random spark from a collection
export function getRandomSpark(collection: SparkCollection): Spark {
  const randomIndex = Math.floor(Math.random() * collection.sparks.length)
  return collection.sparks[randomIndex]
}

// Get a spark that's different from the current one
export function getRandomSparkExcluding(collection: SparkCollection, currentText: string): Spark {
  const availableSparks = collection.sparks.filter(s => s.text !== currentText)
  if (availableSparks.length === 0) return collection.sparks[0] // Fallback

  const randomIndex = Math.floor(Math.random() * availableSparks.length)
  return availableSparks[randomIndex]
}

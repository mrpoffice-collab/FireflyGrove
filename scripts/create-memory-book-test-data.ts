import { prisma } from '../lib/prisma.js'

/**
 * Create minimum test data for Memory Book PDF generation
 *
 * This script creates a complete test branch with just enough content
 * to showcase all Memory Book features:
 * - Title page with photo
 * - Obituary page with dates/bio
 * - Memory pages with photos
 * - Audio memories with QR codes
 * - Text-only memories
 */

async function createMemoryBookTestData() {
  console.log('🌟 Creating Memory Book test data...\n')

  // Find or create a test user
  let testUser = await prisma.user.findFirst({
    where: { email: 'test@fireflygrove.com' },
  })

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'test@fireflygrove.com',
        password: '$2a$10$test.hash.for.testing.only.not.real.password',
        name: 'Test User',
        status: 'ACTIVE',
        isBetaTester: true,
      },
    })
    console.log('✓ Created test user:', testUser.email)
  } else {
    console.log('✓ Using existing test user:', testUser.email)
  }

  // Find or create grove
  let grove = await prisma.grove.findFirst({
    where: { userId: testUser.id },
  })

  if (!grove) {
    grove = await prisma.grove.create({
      data: {
        userId: testUser.id,
        name: "Test User's Grove",
        planType: 'family',
        treeLimit: 10,
        status: 'active',
      },
    })
    console.log('✓ Created grove:', grove.name)
  }

  // Create a legacy tree (memorial)
  const tree = await prisma.tree.create({
    data: {
      groveId: grove.id,
      name: 'Margaret Anne Wilson',
      description: 'Beloved mother, grandmother, and friend',
      status: 'ACTIVE',
    },
  })
  console.log('✓ Created tree:', tree.name)

  // Create person record (minimal - just for relation)
  const person = await prisma.person.create({
    data: {
      name: 'Margaret Anne Wilson',
      birthDate: new Date('1942-06-15'),
      deathDate: new Date('2024-11-20'),
      isLegacy: true,
      discoveryEnabled: true,
      ownerId: testUser.id,
    },
  })
  console.log('✓ Created person:', person.name)

  // Create branch (legacy info goes here, not on Person)
  const branch = await prisma.branch.create({
    data: {
      title: 'Margaret Anne Wilson',
      description: 'A life well-lived, full of love and laughter',
      treeId: tree.id,
      personId: person.id,
      ownerId: testUser.id,
      type: 'legacy',
      personStatus: 'legacy',
      birthDate: new Date('1942-06-15'),
      deathDate: new Date('2024-11-20'),
    },
  })
  console.log('✓ Created branch:', branch.title)

  // Memory 1: Life summary (for obituary page)
  await prisma.entry.create({
    data: {
      branchId: branch.id,
      authorId: testUser.id,
      text: `Margaret Anne Wilson passed peacefully on November 20, 2024, surrounded by family. Born in Portland, Oregon in 1942, she lived a remarkable 82 years filled with love, laughter, and service to others. She was a devoted wife to Robert Wilson for 56 years, a loving mother to three children, and a cherished grandmother to seven grandchildren. Margaret worked as a school librarian for 35 years, touching countless young lives. She loved gardening, baking her famous apple pie, and volunteer work at the local animal shelter. Her kindness, wisdom, and warm smile will be deeply missed by all who knew her.`,
      visibility: 'SHARED',
      approved: true,
      status: 'ACTIVE',
      memoryCard: 'A Life Well-Lived',
    },
  })

  // Memory 2: Photo memory - Family gathering
  await prisma.entry.create({
    data: {
      branchId: branch.id,
      authorId: testUser.id,
      text: `This was taken at our family reunion last summer. Mom was so happy to have all her grandchildren together. She made her famous apple pie and we spent the whole day telling stories and laughing. I'll never forget how her eyes lit up when little Emma ran to give her a hug.`,
      visibility: 'SHARED',
      approved: true,
      status: 'ACTIVE',
      memoryCard: 'Summer 2023 - Family Reunion',
      mediaUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop', // Family gathering
    },
  })

  // Memory 3: Text-only memory
  await prisma.entry.create({
    data: {
      branchId: branch.id,
      authorId: testUser.id,
      text: `Every Sunday, Grandma would call at exactly 9am. It didn't matter where I was or what I was doing - that call was sacred. We'd talk about everything: her garden, my work, the neighbors' cat. Those calls were my anchor. I still reach for my phone on Sunday mornings.`,
      visibility: 'SHARED',
      approved: true,
      status: 'ACTIVE',
      memoryCard: 'Sunday Morning Calls',
    },
  })

  // Memory 4: Photo memory - Holiday
  await prisma.entry.create({
    data: {
      branchId: branch.id,
      authorId: testUser.id,
      text: `Christmas at Grandma's house was magical. She'd spend weeks decorating every corner, baking cookies, and wrapping presents. The smell of cinnamon and pine filled the house. This photo captures her joy perfectly - that's the same smile we saw every Christmas morning.`,
      visibility: 'SHARED',
      approved: true,
      status: 'ACTIVE',
      memoryCard: 'Christmas 2022',
      mediaUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop', // Christmas dinner
    },
  })

  // Memory 5: Audio memory (simulated - you'll need real audio)
  const audioMemory = await prisma.entry.create({
    data: {
      branchId: branch.id,
      authorId: testUser.id,
      text: `This is a recording of Mom singing her favorite hymn, "Amazing Grace." She had the most beautiful voice. We recorded this at her 80th birthday party, and I'm so grateful we captured it.`,
      visibility: 'SHARED',
      approved: true,
      status: 'ACTIVE',
      memoryCard: 'Her Beautiful Voice',
      audioUrl: 'https://example.com/sample-audio.mp3', // Replace with real audio URL
    },
  })

  // Memory 6: Short memory
  await prisma.entry.create({
    data: {
      branchId: branch.id,
      authorId: testUser.id,
      text: `"Love you more than words can say." - That's what she'd write in every birthday card.`,
      visibility: 'SHARED',
      approved: true,
      status: 'ACTIVE',
      memoryCard: 'Her Signature Line',
    },
  })

  // Memory 7: Photo memory - Garden
  await prisma.entry.create({
    data: {
      branchId: branch.id,
      authorId: testUser.id,
      text: `Grandma's rose garden was her pride and joy. She'd spend hours out there, pruning, watering, talking to her flowers. She said gardening was meditation. Every rose had a story, every bloom a memory.`,
      visibility: 'SHARED',
      approved: true,
      status: 'ACTIVE',
      memoryCard: 'The Rose Garden',
      mediaUrl: 'https://images.unsplash.com/photo-1587814854715-ea27188b0fa6?w=800&h=600&fit=crop', // Rose garden
    },
  })

  console.log('\n✅ Test data created successfully!\n')
  console.log('📊 Summary:')
  console.log(`   User: ${testUser.email}`)
  console.log(`   User ID: ${testUser.id}`)
  console.log(`   Branch: ${branch.title}`)
  console.log(`   Branch ID: ${branch.id}`)
  console.log(`   Memories: 7`)
  console.log(`   - 1 life summary (obituary)`)
  console.log(`   - 3 with photos`)
  console.log(`   - 1 with audio (QR code)`)
  console.log(`   - 2 text-only`)
  console.log('\n🧪 Test the PDF generation:')
  console.log(`   1. Login as: test@fireflygrove.com`)
  console.log(`   2. Visit: http://localhost:3000/api/memory-book/generate-preview?branchId=${branch.id}`)
  console.log(`   3. Or use browser console:`)
  console.log(`      fetch('/api/memory-book/generate-preview?branchId=${branch.id}')`)
  console.log(`        .then(r => r.blob())`)
  console.log(`        .then(blob => window.open(URL.createObjectURL(blob)))`)
  console.log('\n📖 Expected PDF:')
  console.log(`   Page 1: Title page with Margaret's photo`)
  console.log(`   Page 2: Obituary with life summary`)
  console.log(`   Pages 3-6: 7 memories (2 per page)`)
  console.log(`   Page 7: Firefly Grove attribution`)
  console.log(`   Total: ~8 pages`)

  await prisma.$disconnect()
}

createMemoryBookTestData().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database for demo mode...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@demo.local' },
    update: {},
    create: {
      email: 'alice@demo.local',
      name: 'Alice Johnson',
      password: hashedPassword,
      status: 'ACTIVE',
      subscriptionStatus: 'active',
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@demo.local' },
    update: {},
    create: {
      email: 'bob@demo.local',
      name: 'Bob Williams',
      password: hashedPassword,
      status: 'ACTIVE',
      subscriptionStatus: 'active',
    },
  })

  console.log('✓ Created demo users: Alice and Bob')

  // Create demo branches for Alice
  const zacharyBranch = await prisma.branch.create({
    data: {
      ownerId: alice.id,
      title: 'Zachary Peterson',
      description: 'My beloved grandfather who taught me to see magic in ordinary moments',
      status: 'ACTIVE',
    },
  })

  const childhoodBranch = await prisma.branch.create({
    data: {
      ownerId: alice.id,
      title: 'Childhood Adventures',
      description: 'Growing up in the old neighborhood',
      status: 'ACTIVE',
    },
  })

  console.log('✓ Created demo branches')

  // Create demo memories for Zachary Peterson branch
  await prisma.entry.create({
    data: {
      branchId: zacharyBranch.id,
      authorId: alice.id,
      text: `Grandpa Zach had this ritual every Sunday morning. He'd wake up before dawn, make a pot of strong coffee, and sit on the porch watching the fireflies fade as the sun came up. One morning when I was seven, he woke me up to join him. He said, "Alice, memories are like fireflies. They glow brightest in the quiet moments." I didn't understand then, but I do now.`,
      visibility: 'PRIVATE',
      createdAt: new Date('2024-09-15'),
    },
  })

  await prisma.entry.create({
    data: {
      branchId: zacharyBranch.id,
      authorId: alice.id,
      text: `He taught me to play chess when I was nine. Not the rules—those came easy. But the patience. The way you have to think three moves ahead, consider what the other person might do. "Life's a long game, kiddo," he'd say, moving his knight. "Don't rush the good parts." He let me win sometimes, but I always knew. That somehow made it better.`,
      visibility: 'SHARED',
      createdAt: new Date('2024-10-02'),
    },
  })

  await prisma.entry.create({
    data: {
      branchId: zacharyBranch.id,
      authorId: alice.id,
      text: `Last summer before he got sick, we went fishing at Miller's Pond. Didn't catch anything. Didn't matter. He told me about meeting Grandma at a county fair in 1952. How she beat him at the ring toss and he proposed three months later. "When you know, you know," he said. "Don't let the good ones slip away." This memory is for my daughter, when she's old enough to understand.`,
      visibility: 'LEGACY',
      legacyFlag: true,
      createdAt: new Date('2024-10-18'),
    },
  })

  // Create demo memories for Childhood branch
  await prisma.entry.create({
    data: {
      branchId: childhoodBranch.id,
      authorId: alice.id,
      text: `The treehouse Dad built in the backyard oak. It had a crooked door and a roof that leaked when it rained. We spent entire summers up there, reading comics and pretending we were pirates. Sarah carved our initials into the floorboards. I wonder if they're still there.`,
      visibility: 'PRIVATE',
      createdAt: new Date('2024-09-28'),
    },
  })

  await prisma.entry.create({
    data: {
      branchId: childhoodBranch.id,
      authorId: alice.id,
      text: `Mom's chocolate chip cookies cooling on the counter every Friday after school. The smell would hit you the moment you opened the door. She'd act like she made them for dinner, but we all knew they were just for us. Sometimes love is that simple.`,
      visibility: 'SHARED',
      createdAt: new Date('2024-10-10'),
    },
  })

  console.log('✓ Created demo memories')

  // Add Bob as a member to Zachary branch (approved)
  await prisma.branchMember.create({
    data: {
      branchId: zacharyBranch.id,
      userId: bob.id,
      role: 'GUEST',
      approved: true,
    },
  })

  // Create heir for Zachary branch
  await prisma.heir.create({
    data: {
      branchId: zacharyBranch.id,
      heirEmail: 'daughter@future.local',
      releaseCondition: 'AFTER_DATE',
      releaseDate: new Date('2040-01-01'),
    },
  })

  console.log('✓ Created demo heir records')
  console.log('🌟 Demo data seeded successfully!')
  console.log('\nDemo credentials:')
  console.log('  Email: alice@demo.local')
  console.log('  Email: bob@demo.local')
  console.log('  Password: demo123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

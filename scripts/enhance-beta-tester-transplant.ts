import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Enhance beta tester with tree transplant test scenarios
 *
 * Creates:
 * 1. Additional legacy trees owned by beta tester (for sending)
 * 2. Second user who can receive trees
 * 3. Pending transfer requests
 * 4. Accepted/completed transfer examples
 */
async function enhanceTransplantScenarios() {
  console.log('\n🌳 Enhancing Beta Tester with Tree Transplant Scenarios...\n')

  // Get beta tester
  const betaUser = await prisma.user.findUnique({
    where: { email: 'beta@fireflygrove.app' },
    include: { grove: true },
  })

  if (!betaUser) {
    console.error('❌ Beta tester not found! Run seed-beta-tester.ts first.')
    process.exit(1)
  }

  console.log(`✅ Found beta tester: ${betaUser.email}`)

  // Create second test user (recipient)
  console.log('\n  → Creating recipient user...')

  const recipientEmail = 'recipient@fireflygrove.app'
  const recipientPassword = 'Recipient2024!'

  // Delete if exists
  await prisma.user.deleteMany({ where: { email: recipientEmail } })

  const hashedPassword = await bcrypt.hash(recipientPassword, 10)

  const recipientUser = await prisma.user.create({
    data: {
      email: recipientEmail,
      password: hashedPassword,
      name: 'Sarah Thompson',
      status: 'ACTIVE',
      isBetaTester: true,
    },
  })

  // Create grove for recipient
  const recipientGrove = await prisma.grove.create({
    data: {
      userId: recipientUser.id,
      name: `${recipientUser.name}'s Grove`,
      planType: 'family',
      treeLimit: 10,
      status: 'active',
    },
  })

  console.log(`  ✅ Recipient created: ${recipientEmail}`)

  // Create additional legacy trees for beta tester to transplant
  console.log('\n  → Creating additional legacy trees for transplant...')

  const additionalTrees = [
    {
      name: 'Grandpa William (Transplant Ready)',
      birthDate: new Date('1928-04-12'),
      deathDate: new Date('2019-08-15'),
      memoryCount: 15,
    },
    {
      name: 'Aunt Martha (Pending Transfer)',
      birthDate: new Date('1945-11-20'),
      deathDate: new Date('2021-03-10'),
      memoryCount: 8,
    },
    {
      name: 'Uncle Bob (Completed Transfer)',
      birthDate: new Date('1950-07-04'),
      deathDate: new Date('2022-12-25'),
      memoryCount: 12,
    },
  ]

  const createdPersons = []

  for (const tree of additionalTrees) {
    const person = await prisma.person.create({
      data: {
        name: tree.name,
        birthDate: tree.birthDate,
        deathDate: tree.deathDate,
        isLegacy: true,
        ownerId: betaUser.id,
        moderatorId: betaUser.id,
        memoryCount: tree.memoryCount,
        discoveryEnabled: true,
      },
    })

    // Link to beta tester's grove
    await prisma.groveTreeMembership.create({
      data: {
        groveId: betaUser.grove!.id,
        personId: person.id,
        isOriginal: true,
        status: 'active',
      },
    })

    // Create a branch for this person
    const branch = await prisma.branch.create({
      data: {
        personId: person.id,
        ownerId: betaUser.id,
        title: tree.name,
        description: `Legacy tree for ${tree.name.split(' ')[0]}`,
        status: 'LEGACY_RELEASED',
        type: 'legacy',
        personStatus: 'legacy',
        birthDate: tree.birthDate,
        deathDate: tree.deathDate,
      },
    })

    // Add some memories to the branch
    for (let i = 0; i < tree.memoryCount; i++) {
      await prisma.entry.create({
        data: {
          branchId: branch.id,
          authorId: betaUser.id,
          text: `Memory ${i + 1}: A cherished moment with ${tree.name}. These stories keep their legacy alive in our hearts.`,
          visibility: 'LEGACY',
          legacyFlag: true,
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365), // Random within last year
        },
      })
    }

    createdPersons.push(person)
    console.log(`  ✅ Created: ${tree.name} (${tree.memoryCount} memories)`)
  }

  // Create tree transfer scenarios
  console.log('\n  → Creating tree transfer scenarios...')

  // Scenario 1: Pending transfer (Aunt Martha to Sarah)
  const pendingTransfer = await prisma.treeTransfer.create({
    data: {
      personId: createdPersons[1].id, // Aunt Martha
      senderUserId: betaUser.id,
      recipientEmail: recipientEmail,
      message: 'Hi Sarah, I think you should have Aunt Martha\'s tree. She was closest to you.',
      token: `transfer-pending-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    },
  })
  console.log(`  ✅ Pending transfer: Aunt Martha → ${recipientEmail}`)

  // Scenario 2: Accepted transfer (Uncle Bob to Sarah) - completed
  const acceptedTransfer = await prisma.treeTransfer.create({
    data: {
      personId: createdPersons[2].id, // Uncle Bob
      senderUserId: betaUser.id,
      recipientEmail: recipientEmail,
      message: 'Uncle Bob\'s memories belong with you now.',
      token: `transfer-accepted-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      status: 'accepted',
      acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Accepted 7 days ago
      acceptedBy: recipientUser.id,
      destinationGroveId: recipientGrove.id,
      expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days left
    },
  })

  // Actually transfer the ownership for accepted transfer
  await prisma.person.update({
    where: { id: createdPersons[2].id },
    data: {
      ownerId: recipientUser.id,
      moderatorId: recipientUser.id,
    },
  })

  // Add to recipient's grove
  await prisma.groveTreeMembership.create({
    data: {
      groveId: recipientGrove.id,
      personId: createdPersons[2].id,
      isOriginal: false, // Received, not planted
      status: 'active',
    },
  })

  // Update branch ownership
  const uncleBobBranch = await prisma.branch.findFirst({
    where: { personId: createdPersons[2].id },
  })
  if (uncleBobBranch) {
    await prisma.branch.update({
      where: { id: uncleBobBranch.id },
      data: { ownerId: recipientUser.id },
    })
  }

  console.log(`  ✅ Accepted transfer: Uncle Bob → ${recipientEmail} (COMPLETED)`)

  // Scenario 3: Expired transfer (example from past)
  const expiredTransfer = await prisma.treeTransfer.create({
    data: {
      personId: createdPersons[0].id, // Grandpa William
      senderUserId: betaUser.id,
      recipientEmail: 'oldrequest@example.com',
      message: 'Old transfer that expired',
      token: `transfer-expired-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      status: 'expired',
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired 5 days ago
    },
  })
  console.log(`  ✅ Expired transfer: Grandpa William (for reference)`)

  // Summary
  console.log('\n✅ Tree Transplant Scenarios Created!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n👤 BETA TESTER (Sender)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:    beta@fireflygrove.app')
  console.log('🔑 Password: BetaTest2024!')
  console.log(`🌳 Trees:    ${5 + createdPersons.length} total (5 original + ${createdPersons.length} for transplant)`)
  console.log('\n  New Trees for Transplant:')
  console.log('  1. Grandpa William (Ready to send)')
  console.log('  2. Aunt Martha (Transfer pending to Sarah)')
  console.log('  3. Uncle Bob (Transfer completed ✓)')
  console.log('\n👤 RECIPIENT USER')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:    recipient@fireflygrove.app')
  console.log('🔑 Password: Recipient2024!')
  console.log('🌳 Trees:    1 (received Uncle Bob\'s tree)')
  console.log('\n📤 TRANSFER SCENARIOS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  ⏳ Pending:  Aunt Martha → Sarah')
  console.log('  ✅ Accepted: Uncle Bob → Sarah (COMPLETED)')
  console.log('  ⏰ Expired:  Grandpa William (old request)')
  console.log('\n🧪 WHAT TO TEST')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('AS BETA TESTER:')
  console.log('  • Send Grandpa William\'s tree to someone')
  console.log('  • View pending transfer (Aunt Martha)')
  console.log('  • Cancel a transfer')
  console.log('  • Resend expired transfer')
  console.log('\nAS RECIPIENT:')
  console.log('  • Log in and see Uncle Bob in your grove')
  console.log('  • Accept pending transfer (Aunt Martha)')
  console.log('  • Decline a transfer')
  console.log('  • Manage received trees')
  console.log('\n🌐 Login URLs:')
  console.log('Beta: https://firefly-grove.vercel.app/login')
  console.log('Recipient: https://firefly-grove.vercel.app/login')
  console.log('')
}

enhanceTransplantScenarios()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

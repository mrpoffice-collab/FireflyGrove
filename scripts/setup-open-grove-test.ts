import { prisma } from '../lib/prisma'
import { getOrCreateOpenGrove, getOpenGroveId } from '../lib/openGrove'
import bcrypt from 'bcryptjs'

/**
 * Set up Open Grove test scenarios
 *
 * Creates:
 * 1. Open Grove (system grove)
 * 2. Legacy trees in various states
 * 3. Test accounts for creation and adoption
 * 4. Memory limit testing (100 in Open Grove)
 * 5. Trustee expiration scenarios
 */
async function setupOpenGroveTest() {
  console.log('\n✨ Setting Up Open Grove Test Scenarios...\n')

  // Step 1: Ensure Open Grove exists
  console.log('  → Initializing Open Grove...')
  const openGrove = await getOrCreateOpenGrove()
  console.log(`  ✅ Open Grove ready: ${openGrove.name}`)

  // Step 2: Get beta tester
  const betaUser = await prisma.user.findUnique({
    where: { email: 'beta@fireflygrove.app' },
    include: { grove: true },
  })

  if (!betaUser) {
    console.error('  ❌ Beta tester not found! Run seed-beta-tester.ts first.')
    process.exit(1)
  }

  console.log(`  ✅ Beta tester found: ${betaUser.email}`)

  // Step 3: Create adopter user (different from recipient)
  console.log('\n  → Creating adopter user...')

  const adopterEmail = 'adopter@fireflygrove.app'
  const adopterPassword = 'Adopter2024!'

  // Delete if exists
  await prisma.user.deleteMany({ where: { email: adopterEmail } })

  const hashedPassword = await bcrypt.hash(adopterPassword, 10)

  const adopterUser = await prisma.user.create({
    data: {
      email: adopterEmail,
      password: hashedPassword,
      name: 'Michael Thompson',
      status: 'ACTIVE',
      isBetaTester: true,
    },
  })

  // Create grove for adopter
  const adopterGrove = await prisma.grove.create({
    data: {
      userId: adopterUser.id,
      name: `${adopterUser.name}'s Grove`,
      planType: 'family',
      treeLimit: 10,
      status: 'active',
    },
  })

  console.log(`  ✅ Adopter created: ${adopterEmail}`)

  // Step 4: Create legacy trees in Open Grove with different scenarios
  console.log('\n  → Creating legacy trees in Open Grove...')

  const legacyScenarios = [
    {
      name: 'John Doe (Ready for Adoption)',
      birthDate: new Date('1940-05-15'),
      deathDate: new Date('2023-08-20'),
      trusteeExpiresAt: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days left
      memoryCount: 25,
      owner: betaUser.id,
      trustee: betaUser.id,
      description: 'Tree with 25 memories, ready to adopt',
    },
    {
      name: 'Jane Smith (At Memory Limit)',
      birthDate: new Date('1935-11-03'),
      deathDate: new Date('2024-01-10'),
      trusteeExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days left
      memoryCount: 100, // AT LIMIT!
      owner: betaUser.id,
      trustee: betaUser.id,
      description: 'Tree at 100 memory limit (Open Grove limit)',
    },
    {
      name: 'Robert Johnson (Trustee Expired)',
      birthDate: new Date('1945-02-28'),
      deathDate: new Date('2022-12-05'),
      trusteeExpiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expired 10 days ago
      memoryCount: 15,
      owner: betaUser.id,
      trustee: betaUser.id,
      description: 'Trustee period expired, ready for adoption',
    },
    {
      name: 'Mary Williams (Fresh Tree)',
      birthDate: new Date('1950-07-12'),
      deathDate: new Date('2024-10-01'),
      trusteeExpiresAt: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000), // 58 days left (fresh)
      memoryCount: 5,
      owner: adopterUser.id, // Different owner for adoption testing
      trustee: adopterUser.id,
      description: 'Fresh tree, owned by adopter, few memories',
    },
    {
      name: 'James Brown (Public Tree)',
      birthDate: new Date('1938-04-19'),
      deathDate: new Date('2021-06-30'),
      trusteeExpiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days left
      memoryCount: 50,
      owner: betaUser.id,
      trustee: betaUser.id,
      description: 'Tree with discovery enabled, searchable',
    },
  ]

  const createdLegacyTrees = []
  const openGroveId = await getOpenGroveId()

  for (const scenario of legacyScenarios) {
    // Create Person (legacy tree)
    const person = await prisma.person.create({
      data: {
        name: scenario.name,
        birthDate: scenario.birthDate,
        deathDate: scenario.deathDate,
        isLegacy: true,
        ownerId: scenario.owner,
        trusteeId: scenario.trustee,
        moderatorId: scenario.owner,
        trusteeExpiresAt: scenario.trusteeExpiresAt,
        discoveryEnabled: true,
        memoryLimit: 100, // Open Grove limit
        memoryCount: scenario.memoryCount,
      },
    })

    // Get or create Open Grove tree
    let openGroveTree = await prisma.tree.findFirst({
      where: { groveId: openGroveId },
    })

    if (!openGroveTree) {
      openGroveTree = await prisma.tree.create({
        data: {
          groveId: openGroveId,
          name: 'Open Grove Memorials',
          status: 'ACTIVE',
        },
      })
    }

    // Create branch for this person
    const branch = await prisma.branch.create({
      data: {
        treeId: openGroveTree.id,
        personId: person.id,
        ownerId: scenario.owner,
        title: scenario.name,
        description: scenario.description,
        personStatus: 'legacy',
        type: 'legacy',
        status: 'ACTIVE',
        birthDate: scenario.birthDate,
        deathDate: scenario.deathDate,
      },
    })

    // Link to Open Grove
    await prisma.groveTreeMembership.create({
      data: {
        groveId: openGroveId,
        personId: person.id,
        isOriginal: true,
        status: 'active',
        adoptionType: 'adopted',
      },
    })

    // Create memories
    for (let i = 0; i < scenario.memoryCount; i++) {
      await prisma.entry.create({
        data: {
          branchId: branch.id,
          authorId: scenario.owner,
          text: `Memory ${i + 1}: ${scenario.name} was a wonderful person. This cherished moment reminds us of their kindness and the love they shared with everyone.`,
          visibility: 'LEGACY',
          legacyFlag: true,
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365), // Random within last year
        },
      })
    }

    createdLegacyTrees.push({
      person,
      branch,
      ...scenario,
    })

    console.log(`  ✅ Created: ${scenario.name} (${scenario.memoryCount} memories)`)
  }

  // Step 5: Create a tree already adopted (for comparison)
  console.log('\n  → Creating already-adopted tree...')

  const adoptedPerson = await prisma.person.create({
    data: {
      name: 'Adopted Tree - Alice Cooper',
      birthDate: new Date('1942-06-15'),
      deathDate: new Date('2023-03-20'),
      isLegacy: true,
      ownerId: adopterUser.id,
      trusteeId: adopterUser.id,
      moderatorId: adopterUser.id,
      trusteeExpiresAt: null, // Already adopted, no expiration
      discoveryEnabled: false, // Private after adoption
      memoryLimit: null, // Unlimited in private grove
      memoryCount: 35,
    },
  })

  const adoptedBranch = await prisma.branch.create({
    data: {
      personId: adoptedPerson.id,
      ownerId: adopterUser.id,
      title: 'Adopted Tree - Alice Cooper',
      description: 'Already adopted into private grove',
      personStatus: 'legacy',
      type: 'legacy',
      status: 'ACTIVE',
      birthDate: adoptedPerson.birthDate,
      deathDate: adoptedPerson.deathDate,
    },
  })

  // Link to adopter's private grove (NOT Open Grove)
  await prisma.groveTreeMembership.create({
    data: {
      groveId: adopterGrove.id,
      personId: adoptedPerson.id,
      isOriginal: true,
      status: 'active',
      adoptionType: 'adopted',
    },
  })

  // Increment tree count
  await prisma.grove.update({
    where: { id: adopterGrove.id },
    data: { treeCount: { increment: 1 } },
  })

  // Create memories (no limit in private grove)
  for (let i = 0; i < 35; i++) {
    await prisma.entry.create({
      data: {
        branchId: adoptedBranch.id,
        authorId: adopterUser.id,
        text: `Memory ${i + 1}: Alice was amazing. These memories are unlimited in my private grove!`,
        visibility: 'PRIVATE',
        legacyFlag: true,
        status: 'ACTIVE',
      },
    })
  }

  console.log(`  ✅ Created: Adopted Tree - Alice Cooper (35 memories, in private grove)`)

  // Summary
  console.log('\n✨ Open Grove Test Scenarios Complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🌲 OPEN GROVE (System Grove)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Grove ID: ${openGroveId}`)
  console.log(`Legacy Trees: ${createdLegacyTrees.length}`)
  console.log(`\n  Trees in Open Grove:`)
  createdLegacyTrees.forEach((tree, i) => {
    console.log(`  ${i + 1}. ${tree.name}`)
    console.log(`     Memories: ${tree.memoryCount}/100`)
    console.log(`     Trustee Expires: ${tree.trusteeExpiresAt < new Date() ? 'EXPIRED' : 'Active'}`)
    console.log(`     Owner: ${tree.owner === betaUser.id ? 'Beta Tester' : 'Adopter'}`)
    console.log('')
  })

  console.log('\n👤 BETA TESTER (Creator/Trustee)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:    beta@fireflygrove.app')
  console.log('🔑 Password: BetaTest2024!')
  console.log('🌳 Trees:    Owns 4 legacy trees in Open Grove')
  console.log('\n  Can Test:')
  console.log('  • Create new legacy trees')
  console.log('  • Add memories (up to 100 limit)')
  console.log('  • Adopt trees into private grove')
  console.log('  • View trustee expiration warnings')

  console.log('\n👤 ADOPTER (Receiver)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:    adopter@fireflygrove.app')
  console.log('🔑 Password: Adopter2024!')
  console.log('🌳 Trees:    1 in Open Grove + 1 already adopted')
  console.log('\n  Can Test:')
  console.log('  • Adopt trees from Open Grove')
  console.log('  • See memory limit removed after adoption')
  console.log('  • Manage adopted tree (unlimited memories)')
  console.log('  • View Open Grove vs Private Grove trees')

  console.log('\n🧪 TEST SCENARIOS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n1. Memory Limit Testing:')
  console.log('   • Jane Smith: AT 100 memory limit (try to add 101st)')
  console.log('   • John Doe: 25 memories (can add 75 more)')
  console.log('   • Alice Cooper: 35 memories in private grove (unlimited)')

  console.log('\n2. Adoption Testing:')
  console.log('   • Adopt John Doe → See limit removed')
  console.log('   • Adopt Mary Williams (owned by adopter)')
  console.log('   • Try to adopt someone else\'s tree (should fail)')

  console.log('\n3. Trustee Expiration:')
  console.log('   • Robert Johnson: Expired 10 days ago')
  console.log('   • Mary Williams: Fresh (58 days left)')
  console.log('   • John Doe: 50 days left')

  console.log('\n4. Discovery/Search:')
  console.log('   • Search for legacy trees in Open Grove')
  console.log('   • James Brown: Public, searchable')
  console.log('   • Alice Cooper: Private (not searchable)')

  console.log('\n🌐 Login URLs:')
  console.log('Beta Tester: https://firefly-grove.vercel.app/login')
  console.log('Adopter: https://firefly-grove.vercel.app/login')
  console.log('Open Grove Page: https://firefly-grove.vercel.app/open-grove')
  console.log('\n')
}

setupOpenGroveTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

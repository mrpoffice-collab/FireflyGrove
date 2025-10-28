import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Create a "power user" beta tester account
 * Highly active user with lots of data to stress test features
 */
async function seedBetaTester() {
  console.log('\n🧪 Creating Beta Tester Account...\n')

  // Test user credentials
  const testEmail = 'beta@fireflygrove.app'
  const testPassword = 'BetaTest2024!'
  const hashedPassword = await bcrypt.hash(testPassword, 10)

  // Delete existing beta tester if exists
  const existing = await prisma.user.findUnique({
    where: { email: testEmail },
  })

  if (existing) {
    console.log('  ⚠️  Existing beta tester found, deleting...')
    await prisma.user.delete({ where: { email: testEmail } })
  }

  // Create beta tester user
  console.log('  → Creating user account...')
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      password: hashedPassword,
      name: 'Beta Tester',
      status: 'ACTIVE',
      isBetaTester: true,
      isAdmin: false,
    },
  })

  // Create Grove for the user
  const grove = await prisma.grove.create({
    data: {
      userId: user.id,
      name: 'Beta Tester Grove',
      planType: 'family', // Family plan for testing
      treeLimit: 10,
      treeCount: 0,
      status: 'active',
    },
  })

  console.log(`  ✅ User created: ${user.email}`)
  console.log(`  ✅ Grove created: ${grove.name}`)

  // Create multiple branches (family members)
  console.log('\n  → Creating family branches...')

  const branches = [
    {
      title: 'Rose Elizabeth Thompson (Grandma Rose)',
      description: 'Matriarch of the family, born 1935',
      birthDate: new Date('1935-03-15'),
      deathDate: new Date('2018-11-22'),
      type: 'legacy',
      status: 'LEGACY_RELEASED',
      entryCount: 25,
    },
    {
      title: 'Joseph Michael Thompson (Grandpa Joe)',
      description: 'WWII Veteran, carpenter',
      birthDate: new Date('1932-07-04'),
      deathDate: new Date('2015-06-10'),
      type: 'legacy',
      status: 'LEGACY_RELEASED',
      entryCount: 18,
    },
    {
      title: 'Margaret Ann Thompson (Mom)',
      description: 'Still with us, documenting her stories',
      birthDate: new Date('1960-05-20'),
      deathDate: null,
      type: 'living',
      status: 'ACTIVE',
      entryCount: 35,
    },
    {
      title: 'Frank David Thompson (Uncle Frank)',
      description: 'Vietnam Vet, storyteller',
      birthDate: new Date('1955-09-12'),
      deathDate: new Date('2020-03-05'),
      type: 'legacy',
      status: 'LEGACY_RELEASED',
      entryCount: 12,
    },
    {
      title: 'Carol Sue Henderson (Aunt Carol)',
      description: 'Teacher, photographer',
      birthDate: new Date('1958-12-25'),
      deathDate: null,
      type: 'living',
      status: 'ACTIVE',
      entryCount: 40,
    },
  ]

  const createdBranches = []
  for (const branchData of branches) {
    const { entryCount, ...data } = branchData
    const branch = await prisma.branch.create({
      data: {
        ownerId: user.id,
        ...data,
      },
    })
    createdBranches.push({ ...branch, entryCount })
    console.log(`    ✓ ${branch.title} (${entryCount} entries planned)`)
  }

  // Create entries (memories) for each branch
  console.log('\n  → Creating entries...')

  const visibilities = ['PRIVATE', 'SHARED', 'LEGACY']

  let totalEntries = 0

  for (const branchData of createdBranches) {
    const entriesForBranch = branchData.entryCount

    for (let i = 0; i < entriesForBranch; i++) {
      const hasMedia = Math.random() > 0.5
      const hasAudio = Math.random() > 0.7
      const visibility = visibilities[Math.floor(Math.random() * visibilities.length)]

      const entry = await prisma.entry.create({
        data: {
          branchId: branchData.id,
          authorId: user.id,
          text: `Memory ${i + 1}: This is a cherished memory about ${branchData.title}. They always said that family comes first, and these moments remind us of the love they shared with everyone around them. These stories help keep their spirit alive.`,
          visibility,
          legacyFlag: branchData.type === 'legacy',
          mediaUrl: hasMedia ? `https://picsum.photos/seed/${branchData.id}-${i}/800/600` : null,
          audioUrl: hasAudio ? `https://example.com/audio/${branchData.id}-${i}.mp3` : null,
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 5), // Random date within last 5 years
        },
      })
      totalEntries++
    }

    console.log(`    ✓ ${branchData.title}: ${entriesForBranch} entries`)
  }

  // Create heirs for legacy branches
  console.log('\n  → Creating heirs...')

  const heirEmails = [
    'sarah@example.com',
    'michael@example.com',
    'emma@example.com',
  ]

  let totalHeirs = 0

  // Add heirs to each legacy branch
  for (const branchData of createdBranches) {
    if (branchData.type === 'legacy') {
      for (const email of heirEmails) {
        const heir = await prisma.heir.create({
          data: {
            branchId: branchData.id,
            heirEmail: email,
            releaseCondition: 'AFTER_DEATH',
            notified: branchData.status === 'LEGACY_RELEASED',
            notifiedAt: branchData.status === 'LEGACY_RELEASED' ? new Date() : null,
          },
        })
        totalHeirs++
      }
      console.log(`    ✓ ${branchData.title}: ${heirEmails.length} heirs`)
    }
  }

  // Create some backup records (global system backups)
  console.log('\n  → Creating backup history...')

  for (let i = 0; i < 3; i++) {
    await prisma.backup.create({
      data: {
        filename: `beta-backup-${Date.now()}-${i}.zip`,
        storageUrl: `https://example.com/backups/backup-${i}.zip`,
        size: Math.floor(Math.random() * 500000000) + 100000000, // 100MB - 600MB
        hash: `sha256-${Math.random().toString(36).substring(2, 15)}`,
        verified: true,
        verifiedAt: new Date(),
        createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000), // Weekly backups
      },
    })
  }
  console.log(`    ✓ 3 backup records`)

  // Summary
  console.log('\n✅ Beta Tester Account Created!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:    beta@fireflygrove.app')
  console.log('🔑 Password: BetaTest2024!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🏡 Grove:     ${grove.name} (${grove.planType})`)
  console.log(`🌳 Branches:  ${createdBranches.length} (3 legacy, 2 living)`)
  console.log(`📝 Entries:   ${totalEntries}`)
  console.log(`👨‍👩‍👧 Heirs:     ${totalHeirs} (across legacy branches)`)
  console.log(`💾 Backups:   3`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('🧪 Test Features:')
  console.log('  • Memorial video maker (5 branches with 130 entries)')
  console.log('  • Export functionality (lots of data to test)')
  console.log('  • Heir management (heirs on legacy branches)')
  console.log('  • Legacy branch system (3 released, 2 living)')
  console.log('  • Search/filtering (130 entries across branches)')
  console.log('  • Backup system (3 existing backups)')
  console.log('  • Multi-media entries (photos and audio)')
  console.log('  • Visibility controls (private, shared, legacy)')
  console.log('\n🌐 Login at: https://firefly-grove.vercel.app/login\n')
}

seedBetaTester()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

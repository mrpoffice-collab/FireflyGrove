/**
 * Fix Memorial Branches Migration Script
 *
 * This script finds all Person records (memorials) that don't have
 * associated Branch records and creates them.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMemorialBranches() {
  console.log('🔍 Finding memorials without branches...')

  // Find all legacy Person records
  const persons = await prisma.person.findMany({
    where: {
      isLegacy: true,
    },
    include: {
      branches: true,
      memberships: {
        include: {
          grove: {
            include: {
              trees: true,
            },
          },
        },
      },
    },
  })

  console.log(`Found ${persons.length} total legacy persons`)

  let fixed = 0
  let skipped = 0

  for (const person of persons) {
    // Check if person already has a branch
    if (person.branches.length > 0) {
      console.log(`✓ ${person.name} already has ${person.branches.length} branch(es)`)
      skipped++
      continue
    }

    console.log(`\n🔧 Fixing ${person.name} (${person.id})`)

    // Find the grove this person belongs to
    const membership = person.memberships[0]
    if (!membership) {
      console.log(`  ⚠️  No grove membership found, skipping`)
      continue
    }

    const grove = membership.grove
    console.log(`  Found grove: ${grove.name}`)

    // Find or create a tree in this grove
    let tree = grove.trees[0]
    if (!tree) {
      console.log(`  Creating tree in grove...`)
      tree = await prisma.tree.create({
        data: {
          groveId: grove.id,
          name: grove.isOpenGrove ? 'Open Grove Memorials' : 'Family Tree',
          status: 'ACTIVE',
        },
      })
      console.log(`  ✓ Tree created: ${tree.id}`)
    } else {
      console.log(`  Using existing tree: ${tree.id}`)
    }

    // Create the branch
    try {
      const branch = await prisma.branch.create({
        data: {
          treeId: tree.id,
          title: person.name,
          personStatus: 'legacy',
          ownerId: person.ownerId || person.trusteeId || 'UNKNOWN',
          personId: person.id,
          status: 'ACTIVE',
          birthDate: person.birthDate,
          deathDate: person.deathDate,
        },
      })

      console.log(`  ✓ Branch created: ${branch.id}`)
      fixed++
    } catch (error: any) {
      console.error(`  ✗ Error creating branch:`, error.message)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Total memorials: ${persons.length}`)
  console.log(`   Already had branches: ${skipped}`)
  console.log(`   Fixed (branches created): ${fixed}`)
  console.log(`   Failed: ${persons.length - skipped - fixed}`)
}

// Run the migration
fixMemorialBranches()
  .then(() => {
    console.log('\n✅ Migration complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

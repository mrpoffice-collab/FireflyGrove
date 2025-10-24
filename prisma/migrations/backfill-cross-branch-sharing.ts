/**
 * Backfill Migration for Cross-Branch Sharing
 *
 * This script:
 * 1. Creates origin MemoryBranchLinks for all existing entries
 * 2. Creates default BranchPreferences for all existing branches
 *
 * Run with: npx ts-node prisma/migrations/backfill-cross-branch-sharing.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting cross-branch sharing backfill migration...')

  // Step 1: Create origin links for all existing entries
  console.log('\n📝 Step 1: Creating origin links for existing entries...')

  const entries = await prisma.entry.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'WITHDRAWN'],
      },
    },
    select: {
      id: true,
      branchId: true,
    },
  })

  console.log(`Found ${entries.length} entries to process`)

  let createdLinks = 0
  let skippedLinks = 0

  for (const entry of entries) {
    // Check if origin link already exists
    const existingLink = await prisma.memoryBranchLink.findFirst({
      where: {
        memoryId: entry.id,
        branchId: entry.branchId,
        role: 'origin',
      },
    })

    if (existingLink) {
      skippedLinks++
      continue
    }

    // Create origin link
    await prisma.memoryBranchLink.create({
      data: {
        memoryId: entry.id,
        branchId: entry.branchId,
        role: 'origin',
        visibilityStatus: 'active',
      },
    })

    createdLinks++

    if (createdLinks % 100 === 0) {
      console.log(`  Progress: ${createdLinks} links created...`)
    }
  }

  console.log(`✅ Created ${createdLinks} origin links`)
  console.log(`⏭️  Skipped ${skippedLinks} existing links`)

  // Step 2: Create default preferences for all existing branches
  console.log('\n📝 Step 2: Creating default preferences for existing branches...')

  const branches = await prisma.branch.findMany({
    where: {
      archived: false,
    },
    select: {
      id: true,
    },
  })

  console.log(`Found ${branches.length} branches to process`)

  let createdPrefs = 0
  let skippedPrefs = 0

  for (const branch of branches) {
    // Check if preferences already exist
    const existingPrefs = await prisma.branchPreferences.findUnique({
      where: {
        branchId: branch.id,
      },
    })

    if (existingPrefs) {
      skippedPrefs++
      continue
    }

    // Create default preferences
    await prisma.branchPreferences.create({
      data: {
        branchId: branch.id,
        canBeTagged: true,
        requiresTagApproval: false,
        visibleInCrossShares: true,
      },
    })

    createdPrefs++

    if (createdPrefs % 50 === 0) {
      console.log(`  Progress: ${createdPrefs} preferences created...`)
    }
  }

  console.log(`✅ Created ${createdPrefs} branch preferences`)
  console.log(`⏭️  Skipped ${skippedPrefs} existing preferences`)

  console.log('\n✨ Migration completed successfully!')
}

main()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

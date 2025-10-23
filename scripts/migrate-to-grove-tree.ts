/**
 * Migration Script: Migrate existing Branches to Grove/Tree structure
 *
 * This script:
 * 1. Creates a default Grove for each existing user with Branches
 * 2. Creates a default Tree in each Grove
 * 3. Assigns all existing Branches to the default Tree
 *
 * Run with: npx ts-node scripts/migrate-to-grove-tree.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  console.log('🌳 Starting Grove/Tree migration...\n')

  try {
    // Get all users who own branches
    const usersWithBranches = await prisma.user.findMany({
      where: {
        ownedBranches: {
          some: {},
        },
      },
      include: {
        ownedBranches: true,
      },
    })

    console.log(`Found ${usersWithBranches.length} users with branches\n`)

    for (const user of usersWithBranches) {
      console.log(`Processing user: ${user.email}`)

      // Check if user already has a Grove
      let grove = await prisma.grove.findUnique({
        where: { userId: user.id },
      })

      if (!grove) {
        // Create default Grove for user
        grove = await prisma.grove.create({
          data: {
            userId: user.id,
            name: `${user.name}'s Grove`,
            planType: 'family', // Default to family plan
            treeLimit: 10,
            treeCount: 0,
            status: 'active',
          },
        })
        console.log(`  ✓ Created Grove: ${grove.name}`)
      } else {
        console.log(`  ℹ Grove already exists: ${grove.name}`)
      }

      // Check if user already has a Tree in this Grove
      let tree = await prisma.tree.findFirst({
        where: {
          groveId: grove.id,
        },
      })

      if (!tree) {
        // Create default Tree for user
        tree = await prisma.tree.create({
          data: {
            groveId: grove.id,
            name: 'Family Tree',
            description: 'Default tree for your family memories',
            status: 'ACTIVE',
          },
        })
        console.log(`  ✓ Created Tree: ${tree.name}`)
      } else {
        console.log(`  ℹ Tree already exists: ${tree.name}`)
      }

      // Update all branches to belong to this tree
      const branchesWithoutTree = user.ownedBranches.filter(
        (b: any) => !b.treeId
      )

      if (branchesWithoutTree.length > 0) {
        await prisma.branch.updateMany({
          where: {
            id: { in: branchesWithoutTree.map((b: any) => b.id) },
          },
          data: {
            treeId: tree.id,
          },
        })
        console.log(`  ✓ Migrated ${branchesWithoutTree.length} branches to tree`)
      }

      console.log('')
    }

    // Handle users without branches (give them a Grove too)
    const usersWithoutBranches = await prisma.user.findMany({
      where: {
        ownedBranches: {
          none: {},
        },
        grove: null,
      },
    })

    console.log(`\nFound ${usersWithoutBranches.length} users without branches or groves`)

    for (const user of usersWithoutBranches) {
      const grove = await prisma.grove.create({
        data: {
          userId: user.id,
          name: `${user.name}'s Grove`,
          planType: 'trial',
          treeLimit: 1,
          treeCount: 0,
          status: 'active',
        },
      })
      console.log(`  ✓ Created trial Grove for: ${user.email}`)
    }

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()

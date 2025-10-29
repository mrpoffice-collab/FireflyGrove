/**
 * Fix Open Grove Memberships
 *
 * Ensures all legacy trees with discoveryEnabled=true have proper
 * GroveTreeMembership records linking them to the Open Grove.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getOpenGroveId(): Promise<string> {
  const openGrove = await prisma.grove.findFirst({
    where: { isOpenGrove: true },
  })

  if (!openGrove) {
    throw new Error('Open Grove not found! Run the app first to create it.')
  }

  return openGrove.id
}

async function main() {
  console.log('🔍 Checking Open Grove memberships...\n')

  const openGroveId = await getOpenGroveId()
  console.log(`📍 Open Grove ID: ${openGroveId}\n`)

  // Find all legacy trees with discoveryEnabled
  const legacyTrees = await prisma.person.findMany({
    where: {
      isLegacy: true,
      discoveryEnabled: true,
    },
    include: {
      memberships: {
        where: {
          groveId: openGroveId,
        },
      },
      branches: {
        take: 1,
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  console.log(`Found ${legacyTrees.length} legacy trees with discoveryEnabled=true\n`)

  let fixedCount = 0
  let alreadyOkCount = 0

  for (const tree of legacyTrees) {
    const hasMembership = tree.memberships.length > 0
    const branchTitle = tree.branches[0]?.title || tree.name

    if (hasMembership) {
      console.log(`✅ ${tree.name} - Already has Open Grove membership`)
      alreadyOkCount++
    } else {
      console.log(`🔧 ${tree.name} - Missing membership, creating...`)

      await prisma.groveTreeMembership.create({
        data: {
          groveId: openGroveId,
          personId: tree.id,
          isOriginal: true,
          status: 'active',
          adoptionType: 'adopted',
        },
      })

      console.log(`   ✅ Created membership for ${tree.name}`)
      fixedCount++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Already OK: ${alreadyOkCount}`)
  console.log(`   🔧 Fixed: ${fixedCount}`)
  console.log(`   📝 Total: ${legacyTrees.length}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

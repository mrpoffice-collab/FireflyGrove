/**
 * Check for Open Grove memorials missing branches
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking for memorials missing branches...\n')

  const openGrove = await prisma.grove.findFirst({
    where: { isOpenGrove: true },
  })

  if (!openGrove) {
    throw new Error('Open Grove not found!')
  }

  const memorials = await prisma.person.findMany({
    where: {
      isLegacy: true,
      discoveryEnabled: true,
      memberships: {
        some: {
          groveId: openGrove.id,
          status: 'active',
        },
      },
    },
    include: {
      branches: {
        where: {
          status: 'ACTIVE',
        },
      },
    },
  })

  console.log(`Found ${memorials.length} Open Grove memorials\n`)

  let missingBranches = 0
  let hasBranches = 0

  for (const memorial of memorials) {
    if (memorial.branches.length === 0) {
      console.log(`❌ ${memorial.name} - NO BRANCH (id: ${memorial.id})`)
      missingBranches++
    } else {
      console.log(`✅ ${memorial.name} - Has branch: ${memorial.branches[0].id}`)
      hasBranches++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Has branches: ${hasBranches}`)
  console.log(`   ❌ Missing branches: ${missingBranches}`)
  console.log(`   📝 Total: ${memorials.length}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/**
 * Create missing branches for Open Grove memorials
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Creating missing branches for Open Grove memorials...\n')

  const openGrove = await prisma.grove.findFirst({
    where: { isOpenGrove: true },
  })

  if (!openGrove) {
    throw new Error('Open Grove not found!')
  }

  // Find or create the Open Grove tree
  let openGroveTree = await prisma.tree.findFirst({
    where: { groveId: openGrove.id },
  })

  if (!openGroveTree) {
    console.log('📝 Creating Open Grove tree...')
    openGroveTree = await prisma.tree.create({
      data: {
        groveId: openGrove.id,
        name: 'Open Grove Memorials',
        status: 'ACTIVE',
      },
    })
    console.log(`✅ Created tree: ${openGroveTree.id}\n`)
  } else {
    console.log(`✅ Found existing tree: ${openGroveTree.id}\n`)
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

  let created = 0
  let skipped = 0

  // Get system user for orphaned memorials
  const systemUser = await prisma.user.findUnique({
    where: { email: 'system@fireflygrove.com' },
  })

  if (!systemUser) {
    throw new Error('System user not found!')
  }

  for (const memorial of memorials) {
    if (memorial.branches.length === 0) {
      console.log(`🔧 Creating branch for: ${memorial.name}`)

      const ownerId = memorial.ownerId || memorial.trusteeId || systemUser.id

      const branch = await prisma.branch.create({
        data: {
          treeId: openGroveTree.id,
          title: memorial.name,
          personStatus: 'legacy',
          ownerId: ownerId,
          personId: memorial.id,
          status: 'ACTIVE',
        },
      })

      console.log(`   ✅ Created branch: ${branch.id}`)
      created++
    } else {
      console.log(`⏭️  ${memorial.name} - Already has branch`)
      skipped++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   🔧 Created: ${created}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
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

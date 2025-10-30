/**
 * Find test branches - looking for "Aunt Martha" and similar test memorial branches
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findTestBranches() {
  try {
    console.log('🔍 Searching for test branches...\n')

    // Get system user
    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@fireflygrove.com' },
      select: { id: true, name: true },
    })

    if (systemUser) {
      console.log(`📌 System user: ${systemUser.name} (ID: ${systemUser.id})\n`)

      const systemBranches = await prisma.branch.findMany({
        where: {
          ownerId: systemUser.id,
        },
        include: {
          person: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
      })

      console.log(`Found ${systemBranches.length} system-owned branches\n`)
      for (const branch of systemBranches) {
        console.log(`  - "${branch.title}" (${branch.type}) - ${branch._count.entries} entries`)
      }
    } else {
      console.log('No system user found\n')
    }

    // Look for branches with common test names
    const testNames = ['martha', 'aunt', 'test', 'demo', 'sample']

    console.log('\n🔍 Searching for branches with test-like names...\n')

    for (const testName of testNames) {
      const branches = await prisma.branch.findMany({
        where: {
          OR: [
            { title: { contains: testName, mode: 'insensitive' } },
            { description: { contains: testName, mode: 'insensitive' } },
          ],
        },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
          person: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
      })

      if (branches.length > 0) {
        console.log(`\n📝 Branches containing "${testName}":`)
        for (const branch of branches) {
          console.log(`\n  "${branch.title}" (${branch.type})`)
          console.log(`  ID: ${branch.id}`)
          console.log(`  Owner: ${branch.owner.name} (${branch.owner.email})`)
          console.log(`  Person: ${branch.person?.name || 'N/A'}`)
          console.log(`  Entries: ${branch._count.entries}`)
          console.log(`  Created: ${new Date(branch.createdAt).toLocaleDateString()}`)
        }
      }
    }

    // List ALL branches by type
    console.log('\n\n📊 All branches by type:\n')

    const allBranches = await prisma.branch.groupBy({
      by: ['type'],
      _count: true,
    })

    for (const group of allBranches) {
      console.log(`  ${group.type}: ${group._count} branches`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findTestBranches()

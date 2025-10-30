/**
 * DELETE TEST MEMORIAL BRANCHES NOW
 * Run this script once to clean up all test Open Grove memorial branches
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTestMemorials() {
  try {
    console.log('🗑️  Deleting test memorial branches from production database...\n')

    // Get system user
    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@fireflygrove.com' },
      select: { id: true, name: true },
    })

    if (!systemUser) {
      console.log('❌ System user not found - nothing to clean up')
      return
    }

    console.log(`Found system user: ${systemUser.name} (ID: ${systemUser.id})\n`)

    // Find all memorial-type branches owned by system user
    const testMemorials = await prisma.branch.findMany({
      where: {
        ownerId: systemUser.id,
        type: 'memorial',
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

    if (testMemorials.length === 0) {
      console.log('✅ No test memorial branches found - database is already clean!')
      return
    }

    console.log(`Found ${testMemorials.length} test memorial branches to delete:\n`)
    for (const branch of testMemorials) {
      console.log(`  - "${branch.title}" (${branch._count.entries} entries)`)
    }

    console.log('\n⚠️  DELETING NOW...\n')

    // Delete each memorial branch
    const deleted: string[] = []
    for (const branch of testMemorials) {
      await prisma.branch.delete({
        where: { id: branch.id },
      })
      deleted.push(branch.title)
      console.log(`  ✓ Deleted: "${branch.title}"`)
    }

    // Delete orphaned persons created by system
    const orphanedPersons = await prisma.person.deleteMany({
      where: {
        userId: systemUser.id,
        branches: {
          none: {}, // No branches reference this person
        },
      },
    })

    console.log(`\n✅ CLEANUP COMPLETE!`)
    console.log(`   - Deleted ${deleted.length} test memorial branches`)
    console.log(`   - Deleted ${orphanedPersons.count} orphaned person records`)
    console.log('\n✅ All real user data preserved!')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestMemorials()

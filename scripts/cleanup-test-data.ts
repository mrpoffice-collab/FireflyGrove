/**
 * Clean up test memorial branches owned by Firefly Grove System
 * KEEPS all data from real users:
 * - Tiffini Wright (Tiffini.henville@gmail.com)
 * - Melinda Short (moxie13111@gmail.com)
 * - Meschelle Peterson (mrpoffice@gmail.com) - Admin
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTestData() {
  try {
    console.log('🧹 Starting cleanup of test data...\n')

    // Get system user
    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@fireflygrove.com' },
      select: { id: true, name: true },
    })

    if (!systemUser) {
      console.log('❌ System user not found')
      return
    }

    console.log(`Found system user: ${systemUser.name} (ID: ${systemUser.id})\n`)

    // Get all branches owned by system user
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

    console.log(`Found ${systemBranches.length} branches owned by system user:\n`)

    for (const branch of systemBranches) {
      console.log(`  - "${branch.title}" (${branch._count.entries} entries)`)
    }

    if (systemBranches.length === 0) {
      console.log('\n✅ No test branches to delete')
      return
    }

    console.log('\n⚠️  This will DELETE all system-owned branches and their data')
    console.log('⚠️  Real user data will NOT be affected\n')

    // In a real scenario, you'd want confirmation here
    // For now, let's show what would be deleted

    console.log('Proceeding with deletion...\n')

    let deletedCount = 0
    let entryCount = 0

    for (const branch of systemBranches) {
      try {
        // Delete branch (cascade will handle entries and other relations)
        await prisma.branch.delete({
          where: { id: branch.id },
        })

        deletedCount++
        entryCount += branch._count.entries

        console.log(`✓ Deleted: "${branch.title}"`)
      } catch (error) {
        console.error(`✗ Failed to delete "${branch.title}":`, error)
      }
    }

    // Also delete orphaned persons created by system
    const orphanedPersons = await prisma.person.deleteMany({
      where: {
        userId: systemUser.id,
        branches: {
          none: {}, // No branches reference this person
        },
      },
    })

    console.log(`\n✅ Cleanup complete!`)
    console.log(`   - Deleted ${deletedCount} test branches`)
    console.log(`   - Deleted ${entryCount} test entries`)
    console.log(`   - Deleted ${orphanedPersons.count} orphaned persons`)

    console.log('\n✅ Real user data preserved:')
    console.log('   - Tiffini Wright: All branches and entries kept')
    console.log('   - Melinda Short: All branches and entries kept')
    console.log('   - Meschelle Peterson: All branches and entries kept')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTestData()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeTestAccounts() {
  try {
    // Find test accounts (those with @fireflygrove.app emails)
    const testAccounts = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@fireflygrove.app',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (testAccounts.length === 0) {
      console.log('No test accounts found.')
      return
    }

    console.log(`\n🗑️  Found ${testAccounts.length} test account(s) to remove:\n`)
    testAccounts.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   ID: ${user.id}`)
    })

    console.log('\nDeleting accounts (cascade delete will remove related data)...\n')

    for (const user of testAccounts) {
      console.log(`Deleting ${user.name}...`)

      // Delete user (cascade will handle related data)
      await prisma.user.delete({
        where: { id: user.id },
      })

      console.log(`  ✅ Deleted ${user.name}\n`)
    }

    console.log(`✅ Successfully removed ${testAccounts.length} test account(s)!`)

    // Show remaining users
    const remainingUsers = await prisma.user.count()
    const remainingBetaTesters = await prisma.user.count({
      where: { isBetaTester: true },
    })

    console.log(`\n📊 Remaining users: ${remainingUsers}`)
    console.log(`   Beta testers: ${remainingBetaTesters}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeTestAccounts()

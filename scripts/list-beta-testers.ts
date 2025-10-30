/**
 * List all beta testers in the database
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listBetaTesters() {
  try {
    console.log('📋 Fetching all beta testers...\n')

    const users = await prisma.user.findMany({
      where: {
        isBetaTester: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isAdmin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Found ${users.length} beta testers:\n`)

    // Get counts for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const branchCount = await prisma.branch.count({ where: { ownerId: user.id } })
      const entryCount = await prisma.entry.count({ where: { authorId: user.id } })
      const nestCount = await prisma.nestItem.count({ where: { userId: user.id } })

      console.log(`${i + 1}. ${user.name || 'No name'} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Admin: ${user.isAdmin ? 'Yes' : 'No'}`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log(`   Branches: ${branchCount} | Entries: ${entryCount} | Nest: ${nestCount}`)
      console.log('')
    }

    console.log('\n✅ Real users to KEEP:')
    console.log('   - Tiffini Wright')
    console.log('   - Melinda Short')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listBetaTesters()

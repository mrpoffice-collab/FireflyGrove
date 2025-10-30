/**
 * Verify user activity - who created what
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyUserActivity() {
  try {
    console.log('🔍 Verifying user activity...\n')

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { isBetaTester: true },
          { isAdmin: true },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isBetaTester: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    for (const user of users) {
      console.log(`\n${'='.repeat(70)}`)
      console.log(`👤 ${user.name} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Admin: ${user.isAdmin} | Beta Tester: ${user.isBetaTester}`)
      console.log(`${'='.repeat(70)}\n`)

      // Branches they OWN
      const ownedBranches = await prisma.branch.findMany({
        where: { ownerId: user.id },
        include: {
          person: {
            select: { name: true },
          },
          _count: {
            select: { entries: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      console.log(`📂 Branches Owned (${ownedBranches.length}):`)
      if (ownedBranches.length === 0) {
        console.log('   (none)')
      } else {
        for (const branch of ownedBranches) {
          console.log(`   - "${branch.title}" (${branch.type})`)
          console.log(`     ID: ${branch.id}`)
          console.log(`     Person: ${branch.person?.name || 'N/A'}`)
          console.log(`     Entries: ${branch._count.entries}`)
        }
      }

      // Entries they AUTHORED
      const authoredEntries = await prisma.entry.findMany({
        where: { authorId: user.id },
        include: {
          branch: {
            select: {
              title: true,
              owner: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      console.log(`\n✍️  Entries Authored (${authoredEntries.length}):`)
      if (authoredEntries.length === 0) {
        console.log('   (none)')
      } else {
        for (const entry of authoredEntries) {
          console.log(`   - Entry text: "${entry.text.substring(0, 50)}${entry.text.length > 50 ? '...' : ''}"`)
          console.log(`     On branch: "${entry.branch.title}"`)
          console.log(`     Branch owner: ${entry.branch.owner.name} (${entry.branch.owner.email})`)
          console.log(`     Created: ${new Date(entry.createdAt).toLocaleDateString()}`)
        }
      }

      // Nest items
      const nestItems = await prisma.nestItem.findMany({
        where: { userId: user.id },
      })

      console.log(`\n🪺 Nest Items: ${nestItems.length}`)
    }

    console.log(`\n${'='.repeat(70)}`)
    console.log('\n✅ Verification complete')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyUserActivity()

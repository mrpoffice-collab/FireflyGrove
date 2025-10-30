/**
 * List all users, branches, and entries to identify test data
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listAllData() {
  try {
    console.log('📋 Fetching all data...\n')

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isBetaTester: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`=== ALL USERS (${users.length}) ===\n`)

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const branchCount = await prisma.branch.count({ where: { ownerId: user.id } })
      const entryCount = await prisma.entry.count({ where: { authorId: user.id } })

      console.log(`${i + 1}. ${user.name || 'No name'} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Admin: ${user.isAdmin} | Beta: ${user.isBetaTester}`)
      console.log(`   Branches: ${branchCount} | Entries: ${entryCount}`)
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`)
      console.log('')
    }

    // Get all branches with details
    console.log('\n=== ALL BRANCHES ===\n')

    const branches = await prisma.branch.findMany({
      include: {
        person: {
          select: {
            name: true,
          },
        },
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Found ${branches.length} branches:\n`)

    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i]
      console.log(`${i + 1}. "${branch.title}" (${branch.type})`)
      console.log(`   ID: ${branch.id}`)
      console.log(`   Person: ${branch.person?.name || 'N/A'}`)
      console.log(`   Owner: ${branch.owner.name} (${branch.owner.email})`)
      console.log(`   Entries: ${branch._count.entries}`)
      console.log(`   Created: ${new Date(branch.createdAt).toLocaleDateString()}`)
      console.log('')
    }

    console.log('\n✅ Real users to KEEP:')
    console.log('   - Tiffini Wright (Tiffini.henville@gmail.com)')
    console.log('   - Melinda Short (moxie13111@gmail.com)')
    console.log('\n❌ Identify test users/branches from the list above')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listAllData()

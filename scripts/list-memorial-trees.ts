/**
 * List all memorial trees (legacy/Open Grove)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listMemorialTrees() {
  try {
    console.log('📋 Fetching all memorial trees...\n')

    // Get all legacy branches (memorial trees)
    const legacyBranches = await prisma.branch.findMany({
      where: {
        type: 'legacy',
      },
      include: {
        person: {
          select: {
            name: true,
            userId: true,
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

    console.log(`Found ${legacyBranches.length} memorial trees:\n`)

    for (let i = 0; i < legacyBranches.length; i++) {
      const branch = legacyBranches[i]
      console.log(`${i + 1}. "${branch.title}"`)
      console.log(`   ID: ${branch.id}`)
      console.log(`   Person: ${branch.person?.name || 'N/A'}`)
      console.log(`   Owner: ${branch.owner.name || 'N/A'} (${branch.owner.email})`)
      console.log(`   Status: ${branch.status}`)
      console.log(`   Entries: ${branch._count.entries}`)
      console.log(`   Birth: ${branch.birthDate ? new Date(branch.birthDate).toLocaleDateString() : 'N/A'}`)
      console.log(`   Death: ${branch.deathDate ? new Date(branch.deathDate).toLocaleDateString() : 'N/A'}`)
      console.log(`   Created: ${new Date(branch.createdAt).toLocaleDateString()}`)
      console.log('')
    }

    // Also check Open Grove
    console.log('\n--- Open Grove Trees ---\n')

    const openGroveUser = await prisma.user.findUnique({
      where: { email: 'opengrove@fireflygrove.com' },
      select: { id: true },
    })

    if (openGroveUser) {
      const openGroveBranches = await prisma.branch.findMany({
        where: {
          ownerId: openGroveUser.id,
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
        orderBy: {
          createdAt: 'desc',
        },
      })

      console.log(`Found ${openGroveBranches.length} Open Grove memorials:\n`)

      for (let i = 0; i < openGroveBranches.length; i++) {
        const branch = openGroveBranches[i]
        console.log(`${i + 1}. "${branch.title}"`)
        console.log(`   ID: ${branch.id}`)
        console.log(`   Person: ${branch.person?.name || 'N/A'}`)
        console.log(`   Entries: ${branch._count.entries}`)
        console.log(`   Created: ${new Date(branch.createdAt).toLocaleDateString()}`)
        console.log('')
      }
    } else {
      console.log('No Open Grove user found')
    }

    console.log('\n💡 Review the list above and identify which are test memorials to delete')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listMemorialTrees()

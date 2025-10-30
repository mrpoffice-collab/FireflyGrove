/**
 * Find all Open Grove memorial branches for cleanup
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findOpenGroveMemorials() {
  try {
    console.log('🔍 Searching for Open Grove memorial branches...\n')

    const openGroveBranches = await prisma.branch.findMany({
      where: {
        type: 'memorial'
      },
      include: {
        person: {
          select: {
            name: true,
            birthDate: true,
            deathDate: true,
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

    console.log(`Found ${openGroveBranches.length} memorial branches:\n`)

    for (const branch of openGroveBranches) {
      console.log(`📿 ${branch.title}`)
      console.log(`   ID: ${branch.id}`)
      console.log(`   Type: ${branch.type}`)
      console.log(`   Person: ${branch.person?.name || 'N/A'}`)
      if (branch.person?.birthDate || branch.person?.deathDate) {
        console.log(`   Dates: ${branch.person.birthDate || '?'} - ${branch.person.deathDate || '?'}`)
      }
      console.log(`   Owner: ${branch.owner.name} (${branch.owner.email})`)
      console.log(`   Entries: ${branch._count.entries}`)
      console.log(`   Created: ${new Date(branch.createdAt).toLocaleDateString()}`)
      console.log()
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findOpenGroveMemorials()

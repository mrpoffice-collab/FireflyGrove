/**
 * Find Person records (Open Grove memorials) with missing or system ownership
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findUnknownMemorials() {
  try {
    console.log('🔍 Finding Open Grove memorial Person records...\n')

    // Get system user
    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@fireflygrove.com' },
      select: { id: true },
    })

    // Find all legacy Person records
    const legacyPersons = await prisma.person.findMany({
      where: {
        isLegacy: true,
      },
      include: {
        branches: {
          include: {
            _count: {
              select: {
                entries: true,
              },
            },
          },
        },
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        trustee: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Found ${legacyPersons.length} legacy Person records:\n`)

    const testPersons: any[] = []

    for (const person of legacyPersons) {
      const isSystemOwned = person.userId === systemUser?.id || person.ownerId === systemUser?.id
      const isTestData = person.name.toLowerCase().includes('aunt martha') ||
                         person.name.toLowerCase().includes('grandpa william') ||
                         person.name.toLowerCase().includes('test')

      console.log(`📿 "${person.name}"`)
      console.log(`   ID: ${person.id}`)
      console.log(`   Birth: ${person.birthDate ? new Date(person.birthDate).toLocaleDateString() : 'N/A'}`)
      console.log(`   Death: ${person.deathDate ? new Date(person.deathDate).toLocaleDateString() : 'N/A'}`)
      console.log(`   User ID: ${person.userId || 'NULL'}`)
      console.log(`   Owner: ${person.owner?.name || 'NULL'} (${person.owner?.email || 'N/A'})`)
      console.log(`   Trustee: ${person.trustee?.name || 'NULL'}`)
      console.log(`   Branches: ${person.branches.length}`)

      if (person.branches.length > 0) {
        for (const branch of person.branches) {
          console.log(`      - "${branch.title}" (${branch._count.entries} memories)`)
        }
      }

      console.log(`   Is Test Data? ${isTestData ? 'YES ⚠️' : 'No'}`)
      console.log()

      if (isTestData) {
        testPersons.push(person)
      }
    }

    if (testPersons.length > 0) {
      console.log(`\n⚠️  Found ${testPersons.length} TEST memorial persons to delete:\n`)
      for (const person of testPersons) {
        console.log(`   - "${person.name}" (ID: ${person.id})`)
      }
    } else {
      console.log('\n✅ No obvious test data found')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findUnknownMemorials()

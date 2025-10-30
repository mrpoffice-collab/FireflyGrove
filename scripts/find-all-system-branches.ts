/**
 * Find ALL branches owned by system user (any type)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findAllSystemBranches() {
  try {
    console.log('🔍 Finding ALL branches owned by system user...\n')

    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@fireflygrove.com' },
      select: { id: true, name: true },
    })

    if (!systemUser) {
      console.log('❌ System user not found')
      return
    }

    console.log(`System user: ${systemUser.name} (ID: ${systemUser.id})\n`)

    // Find ALL branches owned by system user (any type)
    const allBranches = await prisma.branch.findMany({
      where: {
        ownerId: systemUser.id,
      },
      include: {
        person: {
          select: {
            name: true,
            isLegacy: true,
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

    if (allBranches.length === 0) {
      console.log('✅ No branches owned by system user')
      return
    }

    console.log(`Found ${allBranches.length} branches owned by system user:\n`)

    for (const branch of allBranches) {
      console.log(`📿 "${branch.title}"`)
      console.log(`   ID: ${branch.id}`)
      console.log(`   Type: ${branch.type}`)
      console.log(`   Person Status: ${branch.personStatus}`)
      console.log(`   Person: ${branch.person?.name || 'N/A'} ${branch.person?.isLegacy ? '(Legacy)' : ''}`)
      console.log(`   Entries: ${branch._count.entries}`)
      console.log(`   Created: ${new Date(branch.createdAt).toLocaleDateString()}`)
      console.log()
    }

    console.log(`\nTotal: ${allBranches.length} branches`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findAllSystemBranches()

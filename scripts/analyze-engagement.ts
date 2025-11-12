import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeEngagement() {
  try {
    // Count total users
    const totalUsers = await prisma.user.count({
      where: {
        status: 'ACTIVE'
      }
    })

    // Count users who have created branches
    const usersWithBranches = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        ownedBranches: {
          some: {}
        }
      }
    })

    // Count users who have created memories
    const usersWithMemories = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        entries: {
          some: {
            deletedAt: null
          }
        }
      }
    })

    // Count users who have uploaded to nest
    const usersWithNestItems = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        nestItems: {
          some: {}
        }
      }
    })

    // Count total memories
    const totalMemories = await prisma.entry.count({
      where: {
        deletedAt: null
      }
    })

    // Count memories with photos
    const memoriesWithPhotos = await prisma.entry.count({
      where: {
        mediaUrl: { not: null },
        deletedAt: null
      }
    })

    // Count total branches
    const totalBranches = await prisma.branch.count({
      where: {
        archived: false
      }
    })

    // Get photo counts
    const nestPhotos = await prisma.nestItem.count({
      where: { photoUrl: { not: null } }
    })

    const totalPhotos = memoriesWithPhotos + nestPhotos

    console.log('\n📊 ENGAGEMENT ANALYSIS')
    console.log('================================')
    console.log(`\n👥 USER BASE:`)
    console.log(`  • Total Active Users: ${totalUsers}`)
    console.log(`  • Users with Branches: ${usersWithBranches} (${((usersWithBranches/totalUsers)*100).toFixed(1)}%)`)
    console.log(`  • Users with Memories: ${usersWithMemories} (${((usersWithMemories/totalUsers)*100).toFixed(1)}%)`)
    console.log(`  • Users with Nest Items: ${usersWithNestItems} (${((usersWithNestItems/totalUsers)*100).toFixed(1)}%)`)

    console.log(`\n🌳 CONTENT:`)
    console.log(`  • Total Branches: ${totalBranches}`)
    console.log(`  • Total Memories: ${totalMemories}`)
    console.log(`  • Memories with Photos: ${memoriesWithPhotos}`)

    console.log(`\n📸 PHOTOS:`)
    console.log(`  • Memory Photos: ${memoriesWithPhotos}`)
    console.log(`  • Nest Photos: ${nestPhotos}`)
    console.log(`  • Total Photos: ${totalPhotos}`)

    console.log(`\n📈 PER USER AVERAGES:`)
    console.log(`  • Branches per user: ${(totalBranches/totalUsers).toFixed(2)}`)
    console.log(`  • Memories per user: ${(totalMemories/totalUsers).toFixed(2)}`)
    console.log(`  • Photos per user: ${(totalPhotos/totalUsers).toFixed(2)}`)
    console.log(`  • Photos per memory: ${totalMemories > 0 ? (memoriesWithPhotos/totalMemories*100).toFixed(1) : 0}%`)

    // Calculate for engaged users only (those with memories)
    if (usersWithMemories > 0) {
      console.log(`\n📈 ENGAGED USERS ONLY (${usersWithMemories} users):`)
      console.log(`  • Memories per engaged user: ${(totalMemories/usersWithMemories).toFixed(2)}`)
      console.log(`  • Photos per engaged user: ${(totalPhotos/usersWithMemories).toFixed(2)}`)
    }

    console.log('================================\n')

  } catch (error) {
    console.error('Error analyzing engagement:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeEngagement()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function countBetaTesters() {
  try {
    const betaTesters = await prisma.user.findMany({
      where: {
        isBetaTester: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const totalUsers = await prisma.user.count()
    const adminUsers = await prisma.user.count({
      where: { isAdmin: true },
    })

    console.log('\n📊 User Statistics:')
    console.log('===================')
    console.log(`Total Users: ${totalUsers}`)
    console.log(`Admin Users: ${adminUsers}`)
    console.log(`Beta Testers: ${betaTesters.length}`)
    console.log('')

    if (betaTesters.length > 0) {
      console.log('Beta Tester Details:')
      console.log('--------------------')
      betaTesters.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No name'}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Joined: ${user.createdAt.toLocaleDateString()}`)
        console.log('')
      })
    } else {
      console.log('No beta testers found.')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

countBetaTesters()

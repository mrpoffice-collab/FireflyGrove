import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUserInfo() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isBetaTester: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log('\nUsers in database:')
    console.log('==================')
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'No name'}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Admin: ${user.isAdmin}`)
      console.log(`   Beta Tester: ${user.isBetaTester}`)
    })
    console.log('\n')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getUserInfo()

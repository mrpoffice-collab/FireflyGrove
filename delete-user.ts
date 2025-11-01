import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'newbetatester@gmailester.com' }
  })

  if (!user) {
    console.log('User not found')
    return
  }

  await prisma.user.delete({ where: { id: user.id } })
  console.log('✅ Deleted user:', user.email)
  await prisma.$disconnect()
}

deleteUser()

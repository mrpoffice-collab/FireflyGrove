import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setAdminAndBeta() {
  try {
    // Get the user email from command line argument or use default
    const email = process.argv[2] || 'mrpoffice@gmail.com'

    console.log(`Looking for user with email: ${email}`)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, isAdmin: true, isBetaTester: true }
    })

    if (!user) {
      console.error(`❌ User not found with email: ${email}`)
      process.exit(1)
    }

    console.log('Current user:', user)

    // Update user to be admin and beta tester
    const updated = await prisma.user.update({
      where: { email },
      data: {
        isAdmin: true,
        isBetaTester: true,
      },
      select: { id: true, email: true, name: true, isAdmin: true, isBetaTester: true }
    })

    console.log('\n✅ User updated successfully!')
    console.log(updated)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminAndBeta()

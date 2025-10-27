// Quick script to set a user as admin
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx ts-node scripts/set-admin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true }
  })

  console.log(`✅ ${user.email} is now an admin!`)
}

main()
  .catch((e) => {
    console.error('Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

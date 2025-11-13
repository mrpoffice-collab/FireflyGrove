import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEntryBlobUrls() {
  console.log('📊 Checking Entry Blob URLs...\n')

  // Get all entries with Blob URLs
  const entries = await prisma.entry.findMany({
    where: {
      mediaUrl: { startsWith: 'https://' },
      deletedAt: null
    },
    select: {
      id: true,
      mediaUrl: true,
      createdAt: true,
      author: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log(`Found ${entries.length} entries with Blob URLs\n`)

  for (const entry of entries) {
    const date = new Date(entry.createdAt).toLocaleDateString()
    console.log(`${entry.author.name} - ${date}`)
    console.log(`  ${entry.mediaUrl}`)
    console.log()
  }

  await prisma.$disconnect()
}

checkEntryBlobUrls()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllImages() {
  console.log('📊 Checking all image storage across database...\n')

  // Check Entry table
  const entryBase64 = await prisma.entry.count({
    where: { mediaUrl: { startsWith: 'data:' }, deletedAt: null }
  })
  const entryBlob = await prisma.entry.count({
    where: { mediaUrl: { startsWith: 'https://' }, deletedAt: null }
  })
  console.log('Entry table:')
  console.log('  Base64 images:', entryBase64)
  console.log('  Blob images:', entryBlob)

  // Check NestItem table
  const nestBase64 = await prisma.nestItem.count({
    where: { mediaUrl: { startsWith: 'data:' }, deletedAt: null }
  })
  const nestBlob = await prisma.nestItem.count({
    where: { mediaUrl: { startsWith: 'https://' }, deletedAt: null }
  })
  console.log('\nNestItem table:')
  console.log('  Base64 images:', nestBase64)
  console.log('  Blob images:', nestBlob)

  // Get sample URLs to test
  console.log('\n📎 Sample Blob URLs:')
  const sampleEntries = await prisma.entry.findMany({
    where: { mediaUrl: { startsWith: 'https://' }, deletedAt: null },
    select: { id: true, mediaUrl: true },
    take: 3
  })

  for (const entry of sampleEntries) {
    console.log(`  Entry ${entry.id}: ${entry.mediaUrl}`)
  }

  await prisma.$disconnect()
}

checkAllImages()

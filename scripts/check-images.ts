import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImages() {
  const base64Count = await prisma.entry.count({
    where: { mediaUrl: { startsWith: 'data:' }, deletedAt: null }
  })

  const blobCount = await prisma.entry.count({
    where: { mediaUrl: { startsWith: 'https://' }, deletedAt: null }
  })

  console.log('Base64 images:', base64Count)
  console.log('Blob images:', blobCount)

  await prisma.$disconnect()
}

checkImages()

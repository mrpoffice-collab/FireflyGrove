import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNestImages() {
  console.log('📊 Checking Nest images...\n')

  // Check for photoUrl
  const photoBase64 = await prisma.nestItem.count({
    where: { photoUrl: { startsWith: 'data:' } }
  })
  const photoBlob = await prisma.nestItem.count({
    where: { photoUrl: { startsWith: 'https://' } }
  })

  console.log('NestItem photoUrl:')
  console.log('  Base64:', photoBase64)
  console.log('  Blob:', photoBlob)

  // Check for videoUrl
  const videoBase64 = await prisma.nestItem.count({
    where: { videoUrl: { startsWith: 'data:' } }
  })
  const videoBlob = await prisma.nestItem.count({
    where: { videoUrl: { startsWith: 'https://' } }
  })

  console.log('\nNestItem videoUrl:')
  console.log('  Base64:', videoBase64)
  console.log('  Blob:', videoBlob)

  // Get sample photoUrls
  console.log('\n📎 Sample NestItem photoUrls:')
  const samples = await prisma.nestItem.findMany({
    where: {
      photoUrl: { not: null }
    },
    select: { id: true, photoUrl: true, filename: true },
    take: 5
  })

  for (const item of samples) {
    const urlType = item.photoUrl?.startsWith('data:') ? 'BASE64' :
                    item.photoUrl?.startsWith('https://') ? 'BLOB' : 'OTHER'
    console.log(`  [${urlType}] ${item.filename}: ${item.photoUrl?.substring(0, 60)}...`)
  }

  await prisma.$disconnect()
}

checkNestImages()

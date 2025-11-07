import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findBrokenImage() {
  const brokenUrl = '1761921321571-20130824_170101-G6DRtztccv7kCQ3IIPHmJOtq9PP4YE.jpg'

  // Search in NestItem
  const nestItems = await prisma.nestItem.findMany({
    where: {
      OR: [
        { photoUrl: { contains: brokenUrl } },
        { videoUrl: { contains: brokenUrl } },
        { thumbnailUrl: { contains: brokenUrl } }
      ]
    },
    include: {
      user: { select: { email: true, name: true } }
    }
  })

  console.log('Found in NestItems:', nestItems.length)
  nestItems.forEach(item => {
    console.log({
      id: item.id,
      user: item.user?.email,
      photoUrl: item.photoUrl,
      caption: item.caption,
      filename: item.filename
    })
  })
}

findBrokenImage()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

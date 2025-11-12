import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function countPhotos() {
  try {
    // Count entries with photos
    const entriesWithPhotos = await prisma.entry.count({
      where: {
        mediaUrl: { not: null },
        deletedAt: null
      }
    })

    // Count entries with videos
    const entriesWithVideos = await prisma.entry.count({
      where: {
        videoUrl: { not: null },
        deletedAt: null
      }
    })

    // Count nest items with photos
    const nestPhotos = await prisma.nestItem.count({
      where: {
        photoUrl: { not: null }
      }
    })

    // Count nest items with videos
    const nestVideos = await prisma.nestItem.count({
      where: {
        videoUrl: { not: null }
      }
    })

    // Total photos (entries + nest)
    const totalPhotos = entriesWithPhotos + nestPhotos

    // Total videos (entries + nest)
    const totalVideos = entriesWithVideos + nestVideos

    // Total media items
    const totalMedia = totalPhotos + totalVideos

    console.log('\n📊 Photo & Video Storage Summary')
    console.log('================================')
    console.log(`\n📸 PHOTOS:`)
    console.log(`  • Branch/Memory Photos: ${entriesWithPhotos}`)
    console.log(`  • Nest Photos: ${nestPhotos}`)
    console.log(`  • Total Photos: ${totalPhotos}`)
    console.log(`\n🎥 VIDEOS:`)
    console.log(`  • Branch/Memory Videos: ${entriesWithVideos}`)
    console.log(`  • Nest Videos: ${nestVideos}`)
    console.log(`  • Total Videos: ${totalVideos}`)
    console.log(`\n🎯 TOTAL MEDIA ITEMS: ${totalMedia}`)
    console.log('================================\n')

  } catch (error) {
    console.error('Error counting photos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

countPhotos()

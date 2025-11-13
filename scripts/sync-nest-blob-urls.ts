import { PrismaClient } from '@prisma/client'
import { list } from '@vercel/blob'

const prisma = new PrismaClient()

async function syncNestBlobUrls() {
  console.log('🔄 SYNCING NEST ITEM BLOB URLs\n')

  // Get all nest blobs from Vercel
  const { blobs } = await list({ prefix: 'nest/' })
  console.log(`Found ${blobs.length} blobs in Vercel storage`)

  // Get all nest items from database
  const nestItems = await prisma.nestItem.findMany({
    where: { photoUrl: { not: null } },
    select: { id: true, photoUrl: true, filename: true }
  })
  console.log(`Found ${nestItems.length} nest items in database\n`)

  let fixedCount = 0
  let notFoundCount = 0

  for (const item of nestItems) {
    // Extract the filename from the blob URL
    const urlFilename = item.filename

    // Find matching blob by filename
    const matchingBlob = blobs.find(blob => {
      const blobFilename = blob.pathname.split('/').pop()
      // Match by the original filename (before the hash)
      return blobFilename?.includes(urlFilename.replace(/\.[^.]+$/, ''))
    })

    if (matchingBlob) {
      if (item.photoUrl !== matchingBlob.url) {
        console.log(`✅ Fixing: ${urlFilename}`)
        console.log(`   Old: ${item.photoUrl}`)
        console.log(`   New: ${matchingBlob.url}`)

        await prisma.nestItem.update({
          where: { id: item.id },
          data: { photoUrl: matchingBlob.url }
        })

        fixedCount++
      }
    } else {
      console.log(`❌ Not found: ${urlFilename}`)
      notFoundCount++
    }
  }

  console.log('\n📊 SYNC SUMMARY')
  console.log('================================')
  console.log(`✅ Fixed: ${fixedCount}`)
  console.log(`❌ Not found: ${notFoundCount}`)
  console.log(`📁 Total: ${nestItems.length}`)

  await prisma.$disconnect()
}

syncNestBlobUrls()

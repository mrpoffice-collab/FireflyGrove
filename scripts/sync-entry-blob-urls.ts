import { PrismaClient } from '@prisma/client'
import { list } from '@vercel/blob'

const prisma = new PrismaClient()

async function syncEntryBlobUrls() {
  console.log('🔄 SYNCING ENTRY BLOB URLs\n')

  // Get all blobs from Vercel (nest + migrated)
  const { blobs } = await list()
  console.log(`Found ${blobs.length} total blobs in Vercel storage`)

  // Get all entries with blob URLs
  const entries = await prisma.entry.findMany({
    where: {
      mediaUrl: { startsWith: 'https://' },
      deletedAt: null
    },
    select: { id: true, mediaUrl: true, text: true }
  })
  console.log(`Found ${entries.length} entries with Blob URLs in database\n`)

  let fixedCount = 0
  let alreadyCorrectCount = 0
  let notFoundCount = 0

  for (const entry of entries) {
    // Check if this URL is actually accessible
    const currentUrl = entry.mediaUrl!

    // See if this exact URL exists in blobs
    const exactMatch = blobs.find(b => b.url === currentUrl)

    if (exactMatch) {
      console.log(`✓ Already correct: ${entry.text.substring(0, 40)}...`)
      alreadyCorrectCount++
    } else {
      console.log(`❌ Broken URL: ${entry.text.substring(0, 40)}...`)
      console.log(`   ${currentUrl}`)
      notFoundCount++
    }
  }

  console.log('\n📊 SYNC SUMMARY')
  console.log('================================')
  console.log(`✅ Already correct: ${alreadyCorrectCount}`)
  console.log(`❌ Broken (not found in blobs): ${notFoundCount}`)
  console.log(`📁 Total: ${entries.length}`)

  if (notFoundCount > 0) {
    console.log('\n⚠️  Some entry URLs don\'t match any blobs.')
    console.log('These may have been hatched before blobs were uploaded correctly.')
    console.log('Run this script to identify which entries need manual fixing.')
  }

  await prisma.$disconnect()
}

syncEntryBlobUrls()

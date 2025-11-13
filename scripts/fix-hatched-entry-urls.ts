import { PrismaClient } from '@prisma/client'
import { list } from '@vercel/blob'

const prisma = new PrismaClient()

async function fixHatchedEntryUrls() {
  console.log('🔄 FIXING HATCHED ENTRY BLOB URLs\n')

  // Get all blobs
  const { blobs } = await list()
  const blobUrls = new Set(blobs.map(b => b.url))

  // Get all entries with broken blob URLs
  const entries = await prisma.entry.findMany({
    where: {
      mediaUrl: { startsWith: 'https://' },
      deletedAt: null
    },
    select: { id: true, mediaUrl: true, text: true }
  })

  const brokenEntries = entries.filter(e => !blobUrls.has(e.mediaUrl!))

  console.log(`Found ${brokenEntries.length} entries with broken URLs\n`)

  let fixedCount = 0
  let notFoundCount = 0

  for (const entry of brokenEntries) {
    console.log(`\n🔍 Searching for: "${entry.text.substring(0, 50)}..."`)
    console.log(`   Broken URL: ${entry.mediaUrl}`)

    // Extract the filename/pattern from the broken URL
    const urlParts = entry.mediaUrl!.split('/')
    const filename = urlParts[urlParts.length - 1]
    const baseFilename = filename.split('-').slice(1, -1).join('-') // Remove timestamp and hash

    console.log(`   Looking for filename pattern: ${baseFilename}`)

    // Find matching blob by filename pattern
    const matchingBlob = blobs.find(blob => {
      const blobFilename = blob.pathname.split('/').pop() || ''
      return blobFilename.includes(baseFilename)
    })

    if (matchingBlob) {
      console.log(`   ✅ Found matching blob: ${matchingBlob.url}`)

      await prisma.entry.update({
        where: { id: entry.id },
        data: { mediaUrl: matchingBlob.url }
      })

      fixedCount++
    } else {
      console.log(`   ❌ No matching blob found`)
      notFoundCount++
    }
  }

  console.log('\n\n📊 FIX SUMMARY')
  console.log('================================')
  console.log(`✅ Fixed: ${fixedCount}`)
  console.log(`❌ Not found: ${notFoundCount}`)
  console.log(`📁 Total broken: ${brokenEntries.length}`)

  await prisma.$disconnect()
}

fixHatchedEntryUrls()

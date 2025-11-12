/**
 * Migrate Base64 Images to Vercel Blob Storage
 *
 * This script finds all memories with base64 data URL images,
 * uploads them to Vercel Blob storage, and updates the database
 * with the new URLs.
 *
 * Run with: npx tsx scripts/migrate-base64-to-blob.ts
 */

import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'

const prisma = new PrismaClient()

async function migrateBase64Images() {
  console.log('🔄 MIGRATING BASE64 IMAGES TO VERCEL BLOB\n')

  // Find all entries with base64 images
  const entries = await prisma.entry.findMany({
    where: {
      mediaUrl: { startsWith: 'data:' },
      deletedAt: null,
    },
    select: {
      id: true,
      mediaUrl: true,
      text: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Found ${entries.length} entries with base64 images\n`)

  if (entries.length === 0) {
    console.log('✅ No base64 images to migrate!')
    await prisma.$disconnect()
    return
  }

  let successCount = 0
  let failCount = 0

  for (const [index, entry] of entries.entries()) {
    const progress = `[${index + 1}/${entries.length}]`
    const date = new Date(entry.createdAt).toLocaleDateString()

    console.log(`${progress} Processing: ${entry.author.name} - ${date}`)
    console.log(`   Text: ${entry.text.substring(0, 50)}...`)

    try {
      // Extract base64 data and content type
      const matches = entry.mediaUrl!.match(/^data:(.+);base64,(.+)$/)
      if (!matches) {
        console.log(`   ❌ Invalid base64 format, skipping`)
        failCount++
        continue
      }

      const contentType = matches[1]
      const base64Data = matches[2]

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64')
      const sizeKB = (buffer.length / 1024).toFixed(1)
      console.log(`   Size: ${sizeKB} KB`)

      // Generate filename
      const extension = contentType.split('/')[1] || 'jpg'
      const timestamp = Date.now()
      const filename = `migrated/${entry.author.id}/${timestamp}-${entry.id}.${extension}`

      console.log(`   📤 Uploading to Vercel Blob...`)

      // Upload to Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: contentType,
      })

      console.log(`   ✅ Uploaded: ${blob.url}`)

      // Update database
      await prisma.entry.update({
        where: { id: entry.id },
        data: { mediaUrl: blob.url },
      })

      console.log(`   ✅ Database updated\n`)
      successCount++

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`   ❌ Error:`, error)
      failCount++
      console.log()
    }
  }

  console.log('\n📊 MIGRATION SUMMARY')
  console.log('================================')
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📁 Total: ${entries.length}`)

  if (successCount > 0) {
    console.log('\n🎉 Migration complete!')
    console.log('Your images are now stored in Vercel Blob and will load much faster.')
  }

  await prisma.$disconnect()
}

migrateBase64Images().catch(console.error)

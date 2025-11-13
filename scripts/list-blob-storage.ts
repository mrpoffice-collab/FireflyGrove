import { list } from '@vercel/blob'

async function listBlobStorage() {
  console.log('📊 Listing all blobs in Vercel Blob storage...\n')

  try {
    const { blobs } = await list()

    console.log(`Found ${blobs.length} blobs\n`)

    if (blobs.length === 0) {
      console.log('⚠️  No blobs found in storage!')
      console.log('This means the images were deleted or are in a different store.\n')
      return
    }

    // Group by folder
    const folders: Record<string, number> = {}
    for (const blob of blobs) {
      const folder = blob.pathname.split('/')[0]
      folders[folder] = (folders[folder] || 0) + 1
    }

    console.log('Blobs by folder:')
    for (const [folder, count] of Object.entries(folders)) {
      console.log(`  ${folder}/: ${count} files`)
    }

    console.log('\n📎 Sample blob URLs (first 5):')
    for (const blob of blobs.slice(0, 5)) {
      console.log(`  ${blob.pathname}`)
      console.log(`    ${blob.url}`)
    }

  } catch (error: any) {
    console.error('❌ Error listing blobs:', error.message)
  }
}

listBlobStorage()

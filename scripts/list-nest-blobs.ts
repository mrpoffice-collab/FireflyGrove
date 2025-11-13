import { list } from '@vercel/blob'

async function listNestBlobs() {
  console.log('📊 Listing all nest/ blobs...\n')

  try {
    const { blobs } = await list({ prefix: 'nest/' })

    console.log(`Found ${blobs.length} nest blobs\n`)

    for (const blob of blobs) {
      console.log(`${blob.pathname}`)
      console.log(`  URL: ${blob.url}`)
      console.log(`  Size: ${(blob.size / 1024).toFixed(1)} KB`)
      console.log()
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

listNestBlobs()

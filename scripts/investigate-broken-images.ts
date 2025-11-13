import { PrismaClient } from '@prisma/client'
import { list } from '@vercel/blob'

const prisma = new PrismaClient()

async function investigateBrokenImages() {
  console.log('🔍 INVESTIGATING BROKEN IMAGES\n')
  console.log('='.repeat(60) + '\n')

  // Get all blobs
  const { blobs } = await list()
  const blobUrls = new Set(blobs.map(b => b.url))

  // The 8 broken URLs from our previous check
  const brokenUrls = [
    'https://bruwg0e0jqynr4rb.public.blob.vercel-storage.com/nest/cmh2427ad0000gvqabqqir2s8/1761668306447-IMG_2588-hMjakh2cCCTUFpLi8eqsBWwgTVibFM.jpeg',
    'https://bruwg0e0jqynr4rb.public.blob.vercel-storage.com/nest/cmh2427ad0000gvqabqqir2s8/1761668329624-IMG_0211-33MWBfMepamS3UOLO3GR6SAdqlxBUN.jpeg',
    'https://bruwg0e0jqynr4rb.public.blob.vercel-storage.com/nest/cmh2427ad0000gvqabqqir2s8/1761668295391-IMG_3431-li2qfwOURYU678yg9tCvuB9hf4ccV3.jpeg',
    'https://bruwg0e0jqynr4rb.public.blob.vercel-storage.com/nest/cmh2427ad0000gvqabqqir2s8/1761921344344-20130805_093216-uUIq1IO4VH8wpFCMVEDK8rqDxVhHTp.jpg',
    'https://bruwg0e0jqynr4rb.public.blob.vercel-storage.com/nest/cmh2427ad0000gvqabqqir2s8/1761921323204-20130824_170354(0)-g8CTvESohFVSYd34SOtLZecTlQZrGl.jpg',
    'https://bruwg0e0jqynr4rb.public.blob.vercel-storage.com/nest/cmh2427ad0000gvqabqqir2s8/1761668286217-IMG_3713-vZHD69WLcR1RcfDmBvpZvjzxgDIFfl.jpeg',
    'https://bruwg0e0jqynr4rb.public.blob.vercel-storage.com/nest/cmh2427ad0000gvqabqqir2s8/1761668317577-IMG_1042-65LwhQK6MZh4zXAvn3b4jLo2F1lUH2.jpeg',
    'https://bruwg0e0jqynr4rb.public.blob.vercel-storage.com/nest/cmh2427ad0000gvqabqqir2s8/1761668334291-img_8993-UofNuaqXJQv7bL79HuAA922ulc50g2.jpeg'
  ]

  for (const brokenUrl of brokenUrls) {
    console.log('\n' + '='.repeat(60))

    // Find the Entry with this URL
    const entry = await prisma.entry.findFirst({
      where: { mediaUrl: brokenUrl },
      include: {
        author: { select: { name: true, email: true } },
        branch: { select: { title: true } }
      }
    })

    if (!entry) {
      console.log(`❓ No Entry found with this URL (maybe withdrawn?)`)
      console.log(`   URL: ${brokenUrl}`)
      continue
    }

    console.log(`📝 ENTRY DETAILS:`)
    console.log(`   Text: "${entry.text.substring(0, 60)}..."`)
    console.log(`   Author: ${entry.author.name} (${entry.author.email})`)
    console.log(`   Branch: ${entry.branch?.title || 'N/A'}`)
    console.log(`   Created: ${entry.createdAt}`)
    console.log(`   Status: ${entry.status}`)
    console.log(`   Withdrawn: ${entry.withdrawnAt ? 'YES - ' + entry.withdrawnAt : 'NO'}`)
    console.log(`   Deleted: ${entry.deletedAt ? 'YES - ' + entry.deletedAt : 'NO'}`)

    // Extract filename from URL
    const filename = brokenUrl.split('/').pop()?.split('-').slice(1, -1).join('-')
    console.log(`\n   Filename pattern: ${filename}`)

    // Check if there's a NestItem with similar filename
    const nestItem = await prisma.nestItem.findFirst({
      where: {
        filename: { contains: filename || '' }
      },
      select: {
        id: true,
        filename: true,
        photoUrl: true,
        status: true,
        uploadedAt: true
      }
    })

    if (nestItem) {
      console.log(`\n🪺 MATCHING NEST ITEM:`)
      console.log(`   Filename: ${nestItem.filename}`)
      console.log(`   Status: ${nestItem.status}`)
      console.log(`   Uploaded: ${nestItem.uploadedAt}`)
      console.log(`   Current photoUrl: ${nestItem.photoUrl}`)
      console.log(`   URL exists in blob storage: ${blobUrls.has(nestItem.photoUrl!)}`)
    } else {
      console.log(`\n❌ NO MATCHING NEST ITEM FOUND`)
      console.log(`   This image may have been uploaded directly to the entry, not through Nest`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 SUMMARY\n')
  console.log('Checked 8 broken image URLs')
  console.log('This investigation shows:')
  console.log('1. Whether entries were withdrawn/deleted by user')
  console.log('2. Whether nest items still exist for these images')
  console.log('3. Whether images were uploaded directly vs through Nest')

  await prisma.$disconnect()
}

investigateBrokenImages()

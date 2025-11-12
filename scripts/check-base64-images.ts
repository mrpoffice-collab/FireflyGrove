import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBase64Images() {
  console.log('🔍 ANALYZING IMAGE URL TYPES\n')

  // Check all entries with images
  const entries = await prisma.entry.findMany({
    where: {
      mediaUrl: { not: null },
      deletedAt: null,
    },
    select: {
      id: true,
      mediaUrl: true,
      createdAt: true,
      text: true,
      author: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Total memories with images: ${entries.length}\n`)

  const base64Images = entries.filter((e) => e.mediaUrl?.startsWith('data:'))
  const httpImages = entries.filter((e) => e.mediaUrl?.startsWith('http'))
  const relativeImages = entries.filter((e) => e.mediaUrl?.startsWith('/'))
  const blobImages = entries.filter((e) => e.mediaUrl?.startsWith('blob:'))
  const otherImages = entries.filter(
    (e) =>
      !e.mediaUrl?.startsWith('data:') &&
      !e.mediaUrl?.startsWith('http') &&
      !e.mediaUrl?.startsWith('/') &&
      !e.mediaUrl?.startsWith('blob:')
  )

  console.log('📊 IMAGE URL TYPE BREAKDOWN:')
  console.log('================================')
  console.log(`❌ Base64 Data URLs: ${base64Images.length}`)
  console.log(`✅ HTTP/HTTPS URLs: ${httpImages.length}`)
  console.log(`⚠️  Relative paths: ${relativeImages.length}`)
  console.log(`❌ Blob URLs: ${blobImages.length}`)
  console.log(`❓ Other: ${otherImages.length}`)

  if (base64Images.length > 0) {
    console.log('\n\n⚠️  PROBLEM FOUND: Base64 Data URLs')
    console.log('================================')
    console.log('Base64 images are embedded directly in the database as text.')
    console.log('This causes problems:')
    console.log('1. Database bloat (each image can be 100KB+ of text)')
    console.log('2. Slow queries and page loads')
    console.log('3. May not render properly in all contexts')
    console.log('4. Cannot be cached by browsers')
    console.log('\nFirst 3 base64 images:')

    base64Images.slice(0, 3).forEach((entry, i) => {
      const date = new Date(entry.createdAt).toLocaleDateString()
      const size = entry.mediaUrl?.length || 0
      const sizeKB = (size / 1024).toFixed(1)

      console.log(`\n${i + 1}. ${entry.author.name} - ${date}`)
      console.log(`   Text: ${entry.text.substring(0, 50)}...`)
      console.log(`   Size: ${sizeKB} KB of base64 text`)
      console.log(`   Preview: ${entry.mediaUrl?.substring(0, 100)}...`)
    })

    console.log('\n\n💡 SOLUTION:')
    console.log('================================')
    console.log('These images should be uploaded to cloud storage (Vercel Blob, S3, etc)')
    console.log('and replaced with proper URLs.')
    console.log('\nThese were likely uploaded when nest photos were first added')
    console.log('and the upload system wasn\'t configured properly.')
  }

  if (httpImages.length > 0) {
    console.log('\n\n✅ GOOD: HTTP/HTTPS URLs')
    console.log('================================')
    console.log(`${httpImages.length} images are using proper URLs`)
    console.log('\nSample URLs:')
    httpImages.slice(0, 3).forEach((entry, i) => {
      console.log(`${i + 1}. ${entry.mediaUrl}`)
    })
  }

  await prisma.$disconnect()
}

checkBase64Images().catch(console.error)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImageUrls() {
  console.log('🔍 CHECKING IMAGE URLs IN DATABASE\n')

  // Check entries (memories)
  const entries = await prisma.entry.findMany({
    where: {
      mediaUrl: { not: null },
    },
    select: {
      id: true,
      mediaUrl: true,
      createdAt: true,
      text: true,
      author: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 5,
  })

  console.log('📸 FIRST 5 MEMORIES WITH IMAGES:')
  console.log('================================')
  entries.forEach((entry, i) => {
    const date = new Date(entry.createdAt).toLocaleDateString()
    const url = entry.mediaUrl || ''
    const urlType = url.startsWith('http')
      ? '✅ Full URL'
      : url.startsWith('/')
      ? '⚠️  Relative path'
      : url.startsWith('blob:')
      ? '❌ Blob URL (temporary)'
      : '❓ Unknown format'

    console.log(`\n${i + 1}. ${entry.author.name} - ${date}`)
    console.log(`   Text: ${entry.text.substring(0, 60)}...`)
    console.log(`   URL: ${url}`)
    console.log(`   Type: ${urlType}`)
  })

  console.log('\n\n📦 CHECKING NEST ITEMS:')
  console.log('================================')

  const nestItems = await prisma.nestItem.findMany({
    where: {
      photoUrl: { not: null },
    },
    select: {
      id: true,
      photoUrl: true,
      caption: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 5,
  })

  nestItems.forEach((item, i) => {
    const date = new Date(item.createdAt).toLocaleDateString()
    const url = item.photoUrl || ''
    const urlType = url.startsWith('http')
      ? '✅ Full URL'
      : url.startsWith('/')
      ? '⚠️  Relative path'
      : url.startsWith('blob:')
      ? '❌ Blob URL (temporary)'
      : '❓ Unknown format'

    console.log(`\n${i + 1}. ${item.user.name} - ${date}`)
    console.log(`   Caption: ${item.caption || '(no caption)'}`)
    console.log(`   URL: ${url}`)
    console.log(`   Type: ${urlType}`)
  })

  console.log('\n\n🔍 URL PATTERN ANALYSIS:')
  console.log('================================')

  const allEntries = await prisma.entry.findMany({
    where: { mediaUrl: { not: null } },
    select: { mediaUrl: true },
  })

  const patterns = {
    fullUrl: 0,
    relativePath: 0,
    blobUrl: 0,
    other: 0,
  }

  allEntries.forEach((entry) => {
    const url = entry.mediaUrl || ''
    if (url.startsWith('http')) patterns.fullUrl++
    else if (url.startsWith('/')) patterns.relativePath++
    else if (url.startsWith('blob:')) patterns.blobUrl++
    else patterns.other++
  })

  console.log(`Full URLs (http/https): ${patterns.fullUrl}`)
  console.log(`Relative paths (/...): ${patterns.relativePath}`)
  console.log(`Blob URLs (blob:): ${patterns.blobUrl}`)
  console.log(`Other formats: ${patterns.other}`)
  console.log(`\nTotal memories with images: ${allEntries.length}`)

  await prisma.$disconnect()
}

checkImageUrls().catch(console.error)

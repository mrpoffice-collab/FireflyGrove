import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNestForFile() {
  const filename = '1761921321571-20130824_170101-G6DRtztccv7kCQ3IIPHmJOtq9PP4YE.jpg'

  console.log('Searching for file in Nest:', filename)
  console.log()

  // Search in NestItem
  const nestItems = await prisma.nestItem.findMany({
    where: {
      OR: [
        { photoUrl: { contains: filename } },
        { videoUrl: { contains: filename } },
        { filename: filename }
      ]
    },
    include: {
      user: { select: { email: true, name: true } }
    }
  })

  console.log('Found in NestItems:', nestItems.length)

  nestItems.forEach(item => {
    console.log('\n📸 Nest Item:')
    console.log('  ID:', item.id)
    console.log('  User:', item.user?.name, `(${item.user?.email})`)
    console.log('  Filename:', item.filename)
    console.log('  Photo URL:', item.photoUrl)
    console.log('  Created:', item.createdAt)

    if (item.photoUrl) {
      console.log('\n  🔍 Testing Nest URL accessibility...')
      fetch(item.photoUrl, { method: 'HEAD' })
        .then(response => {
          console.log('  ✅ Status:', response.status, response.statusText)
        })
        .catch(error => {
          console.log('  ❌ Failed:', error.message)
        })
    }
  })

  // Also check in entries
  console.log('\n\nSearching for file in Entries...')
  const entries = await prisma.entry.findMany({
    where: {
      OR: [
        { mediaUrl: { contains: filename } },
        { videoUrl: { contains: filename } }
      ]
    },
    include: {
      author: { select: { name: true, email: true } },
      branch: { select: { title: true } }
    }
  })

  console.log('Found in Entries:', entries.length)

  entries.forEach(entry => {
    console.log('\n💫 Entry:')
    console.log('  ID:', entry.id)
    console.log('  Branch:', entry.branch.title)
    console.log('  Author:', entry.author.name)
    console.log('  Media URL:', entry.mediaUrl)
    console.log('  Created:', entry.createdAt)
  })
}

checkNestForFile()
  .then(() => {
    setTimeout(() => process.exit(0), 2000) // Wait for async fetch
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEntry() {
  const entry = await prisma.entry.findUnique({
    where: { id: 'cmheytvje000110wtos5xytg6' },
    include: {
      author: { select: { name: true, email: true } },
      branch: { select: { title: true } }
    }
  })

  if (entry) {
    console.log('Entry Details:')
    console.log('ID:', entry.id)
    console.log('Created:', entry.createdAt)
    console.log('Author:', entry.author.name)
    console.log('Branch:', entry.branch.title)
    console.log('\nMedia URL (full):')
    console.log(entry.mediaUrl)
    console.log('\nURL length:', entry.mediaUrl?.length)

    if (entry.mediaUrl) {
      // Try to fetch the URL to see if it's accessible
      console.log('\n🔍 Testing URL accessibility...')
      try {
        const response = await fetch(entry.mediaUrl, { method: 'HEAD' })
        console.log('✅ Status:', response.status, response.statusText)
        console.log('Content-Type:', response.headers.get('content-type'))
        console.log('Content-Length:', response.headers.get('content-length'))
      } catch (error: any) {
        console.log('❌ Failed to fetch:', error.message)
      }
    }
  } else {
    console.log('Entry not found')
  }
}

checkEntry()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

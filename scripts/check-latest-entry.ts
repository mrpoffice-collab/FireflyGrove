import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLatestEntry() {
  const branchId = 'cmhkzbmmq0001113udi0a8mg9'

  console.log('Checking latest entry on branch:', branchId)
  console.log()

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { title: true }
  })

  console.log('Branch:', branch?.title)
  console.log()

  // Get the most recent entry with an image
  const entry = await prisma.entry.findFirst({
    where: {
      branchId,
      mediaUrl: { not: null }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, email: true } }
    }
  })

  if (!entry) {
    console.log('No entries with images found')
    return
  }

  console.log('📝 Latest Entry with Image:')
  console.log('ID:', entry.id)
  console.log('Created:', entry.createdAt.toLocaleString())
  console.log('Author:', entry.author.name)
  console.log('Text preview:', entry.text.substring(0, 60) + '...')
  console.log()

  if (entry.mediaUrl) {
    console.log('📷 Media URL Analysis:')
    console.log('Full URL:', entry.mediaUrl)
    console.log()

    // Check if it's nest or permanent storage
    if (entry.mediaUrl.includes('/nest/')) {
      console.log('❌ STILL IN NEST STORAGE - Fix may not have deployed yet')
    } else if (entry.mediaUrl.includes('/memories/')) {
      console.log('✅ IN PERMANENT STORAGE - Fix worked!')
    } else if (entry.mediaUrl.startsWith('data:')) {
      console.log('ℹ️  BASE64 DATA URL - Not from nest')
    } else {
      console.log('⚠️  UNKNOWN STORAGE LOCATION')
    }

    console.log()
    console.log('🔍 Testing URL accessibility...')

    try {
      const response = await fetch(entry.mediaUrl, { method: 'HEAD' })
      console.log('Status:', response.status)

      if (response.ok) {
        console.log('✅ IMAGE WORKS - File is accessible!')
      } else if (response.status === 404) {
        console.log('❌ IMAGE BROKEN - 404 Not Found')
      } else {
        console.log('⚠️  Unexpected status:', response.statusText)
      }

      console.log('Content-Type:', response.headers.get('content-type'))
      console.log('Content-Length:', response.headers.get('content-length'), 'bytes')
    } catch (error: any) {
      console.log('❌ ERROR fetching:', error.message)
    }
  }
}

checkLatestEntry()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLastHour() {
  const branchId = 'cmhkzbmmq0001113udi0a8mg9'
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  console.log('Checking entries from last hour on Dresdyn branch')
  console.log('Looking for entries after:', oneHourAgo.toLocaleString())
  console.log()

  const entries = await prisma.entry.findMany({
    where: {
      branchId,
      createdAt: { gte: oneHourAgo }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } }
    }
  })

  console.log(`Found ${entries.length} entry(ies) in last hour:\n`)

  for (const entry of entries) {
    console.log('═'.repeat(80))
    console.log('Entry ID:', entry.id)
    console.log('Created:', entry.createdAt.toLocaleString())
    console.log('Author:', entry.author.name)
    console.log('Text:', entry.text.substring(0, 100))
    console.log()

    if (entry.mediaUrl) {
      console.log('📷 HAS IMAGE')
      console.log('URL:', entry.mediaUrl)
      console.log()

      // Analyze storage type
      if (entry.mediaUrl.startsWith('data:image')) {
        console.log('Type: BASE64 DATA URL (embedded)')
        console.log('Size:', (entry.mediaUrl.length * 0.75 / 1024 / 1024).toFixed(2), 'MB')
        console.log('✅ This type never breaks (embedded in database)')
      } else if (entry.mediaUrl.includes('/nest/')) {
        console.log('Type: NEST BLOB URL (temporary)')
        console.log('⚠️  Warning: Will break when nest item deleted')
      } else if (entry.mediaUrl.includes('/memories/')) {
        console.log('Type: PERMANENT BLOB URL')
        console.log('✅ Permanent storage')
      }

      console.log()
      console.log('Testing accessibility...')
      try {
        const res = await fetch(entry.mediaUrl.startsWith('data:')
          ? entry.mediaUrl.substring(0, 100)
          : entry.mediaUrl,
          { method: 'HEAD' }
        )

        if (entry.mediaUrl.startsWith('data:')) {
          console.log('✅ BASE64 - Always works (embedded data)')
        } else {
          console.log('Status:', res.status, res.ok ? '✅ WORKS' : '❌ BROKEN')
        }
      } catch (err: any) {
        if (entry.mediaUrl.startsWith('data:')) {
          console.log('✅ BASE64 - No fetch needed')
        } else {
          console.log('❌ Error:', err.message)
        }
      }
    } else {
      console.log('(No image)')
    }

    console.log()
  }
}

checkLastHour()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

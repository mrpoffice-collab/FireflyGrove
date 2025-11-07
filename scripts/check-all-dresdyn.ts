import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllDresdyn() {
  const branchId = 'cmhkzbmmq0001113udi0a8mg9'

  console.log('Checking ALL entries on Dresdyn branch')
  console.log()

  const entries = await prisma.entry.findMany({
    where: { branchId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      author: { select: { name: true } }
    }
  })

  console.log(`Found ${entries.length} total entries (showing last 10):\n`)

  for (const entry of entries) {
    console.log('═'.repeat(80))
    console.log('Entry ID:', entry.id)
    console.log('Created:', entry.createdAt.toLocaleString())
    console.log('Author:', entry.author.name)
    console.log('Text:', entry.text.substring(0, 80))
    console.log()

    if (entry.mediaUrl) {
      console.log('📷 HAS IMAGE')

      // Analyze storage type
      if (entry.mediaUrl.startsWith('data:image')) {
        console.log('Type: ✅ BASE64 DATA URL - Always works!')
        console.log('Size:', (entry.mediaUrl.length * 0.75 / 1024 / 1024).toFixed(2), 'MB')
        console.log('Status: Working (embedded in database)')
      } else if (entry.mediaUrl.includes('/nest/')) {
        console.log('Type: ⚠️ NEST BLOB URL')
        console.log('URL:', entry.mediaUrl)

        // Test it
        try {
          const res = await fetch(entry.mediaUrl, { method: 'HEAD' })
          if (res.ok) {
            console.log('Status: ✅ WORKING (nest file still exists somehow!)')
          } else {
            console.log('Status: ❌ BROKEN -', res.status)
          }
        } catch (err: any) {
          console.log('Status: ❌ BROKEN -', err.message)
        }
      } else if (entry.mediaUrl.includes('/memories/')) {
        console.log('Type: ✅ PERMANENT STORAGE')
        console.log('URL:', entry.mediaUrl)
        console.log('Status: Should be working')
      }
    } else {
      console.log('(No image)')
    }

    console.log()
  }
}

checkAllDresdyn()
  .then(() => {
    setTimeout(() => process.exit(0), 2000)
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

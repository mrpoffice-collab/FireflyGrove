import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findTodaysUploads() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  console.log('Searching for Zakery Peterson entries created today...')
  console.log('Date filter:', today.toISOString())
  console.log()

  const entries = await prisma.entry.findMany({
    where: {
      branch: {
        person: {
          name: { contains: 'Zakery', mode: 'insensitive' }
        }
      },
      createdAt: { gte: today }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, email: true } },
      branch: { select: { title: true } }
    }
  })

  console.log(`Found ${entries.length} entries today\n`)

  entries.forEach((entry, index) => {
    console.log(`\n📝 Entry #${index + 1}:`)
    console.log('  ID:', entry.id)
    console.log('  Created:', entry.createdAt.toLocaleString())
    console.log('  Author:', entry.author.name, `(${entry.author.email})`)
    console.log('  Text preview:', entry.text.substring(0, 60) + '...')

    console.log('\n  Media Status:')
    if (entry.mediaUrl) {
      const urlType = entry.mediaUrl.startsWith('data:') ? 'DATA URL (base64)' :
                      entry.mediaUrl.startsWith('http') ? 'EXTERNAL URL' :
                      entry.mediaUrl.startsWith('blob:') ? 'BLOB URL' : 'UNKNOWN'

      console.log('  ✓ Has mediaUrl:', urlType)
      console.log('    Length:', entry.mediaUrl.length, 'chars')
      console.log('    Preview:', entry.mediaUrl.substring(0, 100))

      if (entry.mediaUrl.startsWith('data:')) {
        console.log('    ⚠️ Using embedded base64 - could be truncated!')
      } else if (entry.mediaUrl.startsWith('http')) {
        console.log('    Testing URL...')
        fetch(entry.mediaUrl, { method: 'HEAD' })
          .then(res => console.log('    Status:', res.status, res.statusText))
          .catch(err => console.log('    ❌ Failed:', err.message))
      }
    } else {
      console.log('  ✗ No mediaUrl')
    }

    if (entry.videoUrl) console.log('  ✓ Has videoUrl')
    if (entry.audioUrl) console.log('  ✓ Has audioUrl')

    console.log('  ---')
  })
}

findTodaysUploads()
  .then(() => {
    setTimeout(() => process.exit(0), 3000)
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findAllRecentZakery() {
  console.log('Searching for ALL Zakery Peterson entries (last 7 days)...\n')

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const entries = await prisma.entry.findMany({
    where: {
      branch: {
        person: {
          name: { contains: 'Zakery', mode: 'insensitive' }
        }
      },
      createdAt: { gte: sevenDaysAgo }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, email: true } },
      branch: { select: { title: true } }
    }
  })

  console.log(`Found ${entries.length} entries in last 7 days\n`)

  entries.forEach((entry, index) => {
    console.log(`\n📝 Entry #${index + 1}:`)
    console.log('  ID:', entry.id)
    console.log('  Created:', entry.createdAt.toLocaleString())
    console.log('  Author:', entry.author.name)
    console.log('  Text:', entry.text.substring(0, 80) + (entry.text.length > 80 ? '...' : ''))

    if (entry.mediaUrl) {
      const isDataUrl = entry.mediaUrl.startsWith('data:')
      const isHttpUrl = entry.mediaUrl.startsWith('http')

      console.log('\n  📷 Media:')
      console.log('    Type:', isDataUrl ? 'Base64 Data URL' : isHttpUrl ? 'External URL' : 'Other')
      console.log('    Length:', entry.mediaUrl.length, 'characters')

      if (isHttpUrl) {
        console.log('    URL:', entry.mediaUrl)
        console.log('    Testing...')
        fetch(entry.mediaUrl, { method: 'HEAD' })
          .then(res => {
            if (res.status === 404) {
              console.log('    ❌ 404 NOT FOUND - FILE MISSING!')
            } else if (res.ok) {
              console.log('    ✅ OK - File exists')
            } else {
              console.log('    ⚠️  Status:', res.status)
            }
          })
          .catch(err => console.log('    ❌ Error:', err.message))
      } else if (isDataUrl) {
        const mimeType = entry.mediaUrl.substring(5, entry.mediaUrl.indexOf(';'))
        console.log('    MIME:', mimeType)
        console.log('    Size:', (entry.mediaUrl.length * 0.75 / 1024).toFixed(2), 'KB (estimated)')
      }
    } else {
      console.log('  (No image)')
    }

    console.log('  ' + '='.repeat(60))
  })
}

findAllRecentZakery()
  .then(() => {
    setTimeout(() => process.exit(0), 3000)
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

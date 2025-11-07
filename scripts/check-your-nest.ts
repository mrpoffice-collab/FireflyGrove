import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkYourNest() {
  const userId = 'cmh2427ad0000gvqabqqir2s8' // Your user ID

  console.log('Checking your Nest for items...\n')

  const nestItems = await prisma.nestItem.findMany({
    where: { userId },
    orderBy: { uploadedAt: 'desc' }
  })

  console.log(`Found ${nestItems.length} items in your Nest\n`)

  if (nestItems.length === 0) {
    console.log('Your nest is empty - all items have been hatched/deleted')
    return
  }

  for (const item of nestItems) {
    console.log('═'.repeat(80))
    console.log('Nest Item ID:', item.id)
    console.log('Uploaded:', item.uploadedAt.toLocaleString())
    console.log('Filename:', item.filename)
    console.log('Caption:', item.caption || '(none)')

    const url = item.photoUrl || item.videoUrl
    if (url) {
      console.log('URL:', url)
      console.log()
      console.log('Testing if blob file exists...')

      try {
        const res = await fetch(url, { method: 'HEAD' })
        if (res.ok) {
          console.log('✅ FILE EXISTS in blob storage')
          console.log('   Size:', res.headers.get('content-length'), 'bytes')
          console.log('   Type:', res.headers.get('content-type'))

          // Check if this file is used in any memories
          const usedInEntries = await prisma.entry.findMany({
            where: {
              OR: [
                { mediaUrl: url },
                { videoUrl: url }
              ]
            },
            select: {
              id: true,
              branch: { select: { title: true } }
            }
          })

          if (usedInEntries.length > 0) {
            console.log(`   ⚠️  USED IN ${usedInEntries.length} MEMORY(IES):`)
            usedInEntries.forEach(entry => {
              console.log(`      - ${entry.branch.title} (ID: ${entry.id})`)
            })
            console.log('   ⚠️  If you delete this nest item, those memories will break!')
          }
        } else {
          console.log('❌ FILE DELETED - Status:', res.status)
        }
      } catch (err: any) {
        console.log('❌ ERROR:', err.message)
      }
    }
    console.log()
  }
}

checkYourNest()
  .then(() => {
    setTimeout(() => process.exit(0), 2000)
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

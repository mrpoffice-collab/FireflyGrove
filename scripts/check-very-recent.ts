import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVeryRecent() {
  const branchId = 'cmhkzbmmq0001113udi0a8mg9'

  // Get entries from last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

  console.log('Checking for entries created in last 10 minutes on branch:', branchId)
  console.log('Looking for entries after:', tenMinutesAgo.toLocaleString())
  console.log()

  const entries = await prisma.entry.findMany({
    where: {
      branchId,
      createdAt: { gte: tenMinutesAgo }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } }
    }
  })

  if (entries.length === 0) {
    console.log('❌ No entries found in last 10 minutes')
    console.log()
    console.log('The entry you created might be older, or deployment is still in progress.')
    console.log('Wait 1-2 minutes and try creating a NEW memory from nest to test the fix.')
    return
  }

  console.log(`✅ Found ${entries.length} recent entry(ies):\n`)

  for (const entry of entries) {
    console.log('Entry ID:', entry.id)
    console.log('Created:', entry.createdAt.toLocaleString())
    console.log('Author:', entry.author.name)
    console.log('Has image:', !!entry.mediaUrl)

    if (entry.mediaUrl) {
      console.log('Media URL:', entry.mediaUrl)

      if (entry.mediaUrl.includes('/memories/')) {
        console.log('✅✅✅ SUCCESS! Image copied to permanent storage!')
      } else if (entry.mediaUrl.includes('/nest/')) {
        console.log('⚠️  Still in nest storage - deployment may still be in progress')
      }

      // Test it
      try {
        const res = await fetch(entry.mediaUrl, { method: 'HEAD' })
        console.log('Status:', res.status, res.ok ? '✅ WORKS' : '❌ BROKEN')
      } catch (err: any) {
        console.log('Error:', err.message)
      }
    }

    console.log()
  }
}

checkVeryRecent()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

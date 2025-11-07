import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkYourGroveImages() {
  console.log('Checking images in YOUR grove vs Open Grove...\n')

  // Find your user
  const user = await prisma.user.findUnique({
    where: { email: 'mrpoffice@gmail.com' }
  })

  if (!user) {
    console.log('User not found')
    return
  }

  console.log('Your user ID:', user.id)
  console.log()

  // Get recent entries from YOUR branches
  const yourEntries = await prisma.entry.findMany({
    where: {
      authorId: user.id,
      branch: {
        ownerId: user.id, // Your own branches
      },
      mediaUrl: { not: null },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      branch: { select: { title: true } }
    }
  })

  console.log(`\n🏡 YOUR GROVE (last 30 days, with images): ${yourEntries.length} entries\n`)

  for (const entry of yourEntries) {
    console.log(`Entry: ${entry.id}`)
    console.log(`Branch: ${entry.branch.title}`)
    console.log(`Created: ${entry.createdAt.toLocaleString()}`)
    console.log(`Media URL type: ${entry.mediaUrl?.startsWith('data:') ? 'BASE64 DATA URL' : entry.mediaUrl?.startsWith('http') ? 'BLOB URL' : 'OTHER'}`)

    if (entry.mediaUrl?.startsWith('http')) {
      console.log(`URL: ${entry.mediaUrl}`)
      // Test it
      try {
        const res = await fetch(entry.mediaUrl, { method: 'HEAD' })
        console.log(`Status: ${res.status} ${res.ok ? '✅ WORKING' : '❌ BROKEN'}`)
      } catch (err: any) {
        console.log(`Status: ❌ ERROR - ${err.message}`)
      }
    } else if (entry.mediaUrl?.startsWith('data:')) {
      console.log(`Data URL length: ${entry.mediaUrl.length} chars`)
    }
    console.log()
  }

  // Get recent entries from OPEN GROVE
  const openGroveEntries = await prisma.entry.findMany({
    where: {
      authorId: user.id,
      branch: {
        ownerId: { not: user.id }, // NOT your branches
        person: {
          discoveryEnabled: true // Open Grove
        }
      },
      mediaUrl: { not: null },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      branch: {
        select: {
          title: true,
          person: { select: { name: true } }
        }
      }
    }
  })

  console.log(`\n🌳 OPEN GROVE (last 30 days, with images): ${openGroveEntries.length} entries\n`)

  for (const entry of openGroveEntries) {
    console.log(`Entry: ${entry.id}`)
    console.log(`Branch: ${entry.branch.title}`)
    console.log(`Person: ${entry.branch.person?.name}`)
    console.log(`Created: ${entry.createdAt.toLocaleString()}`)
    console.log(`Media URL type: ${entry.mediaUrl?.startsWith('data:') ? 'BASE64 DATA URL' : entry.mediaUrl?.startsWith('http') ? 'BLOB URL' : 'OTHER'}`)

    if (entry.mediaUrl?.startsWith('http')) {
      console.log(`URL: ${entry.mediaUrl}`)
      try {
        const res = await fetch(entry.mediaUrl, { method: 'HEAD' })
        console.log(`Status: ${res.status} ${res.ok ? '✅ WORKING' : '❌ BROKEN'}`)
      } catch (err: any) {
        console.log(`Status: ❌ ERROR - ${err.message}`)
      }
    } else if (entry.mediaUrl?.startsWith('data:')) {
      console.log(`Data URL length: ${entry.mediaUrl.length} chars`)
    }
    console.log()
  }
}

checkYourGroveImages()
  .then(() => {
    setTimeout(() => process.exit(0), 3000)
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

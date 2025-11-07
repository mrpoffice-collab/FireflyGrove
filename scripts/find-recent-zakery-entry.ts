import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findRecentZakeryEntry() {
  console.log('Searching for recent Zakery Peterson entries...\n')

  // Find the person
  const person = await prisma.person.findFirst({
    where: {
      name: { contains: 'Zakery', mode: 'insensitive' }
    },
    include: {
      branches: {
        include: {
          entries: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              author: { select: { name: true, email: true } }
            }
          }
        }
      }
    }
  })

  if (person) {
    console.log('Found person:', person.name)
    console.log('Person ID:', person.id)
    console.log('Is Legacy:', person.isLegacy)
    console.log('Discovery Enabled:', person.discoveryEnabled)
    console.log('\nRecent entries:')

    person.branches.forEach(branch => {
      console.log(`\nBranch: ${branch.title} (${branch.id})`)
      branch.entries.forEach(entry => {
        console.log(`  Entry ID: ${entry.id}`)
        console.log(`  Created: ${entry.createdAt}`)
        console.log(`  Author: ${entry.author.name} (${entry.author.email})`)
        console.log(`  Text preview: ${entry.text.substring(0, 50)}...`)
        console.log(`  Has mediaUrl: ${!!entry.mediaUrl}`)
        if (entry.mediaUrl) {
          const urlPreview = entry.mediaUrl.substring(0, 100)
          console.log(`  Media URL preview: ${urlPreview}...`)
          console.log(`  Media URL length: ${entry.mediaUrl.length}`)

          // Check if it's a data URL or blob URL
          if (entry.mediaUrl.startsWith('data:')) {
            console.log(`  ⚠️ Using data URL (embedded base64)`)
          } else if (entry.mediaUrl.startsWith('http')) {
            console.log(`  ✓ Using external URL`)
          } else if (entry.mediaUrl.startsWith('blob:')) {
            console.log(`  ⚠️ Using blob URL (temporary, will break!)`)
          } else {
            console.log(`  ❌ Unknown URL format`)
          }
        }
        console.log(`  Has videoUrl: ${!!entry.videoUrl}`)
        console.log(`  Has audioUrl: ${!!entry.audioUrl}`)
        console.log('  ---')
      })
    })
  } else {
    console.log('❌ Person not found')

    // Try searching in entries directly
    console.log('\nSearching for entries with "Zakery" in text...')
    const entries = await prisma.entry.findMany({
      where: {
        text: { contains: 'Zakery', mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: { select: { name: true, email: true } },
        branch: { select: { title: true } }
      }
    })

    console.log(`Found ${entries.length} entries`)
    entries.forEach(entry => {
      console.log(`\nEntry ID: ${entry.id}`)
      console.log(`Branch: ${entry.branch.title}`)
      console.log(`Created: ${entry.createdAt}`)
      console.log(`Author: ${entry.author.name}`)
      console.log(`Has mediaUrl: ${!!entry.mediaUrl}`)
      if (entry.mediaUrl) {
        console.log(`Media URL preview: ${entry.mediaUrl.substring(0, 100)}...`)
      }
    })
  }
}

findRecentZakeryEntry()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

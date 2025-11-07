import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function compareDresdynVsZakery() {
  console.log('Comparing Dresdyn vs Zakery Peterson entries...\n')

  // Dresdyn entry
  const dresdynEntry = await prisma.entry.findUnique({
    where: { id: 'cmhkzekjv0003uj3kfaiygwig' },
    include: {
      branch: { select: { title: true } },
      author: { select: { name: true } }
    }
  })

  // Zakery entry
  const zakeryEntry = await prisma.entry.findUnique({
    where: { id: 'cmheytvje000110wtos5xytg6' },
    include: {
      branch: { select: { title: true } },
      author: { select: { name: true } }
    }
  })

  console.log('═'.repeat(80))
  console.log('DRESDYN ENTRY (working according to you)')
  console.log('═'.repeat(80))
  if (dresdynEntry) {
    console.log('ID:', dresdynEntry.id)
    console.log('Branch:', dresdynEntry.branch.title)
    console.log('Created:', dresdynEntry.createdAt.toLocaleString())
    console.log('Author:', dresdynEntry.author.name)
    console.log()
    console.log('Media URL:', dresdynEntry.mediaUrl)
    console.log()

    if (dresdynEntry.mediaUrl) {
      // Check if nest item exists
      const filename = dresdynEntry.mediaUrl.split('/').pop()?.split('-').slice(1).join('-')
      console.log('Filename from URL:', filename)

      const nestItem = await prisma.nestItem.findFirst({
        where: {
          photoUrl: dresdynEntry.mediaUrl
        }
      })

      if (nestItem) {
        console.log('✅ NEST ITEM EXISTS - ID:', nestItem.id)
        console.log('   Uploaded:', nestItem.uploadedAt.toLocaleString())
      } else {
        console.log('❌ NEST ITEM DELETED or never existed')
      }

      // Test blob
      try {
        const res = await fetch(dresdynEntry.mediaUrl, { method: 'HEAD' })
        console.log('Blob status:', res.status, res.ok ? '✅ EXISTS' : '❌ MISSING')
      } catch (err: any) {
        console.log('Blob status: ❌ ERROR -', err.message)
      }
    }
  }

  console.log()
  console.log('═'.repeat(80))
  console.log('ZAKERY PETERSON ENTRY (broken)')
  console.log('═'.repeat(80))
  if (zakeryEntry) {
    console.log('ID:', zakeryEntry.id)
    console.log('Branch:', zakeryEntry.branch.title)
    console.log('Created:', zakeryEntry.createdAt.toLocaleString())
    console.log('Author:', zakeryEntry.author.name)
    console.log()
    console.log('Media URL:', zakeryEntry.mediaUrl)
    console.log()

    if (zakeryEntry.mediaUrl) {
      if (zakeryEntry.mediaUrl.startsWith('data:')) {
        console.log('Type: BASE64 DATA URL')
        console.log('Size:', (zakeryEntry.mediaUrl.length * 0.75 / 1024 / 1024).toFixed(2), 'MB')
        console.log('✅ This never breaks (embedded in database)')
      } else {
        const filename = zakeryEntry.mediaUrl.split('/').pop()?.split('-').slice(1).join('-')
        console.log('Filename from URL:', filename)

        const nestItem = await prisma.nestItem.findFirst({
          where: {
            photoUrl: zakeryEntry.mediaUrl
          }
        })

        if (nestItem) {
          console.log('✅ NEST ITEM EXISTS - ID:', nestItem.id)
        } else {
          console.log('❌ NEST ITEM DELETED')
        }

        // Test blob
        try {
          const res = await fetch(zakeryEntry.mediaUrl, { method: 'HEAD' })
          console.log('Blob status:', res.status, res.ok ? '✅ EXISTS' : '❌ MISSING')
        } catch (err: any) {
          console.log('Blob status: ❌ ERROR -', err.message)
        }
      }
    }
  }

  console.log()
  console.log('═'.repeat(80))
  console.log('ANALYSIS')
  console.log('═'.repeat(80))
  console.log()
  console.log('The key difference should show above.')
  console.log('If both show "NEST ITEM EXISTS", then they should both work.')
  console.log('If one shows "NEST ITEM DELETED" and blob is missing, that explains why it broke.')
}

compareDresdynVsZakery()
  .then(() => {
    setTimeout(() => process.exit(0), 2000)
  })
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })

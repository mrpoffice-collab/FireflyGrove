import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

async function testMatching() {
  console.log('🧪 Testing Sentiment Matching\n')

  // Get first category
  const category = await prisma.cardCategory.findFirst({
    where: { name: 'Sympathy & Condolence' },
  })

  if (!category) {
    console.log('❌ Category not found')
    return
  }

  console.log(`Testing category: ${category.icon} ${category.name}\n`)

  // Read CSV
  const csvPath = path.join(process.cwd(), 'config', 'card-sentiments.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  // Match logic (same as API)
  const categoryName = category.name.toLowerCase()
  const categoryKeywords = categoryName.split(' ')

  const sentiments = records
    .filter((record: any) => {
      const csvCategory = (record.Category || '').toLowerCase()
      const tags = (record.Tags || '').toLowerCase()

      return categoryKeywords.some(keyword =>
        keyword.length > 2 && (csvCategory.includes(keyword) || tags.includes(keyword))
      )
    })

  console.log(`Found ${sentiments.length} matching sentiments:\n`)

  sentiments.forEach((record: any, i: number) => {
    console.log(`${i + 1}. CSV Category: "${record.Category}"`)
    console.log(`   Tags: "${record.Tags}"`)
    console.log(`   FRONT (what shows on card): "${record.Front.substring(0, 60)}..."`)
    console.log(`   INSIDE (what shows on card): "${record.Inside.substring(0, 60)}..."`)
    console.log('')
  })
}

testMatching()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

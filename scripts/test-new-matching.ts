import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

async function testNewMatching() {
  console.log('🧪 Testing NEW Strict Matching\n')

  const categoriesToTest = [
    'Sympathy & Condolence',
    'Pet Remembrance',
    'Birthday',
    'Thank You',
  ]

  // Read CSV
  const csvPath = path.join(process.cwd(), 'config', 'card-sentiments.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  for (const categoryName of categoriesToTest) {
    const sentiments = records.filter((record: any) => {
      return record.Category === categoryName
    })

    console.log(`"${categoryName}"`)
    console.log(`  Found: ${sentiments.length} sentiments\n`)

    sentiments.forEach((s: any, i: number) => {
      console.log(`  ${i + 1}. ${s.Front.substring(0, 60)}...`)
    })
    console.log('')
  }
}

testNewMatching()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

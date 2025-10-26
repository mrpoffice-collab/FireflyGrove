import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Simple CSV parser that handles quoted fields with newlines
function parseCSV(content: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let insideQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      currentRow.push(currentField.trim())
      currentField = ''
    } else if (char === '\n' && !insideQuotes) {
      // End of row
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim())
        rows.push(currentRow)
        currentRow = []
        currentField = ''
      }
    } else if (char === '\r' && nextChar === '\n' && !insideQuotes) {
      // Windows line ending - skip \r
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim())
        rows.push(currentRow)
        currentRow = []
        currentField = ''
      }
      i++ // Skip \n
    } else {
      currentField += char
    }
  }

  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    rows.push(currentRow)
  }

  return rows
}

async function importSentiments() {
  console.log('✨ Importing card sentiments from CSV...\n')

  // Read the CSV file
  const csvPath = path.join(process.cwd(), 'config', 'card-sentiments.csv')

  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath)
    console.error('   Please create config/card-sentiments.csv first.')
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(csvContent)

  // Validate header
  const header = rows[0]
  if (
    !header ||
    header[0] !== 'Category' ||
    header[1] !== 'Front' ||
    header[2] !== 'Inside' ||
    header[3] !== 'Tags'
  ) {
    console.error('❌ Invalid CSV format. Expected columns: Category, Front, Inside, Tags')
    process.exit(1)
  }

  // Fetch all categories
  const categories = await prisma.cardCategory.findMany()
  const categoryMap = new Map<string, string>()
  categories.forEach((cat) => categoryMap.set(cat.name, cat.id))

  console.log(`Found ${categories.length} card categories in database\n`)

  let imported = 0
  let skipped = 0
  let errors = 0

  // Process each row (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]

    // Skip empty rows
    if (!row || row.length < 3 || !row[0]) {
      continue
    }

    const [categoryName, coverMessage, insideMessage, tags] = row

    // Look up category ID
    const categoryId = categoryMap.get(categoryName)

    if (!categoryId) {
      console.log(`⚠️  Row ${i + 1}: Category "${categoryName}" not found - skipping`)
      skipped++
      continue
    }

    try {
      // Check if this sentiment already exists
      const existing = await prisma.cardSentiment.findFirst({
        where: {
          categoryId,
          coverMessage,
          insideMessage,
        },
      })

      if (existing) {
        console.log(
          `⚠️  Row ${i + 1}: Sentiment for "${categoryName}" already exists - skipping`
        )
        skipped++
        continue
      }

      // Create the sentiment
      await prisma.cardSentiment.create({
        data: {
          categoryId,
          coverMessage,
          insideMessage,
          tags: tags || null,
          displayOrder: imported,
        },
      })

      console.log(`✓ Imported sentiment for "${categoryName}"`)
      imported++
    } catch (error) {
      console.error(`❌ Row ${i + 1}: Error importing sentiment:`, error)
      errors++
    }
  }

  console.log(`\n✅ Import complete!`)
  console.log(`   Imported: ${imported}`)
  console.log(`   Skipped:  ${skipped}`)
  console.log(`   Errors:   ${errors}`)
  console.log('\n🌟 Your sentiment library is ready!')
}

importSentiments()
  .catch((e) => {
    console.error('❌ Error importing sentiments:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

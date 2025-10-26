import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function updateSentiments() {
  console.log('✨ Updating card sentiments from config file...\n')

  // Read the config file
  const configPath = path.join(process.cwd(), 'config', 'card-sentiments.json')

  if (!fs.existsSync(configPath)) {
    console.error('❌ Config file not found at:', configPath)
    console.error('   Please create config/card-sentiments.json first.')
    process.exit(1)
  }

  const configContent = fs.readFileSync(configPath, 'utf-8')
  const config = JSON.parse(configContent)
  const sentiments = config.sentiments

  // Fetch all templates
  const templates = await prisma.cardTemplate.findMany({
    include: { category: true },
  })

  let updated = 0
  let notFound = 0

  for (const template of templates) {
    // Try to find sentiment by template name
    const sentiment = sentiments[template.name] || sentiments['Default']

    if (sentiment) {
      await prisma.cardTemplate.update({
        where: { id: template.id },
        data: {
          coverMessage: sentiment.cover,
          insideMessage: sentiment.inside,
        },
      })
      console.log(`✓ Updated "${template.name}" (${template.category.name})`)
      updated++
    } else {
      console.log(`⚠️  No sentiment found for "${template.name}" - skipped`)
      notFound++
    }
  }

  console.log(`\n✅ Successfully updated ${updated} templates!`)
  if (notFound > 0) {
    console.log(`⚠️  ${notFound} templates had no matching sentiment and were skipped.`)
  }
  console.log('🌟 Your card sentiments are now live.')
}

updateSentiments()
  .catch((e) => {
    console.error('❌ Error updating sentiments:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

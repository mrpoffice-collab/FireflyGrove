/**
 * Extracts Glow Guide content and metadata
 * Generates Knowledge Bank markdown files
 *
 * Usage: tsx scripts/extract-glow-guides.ts
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

interface GlowGuideMetadata {
  id: string
  slug: string
  title: string
  subtitle: string
  icon: string
  category: string
  tags: string[]
  difficulty: string
  timeToRead: number
  relatedArticles: string[]
  trigger: string
  cta: string
  ctaAction: string
}

interface ExtractedContent {
  mainDescription: string
  keyPoints: string[]
  privacyNote?: string
  exampleText?: string
}

async function extractGlowGuides() {
  console.log('🔍 Finding Glow Guide components...\n')

  // Find all Glow Guide components
  const glowGuideFiles = await glob('components/discovery/**/*Modal.tsx')

  if (glowGuideFiles.length === 0) {
    console.error('❌ No Glow Guide components found!')
    process.exit(1)
  }

  console.log(`Found ${glowGuideFiles.length} Glow Guide components\n`)

  // Create output directory
  const outputDir = path.join(process.cwd(), 'knowledge/articles')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    console.log(`✓ Created directory: ${outputDir}\n`)
  }

  let successCount = 0
  let skipCount = 0

  for (const file of glowGuideFiles) {
    try {
      console.log(`Processing: ${path.basename(file)}`)

      // Read file content
      const content = fs.readFileSync(file, 'utf-8')

      // Check for metadata export
      if (!content.includes('export const glowGuideMetadata')) {
        console.log(`  ⚠️  No metadata found - skipping\n`)
        skipCount++
        continue
      }

      // Extract metadata
      const metadata = extractMetadata(content)
      if (!metadata) {
        console.log(`  ❌ Failed to parse metadata - skipping\n`)
        skipCount++
        continue
      }

      console.log(`  ✓ Metadata: ${metadata.title}`)

      // Extract content sections from JSX
      const extractedContent = extractContentFromJSX(content, metadata)
      console.log(`  ✓ Extracted content sections`)

      // Generate markdown
      const markdown = generateMarkdown(metadata, extractedContent)

      // Write to knowledge/articles/
      const outputPath = path.join(outputDir, `${metadata.slug}.md`)
      fs.writeFileSync(outputPath, markdown)
      console.log(`  ✓ Generated: ${outputPath}\n`)

      successCount++
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error)
      console.log('')
    }
  }

  console.log('─'.repeat(50))
  console.log(`\n✅ Extraction complete!`)
  console.log(`   Generated: ${successCount}`)
  console.log(`   Skipped: ${skipCount}`)
  console.log(`   Total: ${glowGuideFiles.length}\n`)
}

function extractMetadata(content: string): GlowGuideMetadata | null {
  try {
    // Extract the metadata object
    const metadataMatch = content.match(/export const glowGuideMetadata = \{([\s\S]*?)\n\}/m)
    if (!metadataMatch) return null

    const metadataStr = '{' + metadataMatch[1] + '\n}'

    // Parse as JSON-like object (safe because we control the files)
    // Replace single quotes with double quotes for JSON parsing
    const jsonStr = metadataStr
      .replace(/'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas

    // Use eval for complex object (safer alternative would be a proper parser)
    const metadata = eval(`(${metadataStr})`)

    return metadata as GlowGuideMetadata
  } catch (error) {
    console.error('Error parsing metadata:', error)
    return null
  }
}

function extractContentFromJSX(content: string, metadata: GlowGuideMetadata): ExtractedContent {
  // Extract main description (first paragraph after subtitle)
  const descriptionMatch = content.match(/<p className="leading-relaxed">\s*([\s\S]*?)\s*<\/p>/)
  const mainDescription = descriptionMatch
    ? descriptionMatch[1]
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\{.*?\}/g, '') // Remove JSX expressions
        .trim()
    : `Learn about ${metadata.title.toLowerCase()} and how to use this feature in Firefly Grove.`

  // Extract key points (look for bullet-like structures)
  const keyPoints: string[] = []
  const keyPointMatches = content.matchAll(/<strong className="text-firefly-glow">(.*?)<\/strong>[\s\S]*?<br \/>\s*(.*?)(?=<\/p>)/g)

  for (const match of keyPointMatches) {
    const title = match[1].replace(/<[^>]*>/g, '').trim()
    const description = match[2].replace(/<[^>]*>/g, '').trim()
    keyPoints.push(`**${title}** - ${description}`)
  }

  // Extract privacy note if exists
  const privacyMatch = content.match(/<p className="text-sm text-text-muted italic[^>]*>\s*([\s\S]*?)\s*<\/p>/)
  const privacyNote = privacyMatch
    ? privacyMatch[1].replace(/<[^>]*>/g, '').trim()
    : undefined

  // Extract example if exists
  const exampleMatch = content.match(/<strong className="text-firefly-glow">Example:<\/strong>([\s\S]*?)(?=<\/p>|<\/div>)/)
  const exampleText = exampleMatch
    ? exampleMatch[1].replace(/<[^>]*>/g, '').trim()
    : undefined

  return {
    mainDescription,
    keyPoints: keyPoints.length > 0 ? keyPoints : [
      'Discover and use this feature effectively',
      'Enhance your memory preservation workflow',
      'Connect with your family story in meaningful ways'
    ],
    privacyNote,
    exampleText
  }
}

function generateMarkdown(
  metadata: GlowGuideMetadata,
  content: ExtractedContent
): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]

  return `---
slug: ${metadata.slug}
title: ${metadata.title}
subtitle: ${metadata.subtitle}
category: ${metadata.category}
tags: ${metadata.tags.join(', ')}
difficulty: ${metadata.difficulty}
timeToRead: ${metadata.timeToRead}
icon: ${metadata.icon}
featured: false
isNew: false
createdAt: ${now.toISOString()}
updatedAt: ${now.toISOString()}
---

# ${metadata.icon} ${metadata.title}

> ${metadata.subtitle}

**Category:** ${metadata.category}
**Time to Read:** ${metadata.timeToRead} minutes
**Difficulty:** ${metadata.difficulty}

---

## What is it?

${content.mainDescription}

---

## Why use it?

${content.keyPoints.map(point => `- ${point}`).join('\n')}

${content.privacyNote ? `\n> 🔒 **Privacy Note:** ${content.privacyNote}\n` : ''}

---

## How to access this feature

**Trigger:** ${metadata.trigger}

1. **${metadata.cta}**
   - ${metadata.ctaAction}

2. **Follow the guided flow**
   - The interface will walk you through the process
   - All options are explained as you go

3. **Save your changes**
   - Your settings are saved automatically
   - You can always come back and adjust

${content.exampleText ? `\n### Example\n\n${content.exampleText}\n` : ''}

---

## Tips & Best Practices

- 💡 Take your time - this feature is designed to be intuitive
- 💡 You can preview before committing to changes
- 💡 Settings can be updated anytime
- 💡 If you get stuck, look for the (?) help icons

---

## Related Features

${metadata.relatedArticles.map(slug => `- [${formatSlugToTitle(slug)}](/knowledge/${slug})`).join('\n')}

---

## Need Help?

**Have questions?** Search the Knowledge Bank or contact support.

**Found an issue?** [Report it](mailto:support@fireflygrove.app)

---

<small>
**Glow Guide:** This article is auto-generated from the ${metadata.id} Glow Guide component.
**Last Updated:** ${dateStr}
**Related Glow Guide:** Appears ${metadata.trigger.toLowerCase()}
</small>
`
}

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Run extraction
extractGlowGuides().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

/**
 * Seeds Knowledge Bank from markdown files
 * Loads articles into KnowledgeArticle database table
 *
 * Usage: tsx scripts/seed-knowledge-bank.ts
 */

import { PrismaClient, KnowledgeCategory, KnowledgeDifficulty } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import matter from 'gray-matter'

const prisma = new PrismaClient()

interface ArticleFrontmatter {
  slug: string
  title: string
  subtitle?: string
  category: string
  tags: string
  difficulty: string
  timeToRead: number
  icon: string
  featured: boolean
  isNew: boolean
  createdAt: string
  updatedAt: string
}

async function seedKnowledgeBank() {
  console.log('📚 Seeding Knowledge Bank...\n')

  const articlesDir = path.join(process.cwd(), 'knowledge/articles')

  if (!fs.existsSync(articlesDir)) {
    console.error(`❌ Directory not found: ${articlesDir}`)
    console.log('   Run "npm run extract-glow-guides" first!\n')
    process.exit(1)
  }

  // Find all markdown files
  const articleFiles = await glob(`${articlesDir}/**/*.md`)

  if (articleFiles.length === 0) {
    console.error('❌ No markdown files found in knowledge/articles/')
    process.exit(1)
  }

  console.log(`Found ${articleFiles.length} article(s)\n`)

  let createdCount = 0
  let updatedCount = 0
  let errorCount = 0

  for (const file of articleFiles) {
    try {
      console.log(`Processing: ${path.basename(file)}`)

      // Read and parse markdown with frontmatter
      const fileContent = fs.readFileSync(file, 'utf-8')
      const { data: frontmatter, content: markdown } = matter(fileContent)

      const fm = frontmatter as ArticleFrontmatter

      // Validate required fields
      if (!fm.slug || !fm.title || !fm.category) {
        console.log(`  ⚠️  Missing required fields - skipping\n`)
        errorCount++
        continue
      }

      // Parse tags (comma-separated string to array)
      const tags = fm.tags
        ? fm.tags.split(',').map((t: string) => t.trim())
        : []

      // Map category string to enum
      const category = fm.category as KnowledgeCategory
      if (!Object.values(KnowledgeCategory).includes(category)) {
        console.log(`  ⚠️  Invalid category: ${fm.category} - skipping\n`)
        errorCount++
        continue
      }

      // Map difficulty string to enum
      const difficulty = (fm.difficulty || 'BEGINNER') as KnowledgeDifficulty
      if (!Object.values(KnowledgeDifficulty).includes(difficulty)) {
        console.log(`  ⚠️  Invalid difficulty: ${fm.difficulty} - using BEGINNER\n`)
      }

      // Upsert article
      const article = await prisma.knowledgeArticle.upsert({
        where: { slug: fm.slug },
        update: {
          title: fm.title,
          subtitle: fm.subtitle || null,
          content: markdown,
          category,
          tags,
          timeToRead: fm.timeToRead || 3,
          difficulty,
          featured: fm.featured || false,
          isNew: fm.isNew || false,
          updatedAt: new Date(),
        },
        create: {
          slug: fm.slug,
          title: fm.title,
          subtitle: fm.subtitle || null,
          content: markdown,
          category,
          tags,
          timeToRead: fm.timeToRead || 3,
          difficulty,
          featured: fm.featured || false,
          isNew: fm.isNew || false,
          viewCount: 0,
          helpfulYes: 0,
          helpfulNo: 0,
        },
      })

      if (article.createdAt.getTime() === article.updatedAt.getTime()) {
        console.log(`  ✅ Created: ${article.title}`)
        createdCount++
      } else {
        console.log(`  🔄 Updated: ${article.title}`)
        updatedCount++
      }

      console.log(`     Slug: ${article.slug}`)
      console.log(`     Category: ${article.category}`)
      console.log(`     Tags: ${article.tags.join(', ')}\n`)

    } catch (error) {
      console.error(`  ❌ Error processing ${path.basename(file)}:`, error)
      console.log('')
      errorCount++
    }
  }

  console.log('─'.repeat(50))
  console.log(`\n✅ Knowledge Bank seeding complete!`)
  console.log(`   Created: ${createdCount}`)
  console.log(`   Updated: ${updatedCount}`)
  console.log(`   Errors: ${errorCount}`)
  console.log(`   Total: ${articleFiles.length}\n`)

  // Show summary of articles in database
  const totalArticles = await prisma.knowledgeArticle.count()
  const byCategory = await prisma.knowledgeArticle.groupBy({
    by: ['category'],
    _count: true,
  })

  console.log(`📊 Knowledge Bank Summary:`)
  console.log(`   Total Articles: ${totalArticles}`)
  console.log(`   By Category:`)
  byCategory.forEach(({ category, _count }) => {
    console.log(`     ${category}: ${_count}`)
  })
  console.log('')
}

// Run seeding
seedKnowledgeBank()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

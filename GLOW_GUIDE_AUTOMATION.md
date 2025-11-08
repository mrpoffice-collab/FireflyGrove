# Glow Guide Automation Systems

**Date:** 2025-11-08
**Purpose:** Automate Glow Guide creation, syncing, and maintenance

---

## 🎯 Two Automation Goals

### 1. **Glow Guides → Knowledge Bank Sync**
**Problem:** When users dismiss a Glow Guide, they can't access it again
**Solution:** Every Glow Guide automatically creates a Knowledge Bank article

### 2. **Feature/Product Changes → Glow Guide Reminder**
**Problem:** Developers forget to create Glow Guides when adding features
**Solution:** Git hook prompts developer when new features/products are added

---

## 🔄 System 1: Glow Guide → Knowledge Bank Sync

### Architecture

```
components/glow-guides/
├── HeirsGlowGuide.tsx
├── SharingGlowGuide.tsx
└── ...

↓ (Auto-generate on build)

knowledge/articles/
├── heirs-glow-guide.md
├── sharing-glow-guide.md
└── ...

↓ (Seed script loads)

Database (KnowledgeArticle)
├── Choosing Your Keepers
├── Inviting Family Members
└── ...

↓ (User accesses)

/knowledge UI
└── Search & Browse
```

### Implementation Steps

#### Step 1: Add Metadata to Glow Guide Components

Every Glow Guide component gets a metadata export:

```typescript
// components/glow-guides/HeirsGlowGuide.tsx

export const glowGuideMetadata = {
  id: 'heirs',
  slug: 'choosing-your-keepers',
  title: 'Choosing Your Keepers',
  category: 'LEGACY',
  tags: ['heirs', 'legacy', 'keepers', 'inheritance'],
  relatedArticles: ['legacy-release-conditions', 'multiple-heirs'],
}

export default function HeirsGlowGuide({ onClose, onAction }: GlowGuideProps) {
  // Component code...
}
```

#### Step 2: Build Extraction Script

**File:** `scripts/extract-glow-guides.ts`

```typescript
/**
 * Extracts Glow Guide content and metadata
 * Generates Knowledge Bank markdown files
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

interface GlowGuideMetadata {
  id: string
  slug: string
  title: string
  category: string
  tags: string[]
  relatedArticles: string[]
}

async function extractGlowGuides() {
  // Find all Glow Guide components
  const glowGuideFiles = await glob('components/glow-guides/**/*GlowGuide.tsx')

  for (const file of glowGuideFiles) {
    console.log(`Processing: ${file}`)

    // Read file content
    const content = fs.readFileSync(file, 'utf-8')

    // Extract metadata export
    const metadataMatch = content.match(/export const glowGuideMetadata = ({[\s\S]*?})/)
    if (!metadataMatch) {
      console.warn(`No metadata found in ${file}`)
      continue
    }

    // Parse metadata (eval is safe here - we control the files)
    const metadata: GlowGuideMetadata = eval(`(${metadataMatch[1]})`)

    // Extract content sections from JSX
    const contentSections = extractContentFromJSX(content)

    // Generate markdown
    const markdown = generateMarkdown(metadata, contentSections)

    // Write to knowledge/articles/
    const outputPath = path.join('knowledge/articles', `${metadata.slug}.md`)
    fs.writeFileSync(outputPath, markdown)
    console.log(`✓ Generated: ${outputPath}`)
  }
}

function extractContentFromJSX(content: string): {
  title: string
  icon: string
  description: string
  keyPoints: string[]
  cta: string
} {
  // Parse JSX to extract visible content
  // This is complex - might use regex or JSX parser

  const titleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/)
  const iconMatch = content.match(/<div[^>]*text-6xl[^>]*>(.*?)<\/div>/)

  return {
    title: titleMatch?.[1] || '',
    icon: iconMatch?.[1] || '',
    description: extractDescription(content),
    keyPoints: extractKeyPoints(content),
    cta: extractCTA(content),
  }
}

function generateMarkdown(
  metadata: GlowGuideMetadata,
  content: any
): string {
  return `# ${metadata.title}

**Category:** ${metadata.category}
**Tags:** ${metadata.tags.join(', ')}
**Related:** ${metadata.relatedArticles.join(', ')}

---

## ${content.icon} What is it?

${content.description}

---

## Why use it?

${content.keyPoints.map((point: string) => `- ${point}`).join('\n')}

---

## How to access this feature

1. ${content.cta}
2. [Step by step instructions...]

---

## Related Features

${metadata.relatedArticles.map((slug: string) => `- [${slug}](/knowledge/${slug})`).join('\n')}

---

**This guide is auto-generated from the Glow Guide component.**
**Last updated:** ${new Date().toISOString()}
`
}

extractGlowGuides().catch(console.error)
```

#### Step 3: Add to Build Process

**package.json:**
```json
{
  "scripts": {
    "build": "npm run extract-glow-guides && next build",
    "extract-glow-guides": "tsx scripts/extract-glow-guides.ts"
  }
}
```

#### Step 4: Seed Database

**File:** `prisma/seed-knowledge-bank.ts`

```typescript
/**
 * Seeds Knowledge Bank from markdown files
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import matter from 'gray-matter'

const prisma = new PrismaClient()

async function seedKnowledgeBank() {
  const articleFiles = await glob('knowledge/articles/**/*.md')

  for (const file of articleFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const { data: frontmatter, content: markdown } = matter(content)

    await prisma.knowledgeArticle.upsert({
      where: { slug: frontmatter.slug },
      update: {
        title: frontmatter.title,
        content: markdown,
        category: frontmatter.category,
        tags: frontmatter.tags,
        updatedAt: new Date(),
      },
      create: {
        slug: frontmatter.slug,
        title: frontmatter.title,
        content: markdown,
        category: frontmatter.category,
        tags: frontmatter.tags || [],
        timeToRead: frontmatter.timeToRead || 3,
        difficulty: frontmatter.difficulty || 'BEGINNER',
      },
    })

    console.log(`✓ Seeded: ${frontmatter.title}`)
  }
}

seedKnowledgeBank()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## 🔔 System 2: Feature Changes → Glow Guide Reminder

### Architecture

```
Developer adds feature
↓
Git commit
↓
Pre-commit hook runs
↓
Detects new files/routes
↓
Prompts: "Does this need a Glow Guide?"
↓
If YES: Creates GitHub Issue
```

### Implementation

#### Step 1: Pre-commit Hook

**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run Glow Guide check
node scripts/check-glow-guide-needed.js
```

#### Step 2: Detection Script

**File:** `scripts/check-glow-guide-needed.js`

```javascript
/**
 * Checks if staged changes might need a Glow Guide
 */

const { execSync } = require('child_process')
const readline = require('readline')

// Get staged files
const stagedFiles = execSync('git diff --cached --name-only')
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

// Patterns that suggest new features/products
const featurePatterns = [
  /^app\/.*\/page\.tsx$/, // New pages
  /^components\/[A-Z].*\.tsx$/, // New major components
  /^app\/api\/.*\/route\.ts$/, // New API endpoints
]

// Check if any staged file matches patterns
const potentialFeatures = stagedFiles.filter(file =>
  featurePatterns.some(pattern => pattern.test(file))
)

if (potentialFeatures.length === 0) {
  process.exit(0) // No feature files, continue commit
}

// Prompt developer
console.log('\n🌟 Detected potential new features:')
potentialFeatures.forEach(file => console.log(`  - ${file}`))
console.log('\n')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Does this change need a Glow Guide? (y/N): ', answer => {
  rl.close()

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n✅ Please create a GitHub Issue with label "glow-guide-needed"')
    console.log('   Template: https://github.com/[repo]/issues/new?template=glow-guide.md\n')

    // Optionally: Auto-create GitHub issue via API
    // createGitHubIssue(potentialFeatures)
  }

  process.exit(0)
})

// Set timeout to not block commit
setTimeout(() => {
  console.log('\n⏱️  Timeout - continuing commit')
  rl.close()
  process.exit(0)
}, 10000) // 10 second timeout
```

#### Step 3: GitHub Issue Template

**File:** `.github/ISSUE_TEMPLATE/glow-guide.md`

```markdown
---
name: Glow Guide Needed
about: Create a new Glow Guide for a feature or product
title: '[Glow Guide] '
labels: glow-guide-needed, enhancement
assignees: ''
---

## Feature/Product

**Name:**
**Location:** (e.g., /cards, /soundart, AudioSparks component)
**Type:** [ ] New Feature [ ] New Product [ ] Changed Feature

## Glow Guide Details

**Suggested Title:**
**Category:** (e.g., Core Feature, Product, Collaboration, Legacy)
**Priority:** [ ] Critical [ ] High [ ] Medium [ ] Low

## User Journey

**When should this Glow Guide appear?**
- [ ] First time visiting page
- [ ] After X actions
- [ ] Never used feature after Y days
- [ ] Other: ___________

**What confusion does it prevent?**


**What should the CTA do?**


## Content Outline

**Icon:** (emoji)
**Main Message:**
**Key Points:**
-
-
-

**Related Features:**
-

---

**Files Changed:** [Auto-populated by script]
```

---

## 📊 Tracking & Monitoring

### Dashboard Metrics

Track in `/admin/glow-guides` dashboard:

1. **Coverage:**
   - Total features: 50
   - Features with Glow Guides: 37
   - Coverage: 74%

2. **Effectiveness:**
   - Guides shown: 1,250
   - CTAs clicked: 890 (71%)
   - Dismissed: 360 (29%)

3. **Knowledge Bank Access:**
   - Direct searches: 450
   - From dismissed guide: 120
   - Recovery rate: 33%

4. **Needed Guides:**
   - Open issues: 5
   - In progress: 2
   - Prioritized queue

---

## 🚀 Rollout Plan

### Week 1: Build Systems
- [ ] Add metadata to existing 6 Glow Guides
- [ ] Build extraction script
- [ ] Test markdown generation
- [ ] Add to build process

### Week 2: Seed Knowledge Bank
- [ ] Run migration for Knowledge Bank schema
- [ ] Create seed script
- [ ] Generate initial articles
- [ ] Test article display

### Week 3: Build Detection
- [ ] Create pre-commit hook
- [ ] Build detection script
- [ ] Create GitHub issue template
- [ ] Test on dummy commits

### Week 4: Monitor & Iterate
- [ ] Track metrics
- [ ] Gather feedback
- [ ] Refine prompts
- [ ] Update documentation

---

**Benefits:**
- ✅ Zero manual work to sync Glow Guides → Knowledge Bank
- ✅ Developers reminded to create guides
- ✅ Users can always recover dismissed guidance
- ✅ Comprehensive feature coverage

**Next:** Implement extraction script and test with existing guides

#!/usr/bin/env node

/**
 * Checks if staged changes might need a Glow Guide
 * Runs as a pre-commit hook
 *
 * Detects:
 * - New pages (new features/products)
 * - New major components
 * - New API routes
 * - Changes to existing features
 */

const { execSync } = require('child_process')
const readline = require('readline')

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset)
}

// Get staged files
let stagedFiles = []
try {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
  stagedFiles = output.trim().split('\n').filter(Boolean)
} catch (error) {
  // No staged files or git error - continue silently
  process.exit(0)
}

if (stagedFiles.length === 0) {
  process.exit(0)
}

// Patterns that suggest new features/products
const featurePatterns = [
  {
    pattern: /^app\/(?!api|_).+\/page\.tsx$/,
    type: 'New Page',
    description: 'New user-facing page/feature'
  },
  {
    pattern: /^app\/api\/.+\/route\.ts$/,
    type: 'New API Route',
    description: 'New backend endpoint'
  },
  {
    pattern: /^components\/[A-Z][a-zA-Z]+\.tsx$/,
    type: 'New Component',
    description: 'New major component (capitalized)'
  },
  {
    pattern: /^components\/(cards|soundart|nest|sparks|treasure|compass|forever-kit)\/.+\.tsx$/,
    type: 'Product Component',
    description: 'Product-related component'
  },
]

// Check if any staged file matches patterns
const detectedFeatures = []

for (const file of stagedFiles) {
  for (const { pattern, type, description } of featurePatterns) {
    if (pattern.test(file)) {
      detectedFeatures.push({ file, type, description })
      break // Only count once per file
    }
  }
}

// If no feature files detected, continue commit
if (detectedFeatures.length === 0) {
  process.exit(0)
}

// Show detected features
log('\n' + '='.repeat(60), 'bright')
log('  ✨ GLOW GUIDE CHECK', 'bright')
log('='.repeat(60), 'bright')

log('\n📦 Detected potential new features:', 'cyan')
detectedFeatures.forEach(({ file, type, description }) => {
  log(`   ${type}:`, 'yellow')
  log(`     ${file}`, 'reset')
  log(`     → ${description}`, 'reset')
})

log('\n💡 These changes might need a Glow Guide to help users discover them.', 'bright')
log('   Glow Guides = Welcome modals that appear at the right moment\n', 'reset')

// Interactive prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

log('❓ Does this change need a Glow Guide?', 'bright')
log('   [Y] Yes, create GitHub issue reminder', 'green')
log('   [N] No, these changes don\'t need guidance (default)', 'reset')
log('   [?] What\'s a Glow Guide?\n', 'cyan')

const askQuestion = () => {
  rl.question(colors.bright + 'Your choice [y/N/?]: ' + colors.reset, (answer) => {
    const choice = answer.toLowerCase().trim()

    if (choice === '?') {
      // Show help
      log('\n📚 What is a Glow Guide?', 'cyan')
      log('   Glow Guides are contextual welcome modals that:', 'reset')
      log('   • Appear at the perfect moment (e.g., first time using a feature)', 'reset')
      log('   • Guide users through new functionality', 'reset')
      log('   • Prevent confusion and increase discovery', 'reset')
      log('   • Auto-generate Knowledge Bank articles', 'reset')
      log('\n   Examples:', 'bright')
      log('   - Trees vs Branches explanation (empty grove)', 'reset')
      log('   - Heir setup prompt (after 3 memories created)', 'reset')
      log('   - Audio recording guide (text-only users)', 'reset')
      log('\n   See: GLOW_GUIDES_AUDIT.md for full list\n', 'reset')
      askQuestion() // Ask again
      return
    }

    if (choice === 'y' || choice === 'yes') {
      // User confirmed - remind them
      log('\n' + '='.repeat(60), 'green')
      log('  ✅ REMINDER: CREATE GLOW GUIDE', 'green')
      log('='.repeat(60), 'green')
      log('\n📝 Next steps:', 'bright')
      log('   1. Create GitHub issue with label "glow-guide-needed"', 'reset')
      log('   2. Use template: .github/ISSUE_TEMPLATE/glow-guide.md', 'reset')
      log('   3. Or run: gh issue create --label glow-guide-needed\n', 'reset')

      log('📋 Quick checklist:', 'bright')
      log('   □ What feature/product is this for?', 'reset')
      log('   □ When should the guide appear? (trigger condition)', 'reset')
      log('   □ What confusion does it prevent?', 'reset')
      log('   □ What action should the CTA take?\n', 'reset')

      log('📖 Reference: See GLOW_GUIDES_AUDIT.md for examples\n', 'cyan')
    } else {
      // Default: No guide needed
      log('\n✓ Continuing commit without Glow Guide\n', 'reset')
    }

    rl.close()
    process.exit(0)
  })
}

askQuestion()

// Timeout to prevent hanging
setTimeout(() => {
  log('\n⏱️  Timeout - continuing commit\n', 'yellow')
  rl.close()
  process.exit(0)
}, 30000) // 30 second timeout

const fs = require('fs')
const path = require('path')

const glowGuidesDir = path.join(__dirname, '../components/glow-guides')
const files = fs.readdirSync(glowGuidesDir).filter(f => f.endsWith('.tsx'))

console.log(`Found ${files.length} Glow Guide files\n`)

let updatedCount = 0

files.forEach(file => {
  const filePath = path.join(glowGuidesDir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  let updated = false

  // Fix 1: Container - max-w-lg to max-w-md, add responsive padding and scrolling
  const oldContainer = /className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn"/g
  if (oldContainer.test(content)) {
    content = content.replace(
      oldContainer,
      'className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto"'
    )
    updated = true
  }

  // Fix 2: Icon section - reduce text sizes and margins
  const oldIconSection = /(<div className="text-center mb-6">[\s\S]*?)<div className="inline-block text-6xl mb-4 animate-pulse">/
  if (oldIconSection.test(content)) {
    content = content.replace(
      /className="text-center mb-6"/g,
      'className="text-center mb-4"'
    )
    content = content.replace(
      /className="inline-block text-6xl mb-4 animate-pulse"/g,
      'className="inline-block text-4xl sm:text-5xl mb-3 animate-pulse"'
    )
    updated = true
  }

  // Fix 3: Main heading - reduce from text-3xl to text-xl sm:text-2xl
  content = content.replace(
    /className="text-3xl font-light text-firefly-glow mb-2"/g,
    'className="text-xl sm:text-2xl font-light text-firefly-glow mb-1"'
  )

  // Fix 4: Subtitle under heading
  content = content.replace(
    /className="text-text-muted text-sm">/g,
    'className="text-text-muted text-xs sm:text-sm">'
  )

  // Fix 5: Celebration/highlight boxes - reduce padding and margins
  content = content.replace(
    /className="bg-bg-dark\/50 rounded-lg p-4 mb-6 border border-firefly-dim\/30"/g,
    'className="bg-bg-dark/50 rounded-lg p-3 mb-4 border border-firefly-dim/30"'
  )

  // Fix 6: Description sections - reduce spacing
  content = content.replace(
    /className="space-y-4 mb-8 text-text-soft"/g,
    'className="space-y-3 mb-6 text-text-soft"'
  )

  // Fix 7: Feature list boxes - reduce padding and spacing
  content = content.replace(
    /className="bg-bg-dark\/50 rounded-lg p-4 space-y-3"/g,
    'className="bg-bg-dark/50 rounded-lg p-3 space-y-2"'
  )

  // Fix 8: Feature list items - reduce gaps and icon sizes
  content = content.replace(
    /className="flex items-start gap-3"/g,
    'className="flex items-start gap-2"'
  )
  content = content.replace(
    /<span className="text-xl">/g,
    '<span className="text-lg">'
  )

  // Fix 9: Feature descriptions - make text responsive
  content = content.replace(
    /<p className="text-sm leading-relaxed">/g,
    '<p className="text-xs sm:text-sm leading-relaxed">'
  )

  // Fix 10: Paragraphs - make smaller on mobile
  content = content.replace(
    /<p className="leading-relaxed">/g,
    '<p className="text-sm leading-relaxed">'
  )

  // Fix 11: Small italic text
  content = content.replace(
    /className="text-sm text-text-muted italic text-center"/g,
    'className="text-xs text-text-muted italic text-center"'
  )

  // Fix 12: CTA section - reduce gaps
  content = content.replace(
    /className="flex flex-col gap-3">/g,
    'className="flex flex-col gap-2">'
  )

  // Fix 13: Main CTA button - reduce size
  content = content.replace(
    /className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow\/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"/g,
    'className="w-full py-2.5 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-sm sm:text-base"'
  )

  // Fix 14: Maybe later button
  content = content.replace(
    /className="text-text-muted hover:text-text-soft text-sm transition-soft"/g,
    'className="text-text-muted hover:text-text-soft text-xs sm:text-sm transition-soft"'
  )

  // Fix 15: Knowledge Bank link section - reduce margin
  content = content.replace(
    /className="mt-6 pt-4 border-t border-firefly-dim\/20 text-center"/g,
    'className="mt-4 pt-3 border-t border-firefly-dim/20 text-center"'
  )

  // Fix 16: Knowledge Bank link - make responsive
  content = content.replace(
    /className="text-sm text-firefly-glow\/70 hover:text-firefly-glow transition-soft"/g,
    'className="text-xs sm:text-sm text-firefly-glow/70 hover:text-firefly-glow transition-soft"'
  )

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✅ Updated: ${file}`)
    updatedCount++
  } else {
    console.log(`⏭️  Skipped: ${file} (no changes needed)`)
  }
})

console.log(`\n📊 Summary: Updated ${updatedCount}/${files.length} files`)

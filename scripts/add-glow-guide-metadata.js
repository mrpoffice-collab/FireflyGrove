/**
 * Adds metadata to remaining Glow Guide components
 */

const fs = require('fs')
const path = require('path')

const metadataToAdd = {
  'VoiceMemoriesGlowGuide.tsx': `/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'voice-memories',
  slug: 'recording-voice-memories',
  title: 'Recording Voice Memories',
  subtitle: 'Capture Your Voice',
  icon: '🎙️',
  category: 'VOICE_AUDIO',
  tags: ['voice', 'audio', 'recording', 'stories', 'memories'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['audio-sparks', 'audio-quality-tips', 'speech-to-text'],
  trigger: 'User has 10+ text memories but 0 audio memories',
  cta: 'Record a Memory',
  ctaAction: 'Opens new memory modal with audio tab',
}

`,
  'PhotoMemoriesGlowGuide.tsx': `/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'photo-memories',
  slug: 'adding-photos-to-memories',
  title: 'Adding Photos to Memories',
  subtitle: 'A Picture Holds a Thousand Stories',
  icon: '📸',
  category: 'PHOTOS_MEDIA',
  tags: ['photos', 'images', 'visual', 'media', 'nest'],
  difficulty: 'BEGINNER',
  timeToRead: 2,
  relatedArticles: ['the-nest-bulk-uploads', 'hatching-photos', 'photo-organization'],
  trigger: 'User has 10+ text memories but 0 photos',
  cta: 'Add a Photo',
  ctaAction: 'Opens new memory modal with photo upload',
}

`,
  'NestGlowGuide.tsx': `/**
 * Glow Guide Metadata
 */
export const glowGuideMetadata = {
  id: 'nest',
  slug: 'the-nest-bulk-photo-uploads',
  title: 'The Nest: Bulk Photo Uploads',
  subtitle: 'Organize Before You Hatch',
  icon: '🪺',
  category: 'PHOTOS_MEDIA',
  tags: ['nest', 'photos', 'bulk-upload', 'organization', 'workflow'],
  difficulty: 'BEGINNER',
  timeToRead: 3,
  relatedArticles: ['hatching-photos', 'photo-memories', 'organizing-photos'],
  trigger: 'User visits /nest for first time',
  cta: 'Upload Photos',
  ctaAction: 'Triggers file picker or focuses upload area',
}

`
}

const componentsDir = path.join(__dirname, '../components/glow-guides')

for (const [filename, metadata] of Object.entries(metadataToAdd)) {
  const filePath = path.join(componentsDir, filename)

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`)
    continue
  }

  let content = fs.readFileSync(filePath, 'utf-8')

  // Check if metadata already exists
  if (content.includes('glowGuideMetadata')) {
    console.log(`✓ ${filename} already has metadata`)
    continue
  }

  // Insert metadata after 'use client' directive
  content = content.replace(
    /'use client'\n/,
    `'use client'\n\n${metadata}`
  )

  fs.writeFileSync(filePath, content)
  console.log(`✓ Added metadata to ${filename}`)
}

console.log('\n✅ Metadata addition complete!')

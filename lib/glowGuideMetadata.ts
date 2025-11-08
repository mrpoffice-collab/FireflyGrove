/**
 * Glow Guide Metadata Mappings
 * Maps guide names to their Knowledge Bank slugs and titles
 */

import { GlowGuideName } from './glowGuideManager'

interface GuideMetadata {
  slug: string
  title: string
}

export const glowGuideMetadata: Record<GlowGuideName, GuideMetadata> = {
  // Original 6
  'trees-branches': {
    slug: 'understanding-trees-and-branches',
    title: 'Understanding Trees and Branches',
  },
  'heirs': {
    slug: 'choosing-your-keepers',
    title: 'Choosing Your Keepers',
  },
  'sharing': {
    slug: 'inviting-family-members',
    title: 'Inviting Family Members',
  },
  'voice-memories': {
    slug: 'recording-voice-memories',
    title: 'Recording Voice Memories',
  },
  'photo-memories': {
    slug: 'adding-photos-to-memories',
    title: 'Adding Photos to Memories',
  },
  'nest': {
    slug: 'the-nest-bulk-photo-uploads',
    title: 'The Nest: Bulk Photo Uploads',
  },
  // Core Memory Features
  'audio-sparks': {
    slug: 'audio-sparks-quick-capture',
    title: 'Audio Sparks: Quick Voice Capture',
  },
  'firefly-bursts': {
    slug: 'firefly-bursts-memory-rediscovery',
    title: 'Firefly Bursts: Rediscover Your Memories',
  },
  'memory-threading': {
    slug: 'memory-threading-replies',
    title: 'Memory Threading: Join the Conversation',
  },
  'story-sparks': {
    slug: 'story-sparks-writing-prompts',
    title: 'Story Sparks: Writing Prompts',
  },
  'glowing-memories': {
    slug: 'glowing-memories-reactions',
    title: 'Glowing Memories: React to Stories',
  },
  'memory-editing': {
    slug: 'memory-editing-enhancement',
    title: 'Memory Editing: Enrich Your Stories',
  },
  'memory-visibility': {
    slug: 'memory-visibility-privacy',
    title: 'Memory Visibility: Private vs Shared',
  },
  'memory-scheduling': {
    slug: 'memory-scheduling-future-release',
    title: 'Memory Scheduling: Time-Released Stories',
  },
  // Products
  'greeting-cards': {
    slug: 'greeting-cards-memory-sharing',
    title: 'Greeting Cards: Share Memories Beautifully',
  },
  'soundart': {
    slug: 'soundart-audio-wave-art',
    title: 'SoundArt: Turn Voice into Visual Beauty',
  },
  'forever-kit': {
    slug: 'forever-kit-export-backup',
    title: 'Forever Kit: Own Your Memories',
  },
  'memory-book': {
    slug: 'memory-book-pdf-compilation',
    title: 'Memory Book: Beautiful Printed Stories',
  },
  'spark-collections': {
    slug: 'spark-collections-prompt-organization',
    title: 'Spark Collections: Organize Your Journey',
  },
  'treasure-milestones': {
    slug: 'treasure-chest-milestones',
    title: 'Treasure Chest Milestones: Celebrate Your Journey',
  },
  'compass': {
    slug: 'compass-intention-setting',
    title: 'Compass: Set Your Memory Intentions',
  },
  // Organization
  'multiple-trees': {
    slug: 'multiple-trees-organization',
    title: 'Multiple Trees: Organize by Life',
  },
  'branches-organization': {
    slug: 'branches-organization-strategies',
    title: 'Branch Organization: Structure Your Stories',
  },
  'moving-memories': {
    slug: 'moving-memories-reorganization',
    title: 'Moving Memories: Reorganize as You Grow',
  },
  'transplanting-trees': {
    slug: 'transplanting-trees-grove-transfer',
    title: 'Transplanting Trees: Move Between Groves',
  },
  'rooting-trees': {
    slug: 'rooting-trees-family-connections',
    title: 'Rooting Trees: Connect Family Heritage',
  },
  'open-grove': {
    slug: 'open-grove-public-memorials',
    title: 'Open Grove: Public Memorial Space',
  },
  // Collaboration/Sharing
  'co-authoring': {
    slug: 'co-authoring-joint-memories',
    title: 'Co-Authoring: Write Memories Together',
  },
  'approval-workflow': {
    slug: 'approval-workflow-review-contributions',
    title: 'Approval Workflow: Curate Your Tree',
  },
  'branch-permissions': {
    slug: 'branch-permissions-access-control',
    title: 'Branch Permissions: Fine-Tune Access',
  },
  'member-removal': {
    slug: 'member-removal-managing-collaborators',
    title: 'Member Removal: Manage Your Circle',
  },
  'shareable-links': {
    slug: 'shareable-links-quick-access',
    title: 'Shareable Links: One-Time Access',
  },
  // Legacy
  'heir-conditions': {
    slug: 'heir-conditions-release-timing',
    title: 'Heir Conditions: When They Receive Access',
  },
  'multiple-heirs': {
    slug: 'multiple-heirs-redundancy-planning',
    title: 'Multiple Heirs: Redundancy & Fairness',
  },
  'moderator-role': {
    slug: 'moderator-role-trustee',
    title: 'Moderator Role: Your Trusted Helper',
  },
  'legacy-transfer': {
    slug: 'legacy-transfer-immediate-handoff',
    title: 'Legacy Transfer: Immediate Handoff',
  },
  // Account & Settings
  'subscription-tiers': {
    slug: 'subscription-tiers-plans',
    title: 'Subscription Tiers: Choose Your Plan',
  },
  'storage-limits': {
    slug: 'storage-limits-management',
    title: 'Storage Limits: Manage Your Space',
  },
  'import-features': {
    slug: 'import-features-migration',
    title: 'Import Features: Bring Your Existing Memories',
  },
  'privacy-settings': {
    slug: 'privacy-settings-account-control',
    title: 'Privacy Settings: Your Data, Your Rules',
  },
  // Mobile
  'mobile-app': {
    slug: 'mobile-app-download',
    title: 'Mobile App: Memory Preservation On-the-Go',
  },
  'mobile-photo-upload': {
    slug: 'mobile-photo-upload-camera-integration',
    title: 'Mobile Photo Upload: Capture the Moment',
  },
  'voice-capture-mobile': {
    slug: 'voice-capture-mobile-convenience',
    title: 'Voice Capture on Mobile: Your Best Tool',
  },
}

export function getGuideMetadata(guideName: GlowGuideName): GuideMetadata {
  return glowGuideMetadata[guideName]
}

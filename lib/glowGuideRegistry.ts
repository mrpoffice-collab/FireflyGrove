/**
 * Central registry for all Glow Guides
 * Maps knowledge article slugs to their Glow Guide components
 */

import { ComponentType } from 'react'

// Import all Glow Guide components
import AudioSparksGlowGuide from '@/components/glow-guides/AudioSparksGlowGuide'
import NestGlowGuide from '@/components/glow-guides/NestGlowGuide'
import FireflyBurstsGlowGuide from '@/components/glow-guides/FireflyBurstsGlowGuide'
import MemoryThreadingGlowGuide from '@/components/glow-guides/MemoryThreadingGlowGuide'
import StorySparksGlowGuide from '@/components/glow-guides/StorySparksGlowGuide'
import GlowingMemoriesGlowGuide from '@/components/glow-guides/GlowingMemoriesGlowGuide'
import MemoryEditingGlowGuide from '@/components/glow-guides/MemoryEditingGlowGuide'
import MemoryVisibilityGlowGuide from '@/components/glow-guides/MemoryVisibilityGlowGuide'
import MemorySchedulingGlowGuide from '@/components/glow-guides/MemorySchedulingGlowGuide'
import TreesVsBranchesGlowGuide from '@/components/glow-guides/TreesVsBranchesGlowGuide'
import HeirsGlowGuide from '@/components/glow-guides/HeirsGlowGuide'
import SharingGlowGuide from '@/components/glow-guides/SharingGlowGuide'
import VoiceMemoriesGlowGuide from '@/components/glow-guides/VoiceMemoriesGlowGuide'
import PhotoMemoriesGlowGuide from '@/components/glow-guides/PhotoMemoriesGlowGuide'
import GreetingCardsGlowGuide from '@/components/glow-guides/GreetingCardsGlowGuide'
import SoundArtGlowGuide from '@/components/glow-guides/SoundArtGlowGuide'
import ForeverKitGlowGuide from '@/components/glow-guides/ForeverKitGlowGuide'
import MemoryBookGlowGuide from '@/components/glow-guides/MemoryBookGlowGuide'
import SparkCollectionsGlowGuide from '@/components/glow-guides/SparkCollectionsGlowGuide'
import TreasureChestMilestoneGlowGuide from '@/components/glow-guides/TreasureChestMilestoneGlowGuide'
import CompassGlowGuide from '@/components/glow-guides/CompassGlowGuide'
import MultipleTreesGlowGuide from '@/components/glow-guides/MultipleTreesGlowGuide'
import BranchesOrganizationGlowGuide from '@/components/glow-guides/BranchesOrganizationGlowGuide'
import MovingMemoriesGlowGuide from '@/components/glow-guides/MovingMemoriesGlowGuide'
import TransplantingTreesGlowGuide from '@/components/glow-guides/TransplantingTreesGlowGuide'
import RootingTreesGlowGuide from '@/components/glow-guides/RootingTreesGlowGuide'
import OpenGroveGlowGuide from '@/components/glow-guides/OpenGroveGlowGuide'
import CoAuthoringGlowGuide from '@/components/glow-guides/CoAuthoringGlowGuide'
import ApprovalWorkflowGlowGuide from '@/components/glow-guides/ApprovalWorkflowGlowGuide'
import BranchPermissionsGlowGuide from '@/components/glow-guides/BranchPermissionsGlowGuide'
import MemberRemovalGlowGuide from '@/components/glow-guides/MemberRemovalGlowGuide'
import ShareableLinksGlowGuide from '@/components/glow-guides/ShareableLinksGlowGuide'
import HeirConditionsGlowGuide from '@/components/glow-guides/HeirConditionsGlowGuide'
import MultipleHeirsGlowGuide from '@/components/glow-guides/MultipleHeirsGlowGuide'
import ModeratorRoleGlowGuide from '@/components/glow-guides/ModeratorRoleGlowGuide'
import LegacyTransferGlowGuide from '@/components/glow-guides/LegacyTransferGlowGuide'
import SubscriptionTiersGlowGuide from '@/components/glow-guides/SubscriptionTiersGlowGuide'
import StorageLimitsGlowGuide from '@/components/glow-guides/StorageLimitsGlowGuide'
import ImportFeaturesGlowGuide from '@/components/glow-guides/ImportFeaturesGlowGuide'
import PrivacySettingsGlowGuide from '@/components/glow-guides/PrivacySettingsGlowGuide'
import MobileAppGlowGuide from '@/components/glow-guides/MobileAppGlowGuide'
import MobilePhotoUploadGlowGuide from '@/components/glow-guides/MobilePhotoUploadGlowGuide'
import VoiceCaptureMobileGlowGuide from '@/components/glow-guides/VoiceCaptureMobileGlowGuide'

export interface GlowGuideComponent {
  component: ComponentType<{ onClose: () => void; onAction?: () => void }>
  slug: string
}

/**
 * Maps knowledge article slugs to their corresponding Glow Guide components
 */
export const glowGuideRegistry: Record<string, ComponentType<{ onClose: () => void; onAction?: () => void }>> = {
  // Core Features
  'audio-sparks-quick-capture': AudioSparksGlowGuide,
  'firefly-bursts-rediscover-memories': FireflyBurstsGlowGuide,
  'memory-threading-replies': MemoryThreadingGlowGuide,
  'story-sparks-writing-prompts': StorySparksGlowGuide,
  'glowing-memories-reactions': GlowingMemoriesGlowGuide,
  'memory-editing-enhancement': MemoryEditingGlowGuide,
  'memory-visibility-privacy': MemoryVisibilityGlowGuide,
  'memory-scheduling-future-release': MemorySchedulingGlowGuide,
  'understanding-trees-and-branches': TreesVsBranchesGlowGuide,
  'recording-voice-memories': VoiceMemoriesGlowGuide,
  'adding-photos-to-memories': PhotoMemoriesGlowGuide,

  // Getting Started
  'choosing-keepers-heirs': HeirsGlowGuide,
  'inviting-family-members': SharingGlowGuide,

  // Products
  'greeting-cards-memory-sharing': GreetingCardsGlowGuide,
  'soundart-audio-wave-art': SoundArtGlowGuide,
  'forever-kit-export-backup': ForeverKitGlowGuide,
  'memory-book-pdf-compilation': MemoryBookGlowGuide,
  'spark-collections-organize-prompts': SparkCollectionsGlowGuide,
  'treasure-chest-milestones': TreasureChestMilestoneGlowGuide,
  'compass-memory-intentions': CompassGlowGuide,

  // Organization
  'multiple-trees-organization': MultipleTreesGlowGuide,
  'branches-organization-structure': BranchesOrganizationGlowGuide,
  'moving-memories-reorganize': MovingMemoriesGlowGuide,
  'transplanting-trees-grove-transfer': TransplantingTreesGlowGuide,
  'rooting-trees-family-connections': RootingTreesGlowGuide,
  'open-grove-public-memorials': OpenGroveGlowGuide,

  // Collaboration
  'co-authoring-joint-memories': CoAuthoringGlowGuide,
  'approval-workflow-review-contributions': ApprovalWorkflowGlowGuide,
  'branch-permissions-access-control': BranchPermissionsGlowGuide,
  'member-removal-managing-collaborators': MemberRemovalGlowGuide,
  'shareable-links-quick-access': ShareableLinksGlowGuide,

  // Legacy
  'heir-conditions-release-timing': HeirConditionsGlowGuide,
  'multiple-heirs-redundancy-planning': MultipleHeirsGlowGuide,
  'moderator-role-trustee': ModeratorRoleGlowGuide,
  'legacy-transfer-immediate-handoff': LegacyTransferGlowGuide,

  // Account & Settings
  'subscription-tiers-plans': SubscriptionTiersGlowGuide,
  'storage-limits-management': StorageLimitsGlowGuide,
  'import-features-migration': ImportFeaturesGlowGuide,
  'privacy-settings-account-control': PrivacySettingsGlowGuide,

  // Mobile
  'mobile-app-download': MobileAppGlowGuide,
  'mobile-photo-upload-camera-integration': MobilePhotoUploadGlowGuide,
  'voice-capture-mobile-convenience': VoiceCaptureMobileGlowGuide,

  // Memorial Video Maker - use a placeholder for now since it doesn't have a Glow Guide yet
  'memorial-video-maker': MemoryBookGlowGuide, // Using Memory Book as placeholder
}

/**
 * Get Glow Guide component for a given slug
 */
export function getGlowGuide(slug: string): ComponentType<{ onClose: () => void; onAction?: () => void }> | null {
  return glowGuideRegistry[slug] || null
}

/**
 * Check if a slug has a Glow Guide
 */
export function hasGlowGuide(slug: string): boolean {
  return slug in glowGuideRegistry
}

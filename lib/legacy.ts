import { prisma } from './prisma'
import { createLegacyArchive } from './export'
import { isDemoMode } from './demo'
import crypto from 'crypto'

export async function addHeir(
  branchId: string,
  ownerId: string,
  heirEmail: string,
  releaseCondition: 'AFTER_DEATH' | 'AFTER_DATE' | 'MANUAL',
  releaseDate?: Date
) {
  // Verify ownership
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      ownerId: ownerId,
    },
  })

  if (!branch) {
    throw new Error('Branch not found or access denied')
  }

  const heir = await prisma.heir.create({
    data: {
      branchId,
      heirEmail,
      releaseCondition,
      releaseDate: releaseDate || null,
      downloadToken: crypto.randomBytes(32).toString('hex'),
    },
  })

  return heir
}

export async function releaseToHeir(heirId: string) {
  const heir = await prisma.heir.findUnique({
    where: { id: heirId },
    include: {
      branch: true,
    },
  })

  if (!heir) {
    throw new Error('Heir not found')
  }

  if (heir.notified) {
    throw new Error('Already released to this heir')
  }

  // Create legacy archive
  const archive = await createLegacyArchive(heir.branchId)

  // In production, would:
  // 1. Upload archive to secure storage
  // 2. Send email with download link
  // 3. Log the release

  if (!isDemoMode()) {
    // Send email (future implementation)
    // await sendLegacyEmail(heir.heirEmail, heir.downloadToken, archive)
  }

  // Mark as notified
  await prisma.heir.update({
    where: { id: heirId },
    data: {
      notified: true,
      notifiedAt: new Date(),
    },
  })

  return {
    success: true,
    downloadToken: heir.downloadToken,
    archive,
  }
}

export async function checkLegacyConditions() {
  // Find heirs with date-based release conditions that have passed
  const dueHeirs = await prisma.heir.findMany({
    where: {
      releaseCondition: 'AFTER_DATE',
      releaseDate: {
        lte: new Date(),
      },
      notified: false,
    },
  })

  const results = []

  for (const heir of dueHeirs) {
    try {
      const result = await releaseToHeir(heir.id)
      results.push({ heirId: heir.id, success: true })
    } catch (error: any) {
      results.push({ heirId: heir.id, success: false, error: error.message })
    }
  }

  return results
}

export async function getLegacyDownload(token: string) {
  const heir = await prisma.heir.findUnique({
    where: { downloadToken: token },
    include: {
      branch: true,
    },
  })

  if (!heir || !heir.notified) {
    throw new Error('Invalid or inactive download link')
  }

  const archive = await createLegacyArchive(heir.branchId)

  return archive
}

// Cross-Branch Legacy Functions

export interface LegacyBranch {
  id: string
  title: string
  type: string
  personStatus: string
  birthDate: Date | null
  deathDate: Date | null
  legacyEnteredAt: Date | null
  legacyMarkedBy: string | null
  createdAt: Date
}

/**
 * Check if a branch is a legacy branch
 */
export async function isLegacyBranch(branchId: string): Promise<boolean> {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      type: true,
      personStatus: true,
    },
  })

  return branch?.type === 'legacy' || branch?.personStatus === 'legacy'
}

/**
 * Get all empty legacy branches (0 memories, created > X days ago)
 */
export async function getEmptyLegacyBranches(daysOld: number = 30): Promise<LegacyBranch[]> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const branches = await prisma.branch.findMany({
    where: {
      OR: [
        { type: 'legacy' },
        { personStatus: 'legacy' },
      ],
      createdAt: {
        lte: cutoffDate,
      },
      archived: false,
    },
    include: {
      _count: {
        select: {
          entries: true,
        },
      },
    },
  })

  // Filter for branches with 0 memories
  return branches
    .filter((b) => b._count.entries === 0)
    .map((b) => ({
      id: b.id,
      title: b.title,
      type: b.type,
      personStatus: b.personStatus,
      birthDate: b.birthDate,
      deathDate: b.deathDate,
      legacyEnteredAt: b.legacyEnteredAt,
      legacyMarkedBy: b.legacyMarkedBy,
      createdAt: b.createdAt,
    }))
}

/**
 * Check if a branch has any memories
 */
export async function hasMemories(branchId: string): Promise<boolean> {
  const count = await prisma.entry.count({
    where: {
      branchId,
      status: 'ACTIVE',
    },
  })

  return count > 0
}

/**
 * Get days since legacy branch was created
 */
export async function getLegacyDaysSinceCreation(branchId: string): Promise<number> {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { createdAt: true },
  })

  if (!branch) return 0

  const now = new Date()
  const created = new Date(branch.createdAt)
  const diffTime = Math.abs(now.getTime() - created.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Mark a branch as legacy
 */
export async function markBranchAsLegacy(
  branchId: string,
  userId: string,
  birthDate?: Date,
  deathDate?: Date,
  proofUrl?: string
): Promise<void> {
  await prisma.branch.update({
    where: { id: branchId },
    data: {
      type: 'legacy',
      personStatus: 'legacy',
      birthDate: birthDate || null,
      deathDate: deathDate || null,
      legacyMarkedBy: userId,
      legacyProofUrl: proofUrl || null,
      legacyEnteredAt: new Date(),
    },
  })
}

/**
 * Get legacy heirs and stewards for a branch
 */
export async function getLegacyHeirs(branchId: string) {
  return await prisma.legacyHeir.findMany({
    where: { branchId },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Add a legacy heir or steward
 */
export async function addLegacyHeir(
  branchId: string,
  userId: string,
  role: 'steward' | 'heir'
): Promise<void> {
  await prisma.legacyHeir.create({
    data: {
      branchId,
      userId,
      role,
    },
  })
}

/**
 * Check if user is steward or heir of a legacy branch
 */
export async function isLegacyManager(userId: string, branchId: string): Promise<boolean> {
  const count = await prisma.legacyHeir.count({
    where: {
      branchId,
      userId,
    },
  })

  return count > 0
}

/**
 * Get all legacy branches where user is steward or heir
 */
export async function getUserLegacyBranches(userId: string): Promise<string[]> {
  const heirs = await prisma.legacyHeir.findMany({
    where: { userId },
    select: { branchId: true },
  })

  return heirs.map((h) => h.branchId)
}

/**
 * Check if a memory is in a legacy branch (for read-only enforcement)
 */
export async function isMemoryInLegacyBranch(memoryId: string): Promise<boolean> {
  const memory = await prisma.entry.findUnique({
    where: { id: memoryId },
    include: {
      branch: {
        select: {
          type: true,
          personStatus: true,
        },
      },
    },
  })

  if (!memory) return false

  return memory.branch.type === 'legacy' || memory.branch.personStatus === 'legacy'
}

/**
 * Get memory count for a branch
 */
export async function getMemoryCount(branchId: string): Promise<number> {
  return await prisma.entry.count({
    where: {
      branchId,
      status: 'ACTIVE',
    },
  })
}

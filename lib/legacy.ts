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

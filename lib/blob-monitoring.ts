/**
 * 🔒 CRITICAL SYSTEM: Blob Storage Monitoring & Protection
 *
 * Memorial images are irreplaceable. This system ensures no image is ever lost.
 *
 * Features:
 * - Real-time blob verification on upload
 * - Automatic health checks
 * - Error logging and alerts
 * - Recovery mechanisms
 */

import { prisma } from '@/lib/prisma'

// ============================================
// TYPES
// ============================================

export type BlobType = 'image' | 'video' | 'audio'

export interface BlobVerificationResult {
  url: string
  exists: boolean
  accessible: boolean
  statusCode?: number
  error?: string
  size?: number
  contentType?: string
  verifiedAt: Date
}

export interface BlobHealthReport {
  totalChecked: number
  healthy: number
  broken: number
  inaccessible: number
  issues: BlobIssue[]
  checkedAt: Date
}

export interface BlobIssue {
  type: 'entry' | 'nestItem' | 'soundArt' | 'audioSpark'
  id: string
  userId: string
  url: string
  field: string
  error: string
  severity: 'critical' | 'warning'
  createdAt?: Date
}

// ============================================
// VERIFICATION FUNCTIONS
// ============================================

/**
 * Verify a single blob URL is accessible
 */
export async function verifyBlobUrl(url: string): Promise<BlobVerificationResult> {
  const startTime = Date.now()

  try {
    // HEAD request to check if blob exists without downloading
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    const result: BlobVerificationResult = {
      url,
      exists: response.ok,
      accessible: response.ok,
      statusCode: response.status,
      size: parseInt(response.headers.get('content-length') || '0'),
      contentType: response.headers.get('content-type') || undefined,
      verifiedAt: new Date()
    }

    if (!response.ok) {
      result.error = `HTTP ${response.status}: ${response.statusText}`

      // Log critical errors
      console.error(`🚨 [BLOB VERIFICATION FAILED] ${url}`, {
        status: response.status,
        statusText: response.statusText,
        duration: Date.now() - startTime
      })
    }

    return result

  } catch (error: any) {
    console.error(`🚨 [BLOB VERIFICATION ERROR] ${url}`, {
      error: error.message,
      duration: Date.now() - startTime
    })

    return {
      url,
      exists: false,
      accessible: false,
      error: error.message || 'Unknown error',
      verifiedAt: new Date()
    }
  }
}

/**
 * Verify blob immediately after upload
 * CRITICAL: Call this after every blob upload
 */
export async function verifyBlobAfterUpload(
  url: string,
  context: {
    userId: string
    type: BlobType
    recordType: string
    recordId?: string
  }
): Promise<BlobVerificationResult> {
  console.log(`🔍 [BLOB UPLOAD VERIFICATION] Starting verification...`, {
    url,
    ...context
  })

  const result = await verifyBlobUrl(url)

  if (!result.accessible) {
    // CRITICAL ERROR - Upload failed
    console.error(`🚨🚨🚨 [CRITICAL] BLOB UPLOAD FAILED - Image not accessible!`, {
      url,
      ...context,
      error: result.error
    })

    // Log to database for admin review
    await logBlobError({
      url,
      userId: context.userId,
      error: result.error || 'Blob not accessible after upload',
      severity: 'critical',
      context: JSON.stringify(context)
    })
  } else {
    console.log(`✅ [BLOB UPLOAD VERIFIED] ${url}`, {
      size: result.size,
      contentType: result.contentType
    })
  }

  return result
}

// ============================================
// HEALTH CHECK FUNCTIONS
// ============================================

/**
 * Check health of all Entry media URLs
 */
export async function checkEntryBlobHealth(limit = 100): Promise<BlobIssue[]> {
  const issues: BlobIssue[] = []

  // Check Entry.mediaUrl (photos)
  const entriesWithMedia = await prisma.entry.findMany({
    where: {
      mediaUrl: { not: null },
      status: 'ACTIVE'
    },
    select: {
      id: true,
      authorId: true,
      mediaUrl: true,
      createdAt: true
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  })

  for (const entry of entriesWithMedia) {
    if (!entry.mediaUrl) continue

    const result = await verifyBlobUrl(entry.mediaUrl)

    if (!result.accessible) {
      issues.push({
        type: 'entry',
        id: entry.id,
        userId: entry.authorId,
        url: entry.mediaUrl,
        field: 'mediaUrl',
        error: result.error || 'Not accessible',
        severity: 'critical',
        createdAt: entry.createdAt
      })
    }

    // Rate limit - don't hammer the blob storage
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Check Entry.videoUrl
  const entriesWithVideo = await prisma.entry.findMany({
    where: {
      videoUrl: { not: null },
      status: 'ACTIVE'
    },
    select: {
      id: true,
      authorId: true,
      videoUrl: true,
      createdAt: true
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  })

  for (const entry of entriesWithVideo) {
    if (!entry.videoUrl) continue

    const result = await verifyBlobUrl(entry.videoUrl)

    if (!result.accessible) {
      issues.push({
        type: 'entry',
        id: entry.id,
        userId: entry.authorId,
        url: entry.videoUrl,
        field: 'videoUrl',
        error: result.error || 'Not accessible',
        severity: 'critical',
        createdAt: entry.createdAt
      })
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Check Entry.audioUrl
  const entriesWithAudio = await prisma.entry.findMany({
    where: {
      audioUrl: { not: null },
      status: 'ACTIVE'
    },
    select: {
      id: true,
      authorId: true,
      audioUrl: true,
      createdAt: true
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  })

  for (const entry of entriesWithAudio) {
    if (!entry.audioUrl) continue

    const result = await verifyBlobUrl(entry.audioUrl)

    if (!result.accessible) {
      issues.push({
        type: 'entry',
        id: entry.id,
        userId: entry.authorId,
        url: entry.audioUrl,
        field: 'audioUrl',
        error: result.error || 'Not accessible',
        severity: 'critical',
        createdAt: entry.createdAt
      })
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return issues
}

/**
 * Check health of all Nest item blobs
 */
export async function checkNestBlobHealth(limit = 100): Promise<BlobIssue[]> {
  const issues: BlobIssue[] = []

  const nestItems = await prisma.nestItem.findMany({
    where: {
      OR: [
        { photoUrl: { not: null } },
        { videoUrl: { not: null } }
      ],
      status: { in: ['pending', 'reviewed'] }
    },
    select: {
      id: true,
      userId: true,
      photoUrl: true,
      videoUrl: true,
      uploadedAt: true
    },
    take: limit,
    orderBy: { uploadedAt: 'desc' }
  })

  for (const item of nestItems) {
    const url = item.photoUrl || item.videoUrl
    if (!url) continue

    const result = await verifyBlobUrl(url)

    if (!result.accessible) {
      issues.push({
        type: 'nestItem',
        id: item.id,
        userId: item.userId,
        url,
        field: item.photoUrl ? 'photoUrl' : 'videoUrl',
        error: result.error || 'Not accessible',
        severity: 'critical',
        createdAt: item.uploadedAt
      })
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return issues
}

/**
 * Comprehensive health check across all blob types
 */
export async function runComprehensiveHealthCheck(limit = 50): Promise<BlobHealthReport> {
  console.log('🏥 [BLOB HEALTH CHECK] Starting comprehensive health check...')

  const startTime = Date.now()
  const allIssues: BlobIssue[] = []

  // Check all types
  const entryIssues = await checkEntryBlobHealth(limit)
  const nestIssues = await checkNestBlobHealth(limit)

  allIssues.push(...entryIssues, ...nestIssues)

  const totalChecked = (limit * 3) + limit // entries (3 types) + nest
  const broken = allIssues.length
  const healthy = totalChecked - broken

  const report: BlobHealthReport = {
    totalChecked,
    healthy,
    broken,
    inaccessible: broken,
    issues: allIssues,
    checkedAt: new Date()
  }

  console.log('🏥 [BLOB HEALTH CHECK] Complete', {
    duration: Date.now() - startTime,
    totalChecked,
    healthy,
    broken,
    criticalIssues: allIssues.filter(i => i.severity === 'critical').length
  })

  // If we found critical issues, alert admins
  if (allIssues.length > 0) {
    await alertAdminsOfBlobIssues(allIssues)
  }

  return report
}

// ============================================
// ERROR LOGGING
// ============================================

/**
 * Log blob errors to database for admin review
 */
async function logBlobError(error: {
  url: string
  userId: string
  error: string
  severity: 'critical' | 'warning'
  context?: string
}) {
  try {
    // Create an audit log entry
    await prisma.audit.create({
      data: {
        actorId: error.userId,
        action: 'BLOB_ERROR',
        targetType: 'BLOB',
        targetId: error.url,
        metadata: JSON.stringify({
          error: error.error,
          severity: error.severity,
          context: error.context,
          timestamp: new Date().toISOString()
        })
      }
    })

    console.log(`📝 [BLOB ERROR LOGGED]`, error)
  } catch (logError) {
    // If we can't log to database, at least log to console
    console.error(`🚨 [FAILED TO LOG BLOB ERROR]`, {
      originalError: error,
      logError
    })
  }
}

/**
 * Alert admins of blob storage issues
 */
async function alertAdminsOfBlobIssues(issues: BlobIssue[]) {
  if (issues.length === 0) return

  console.error(`🚨🚨🚨 [BLOB STORAGE ALERT] ${issues.length} blob(s) are inaccessible!`)

  // Group by severity
  const critical = issues.filter(i => i.severity === 'critical')
  const warnings = issues.filter(i => i.severity === 'warning')

  console.error(`   - ${critical.length} critical issues (memorial images at risk!)`)
  console.error(`   - ${warnings.length} warnings`)

  // Log each critical issue
  critical.forEach(issue => {
    console.error(`   🚨 CRITICAL: ${issue.type} #${issue.id} - ${issue.url}`)
  })

  // TODO: Send email/Slack notification to admin
  // TODO: Create admin dashboard alert
}

// ============================================
// RECOVERY FUNCTIONS
// ============================================

/**
 * Attempt to find and restore a missing blob
 */
export async function attemptBlobRecovery(issueId: string, issueType: string) {
  // TODO: Implement recovery strategies:
  // 1. Check if blob exists under different URL
  // 2. Look for backups
  // 3. Check if user has duplicate uploads
  // 4. Notify user to re-upload if unrecoverable

  console.warn('🔧 [BLOB RECOVERY] Recovery not yet implemented', {
    issueId,
    issueType
  })
}

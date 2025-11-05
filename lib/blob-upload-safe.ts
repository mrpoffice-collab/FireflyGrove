/**
 * 🔒 SAFE BLOB UPLOAD WRAPPER
 *
 * Wraps Vercel Blob uploads with automatic verification and error handling
 * to ensure memorial images are never lost.
 *
 * ALWAYS use these functions instead of calling `put()` directly!
 */

import { put, PutBlobResult } from '@vercel/blob'
import { verifyBlobAfterUpload } from './blob-monitoring'

export interface SafeUploadContext {
  userId: string
  type: 'image' | 'video' | 'audio'
  recordType: string // 'entry', 'nestItem', 'soundArt', etc.
  recordId?: string
}

export interface SafeUploadResult {
  success: boolean
  blob?: PutBlobResult
  url?: string
  error?: string
  verified: boolean
}

/**
 * 🔒 SAFE BLOB UPLOAD
 *
 * Uploads a file to Vercel Blob and immediately verifies it's accessible.
 * Returns error if verification fails.
 *
 * @param pathname - Path where blob will be stored
 * @param file - File or data to upload
 * @param context - Context for logging and monitoring
 * @param options - Additional Vercel Blob options
 */
export async function safeBlobUpload(
  pathname: string,
  file: File | Buffer | ReadableStream | Blob,
  context: SafeUploadContext,
  options: {
    access?: 'public'
    addRandomSuffix?: boolean
    contentType?: string
  } = {}
): Promise<SafeUploadResult> {
  const startTime = Date.now()

  try {
    console.log(`🔒 [SAFE UPLOAD] Starting upload...`, {
      pathname,
      ...context
    })

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: options.access || 'public',
      addRandomSuffix: options.addRandomSuffix ?? true,
      ...(options.contentType && { contentType: options.contentType })
    })

    console.log(`📤 [SAFE UPLOAD] Upload complete: ${blob.url}`, {
      size: blob.size,
      duration: Date.now() - startTime
    })

    // 🔒 CRITICAL: Verify the blob is accessible
    const verification = await verifyBlobAfterUpload(blob.url, context)

    if (!verification.accessible) {
      // CRITICAL ERROR: Blob upload succeeded but verification failed!
      console.error(`🚨🚨🚨 [CRITICAL] SAFE UPLOAD FAILED - Verification error!`, {
        url: blob.url,
        ...context,
        error: verification.error,
        duration: Date.now() - startTime
      })

      return {
        success: false,
        error: verification.error || 'Blob verification failed',
        verified: false,
        url: blob.url
      }
    }

    console.log(`✅ [SAFE UPLOAD] Complete and verified: ${blob.url}`, {
      duration: Date.now() - startTime
    })

    return {
      success: true,
      blob,
      url: blob.url,
      verified: true
    }

  } catch (error: any) {
    console.error(`💥 [SAFE UPLOAD] Upload failed!`, {
      pathname,
      ...context,
      error: error.message,
      duration: Date.now() - startTime
    })

    return {
      success: false,
      error: error.message || 'Upload failed',
      verified: false
    }
  }
}

/**
 * 🔒 SAFE BLOB UPLOAD WITH RETRY
 *
 * Attempts upload up to 3 times if verification fails
 */
export async function safeBlobUploadWithRetry(
  pathname: string,
  file: File | Buffer | ReadableStream | Blob,
  context: SafeUploadContext,
  options: {
    access?: 'public'
    addRandomSuffix?: boolean
    contentType?: string
    maxRetries?: number
  } = {}
): Promise<SafeUploadResult> {
  const maxRetries = options.maxRetries || 3

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 [SAFE UPLOAD] Attempt ${attempt}/${maxRetries}...`)

    const result = await safeBlobUpload(pathname, file, context, options)

    if (result.success && result.verified) {
      return result
    }

    if (attempt < maxRetries) {
      console.warn(`⚠️  [SAFE UPLOAD] Attempt ${attempt} failed, retrying...`, {
        error: result.error
      })
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }

  // All retries failed
  console.error(`🚨🚨🚨 [CRITICAL] SAFE UPLOAD FAILED after ${maxRetries} attempts!`)

  return {
    success: false,
    error: `Upload failed after ${maxRetries} attempts`,
    verified: false
  }
}

/**
 * Helper: Get file size from various file types
 */
function getFileSize(file: File | Buffer | ReadableStream | Blob): number {
  if (file instanceof File) return file.size
  if (file instanceof Blob) return file.size
  if (Buffer.isBuffer(file)) return file.length
  return 0
}

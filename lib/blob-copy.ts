/**
 * 🔒 SAFE BLOB COPY
 *
 * Copies a blob from one location to another before deleting the source.
 * Critical for moving images from temporary nest storage to permanent memory storage.
 */

import { safeBlobUpload } from './blob-upload-safe'

export interface BlobCopyResult {
  success: boolean
  newUrl?: string
  error?: string
}

/**
 * Copy a blob from nest storage to permanent memory storage
 *
 * @param sourceUrl - The original blob URL (from nest)
 * @param destinationPath - Where to store the copy (e.g., 'memories/entryId/filename')
 * @param userId - User ID for context/logging
 * @param entryId - Memory entry ID for context/logging
 */
export async function copyNestBlobToMemory(
  sourceUrl: string,
  destinationPath: string,
  userId: string,
  entryId: string
): Promise<BlobCopyResult> {
  try {
    console.log(`📋 [BLOB COPY] Copying nest image to permanent storage...`, {
      sourceUrl,
      destinationPath,
      userId,
      entryId
    })

    // Step 1: Fetch the source blob
    const response = await fetch(sourceUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch source blob: ${response.status} ${response.statusText}`)
    }

    // Get the blob data
    const blob = await response.blob()

    console.log(`📥 [BLOB COPY] Downloaded source blob: ${blob.size} bytes, type: ${blob.type}`)

    // Step 2: Upload to new permanent location using safe upload
    const uploadResult = await safeBlobUpload(
      destinationPath,
      blob,
      {
        userId,
        type: 'image', // Could be video too, but we'll handle that later
        recordType: 'entry',
        recordId: entryId
      },
      {
        access: 'public',
        addRandomSuffix: false, // Keep original filename structure
        contentType: blob.type
      }
    )

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(uploadResult.error || 'Upload to permanent storage failed')
    }

    console.log(`✅ [BLOB COPY] Successfully copied to permanent storage: ${uploadResult.url}`)

    return {
      success: true,
      newUrl: uploadResult.url
    }

  } catch (error: any) {
    console.error(`💥 [BLOB COPY] Failed to copy blob!`, {
      sourceUrl,
      destinationPath,
      error: error.message
    })

    return {
      success: false,
      error: error.message || 'Failed to copy blob'
    }
  }
}

/**
 * Extract filename from a blob URL
 */
export function extractFilenameFromBlobUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'unknown'
    return filename
  } catch {
    return 'unknown'
  }
}

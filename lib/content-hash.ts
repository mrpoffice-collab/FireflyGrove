import crypto from 'crypto'

/**
 * Generate a content hash for duplicate detection
 * Normalizes text and media URLs to create consistent hash
 */
export function generateContentHash(
  text: string,
  mediaUrl?: string | null,
  audioUrl?: string | null,
  videoUrl?: string | null
): string {
  // Normalize text: lowercase, trim, remove extra whitespace
  const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ')

  // Create a consistent string combining all content
  const content = [
    normalizedText,
    mediaUrl || '',
    audioUrl || '',
    videoUrl || '',
  ].join('|')

  // Generate SHA-256 hash
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Check if a memory with similar content was recently created
 * @param userId - The user creating the memory
 * @param branchId - The branch ID
 * @param contentHash - The content hash to check
 * @param withinMinutes - Time window to check for duplicates (default 5 minutes)
 */
export async function checkRecentDuplicate(
  prisma: any,
  userId: string,
  branchId: string,
  contentHash: string,
  withinMinutes: number = 5
): Promise<{ isDuplicate: boolean; existingEntry?: any }> {
  const cutoffTime = new Date()
  cutoffTime.setMinutes(cutoffTime.getMinutes() - withinMinutes)

  const existingEntry = await prisma.entry.findFirst({
    where: {
      authorId: userId,
      branchId,
      contentHash,
      createdAt: {
        gte: cutoffTime,
      },
      status: 'ACTIVE', // Only check against active entries
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  return {
    isDuplicate: !!existingEntry,
    existingEntry: existingEntry || undefined,
  }
}

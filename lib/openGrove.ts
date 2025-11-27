/**
 * Open Grove - System grove for public legacy trees
 *
 * The Open Grove is a special system-managed grove that holds all
 * free public legacy trees. It's created automatically on first run.
 */

import { prisma } from './prisma'

const OPEN_GROVE_USER_EMAIL = 'system@fireflygrove.com'
const OPEN_GROVE_NAME = 'Open Grove'

/**
 * Get or create the Open Grove
 * Returns the system Open Grove, creating it if it doesn't exist
 */
export async function getOrCreateOpenGrove() {
  try {
    // First, try to find existing Open Grove
    const existingGrove = await prisma.grove.findFirst({
      where: { isOpenGrove: true },
    })

    if (existingGrove) {
      return existingGrove
    }

    // Need to create Open Grove - first need system user
    let systemUser = await prisma.user.findUnique({
      where: { email: OPEN_GROVE_USER_EMAIL },
    })

    if (!systemUser) {
      // Create system user
      systemUser = await prisma.user.create({
        data: {
          email: OPEN_GROVE_USER_EMAIL,
          name: 'Firefly Grove System',
          password: 'SYSTEM_ACCOUNT_NO_LOGIN', // Not a real password
          status: 'LOCKED', // Can't login
        },
      })
    }

    // Create the Open Grove
    const openGrove = await prisma.grove.create({
      data: {
        userId: systemUser.id,
        name: OPEN_GROVE_NAME,
        planType: 'institutional', // Unlimited capacity
        treeLimit: 999999, // Essentially unlimited
        treeCount: 0,
        status: 'active',
        isOpenGrove: true,
      },
    })

    console.log('✨ Open Grove created successfully')
    return openGrove
  } catch (error) {
    console.error('Error creating Open Grove:', error)
    throw error
  }
}

/**
 * Get the Open Grove ID
 * Convenience function that returns just the ID
 */
export async function getOpenGroveId(): Promise<string> {
  const grove = await getOrCreateOpenGrove()
  return grove.id
}

/**
 * Check if a grove is the Open Grove
 */
export function isOpenGrove(groveId: string, grove?: { isOpenGrove: boolean }): boolean {
  if (grove) {
    return grove.isOpenGrove
  }
  // If grove object not provided, would need to query - return false for now
  return false
}

/**
 * Get the system user ID for Open Grove operations
 * Used when creating memorials without an authenticated user
 */
export async function getSystemUserId(): Promise<string> {
  const grove = await getOrCreateOpenGrove()
  return grove.userId
}

import { prisma } from './prisma'

/**
 * Check if trustee period has expired for a Person
 * If expired, remove trusteeId
 */
export async function checkAndExpireTrustee(personId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: {
      id: true,
      trusteeId: true,
      trusteeExpiresAt: true,
    },
  })

  if (!person || !person.trusteeId || !person.trusteeExpiresAt) {
    return { expired: false, person }
  }

  const now = new Date()
  const isExpired = person.trusteeExpiresAt < now

  if (isExpired) {
    // Remove trustee access
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        trusteeId: null,
        trusteeExpiresAt: null,
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: person.trusteeId,
        action: 'EXPIRE',
        targetType: 'PERSON',
        targetId: personId,
        metadata: JSON.stringify({
          reason: 'Trustee period expired (60 days)',
          expiredAt: person.trusteeExpiresAt.toISOString(),
        }),
      },
    })

    return { expired: true, person: updatedPerson }
  }

  return { expired: false, person }
}

/**
 * Check if a user is the active (non-expired) trustee of a Person
 */
export async function isActiveTrustee(personId: string, userId: string): Promise<boolean> {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: {
      trusteeId: true,
      trusteeExpiresAt: true,
    },
  })

  if (!person || person.trusteeId !== userId || !person.trusteeExpiresAt) {
    return false
  }

  const now = new Date()
  return person.trusteeExpiresAt >= now
}

/**
 * Get days remaining in trustee period
 */
export function getDaysRemaining(expiresAt: Date): number {
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

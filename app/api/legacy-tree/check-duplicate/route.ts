import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/legacy-tree/check-duplicate
 *
 * Check if a memorial tree already exists for this person
 * Uses fuzzy matching on name and exact matching on death date
 *
 * Body: {
 *   name: string
 *   deathDate: string (ISO date)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { name, deathDate } = await req.json()

    if (!name || !deathDate) {
      return NextResponse.json(
        { error: 'Name and death date are required' },
        { status: 400 }
      )
    }

    const deathDateObj = new Date(deathDate)

    // Check for exact match (same death date)
    const exactMatches = await prisma.person.findMany({
      where: {
        isLegacy: true,
        deathDate: deathDateObj,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        branches: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    })

    // Filter for name similarity (fuzzy matching)
    const normalizedInputName = name.toLowerCase().trim()
    const similarMatches = exactMatches.filter((person) => {
      const normalizedPersonName = person.name.toLowerCase().trim()

      // Check if names are very similar
      // 1. Exact match
      if (normalizedPersonName === normalizedInputName) return true

      // 2. One contains the other (e.g., "John Smith" vs "John Robert Smith")
      if (
        normalizedPersonName.includes(normalizedInputName) ||
        normalizedInputName.includes(normalizedPersonName)
      ) {
        return true
      }

      // 3. Calculate Levenshtein distance for typos
      const distance = levenshteinDistance(normalizedPersonName, normalizedInputName)
      const maxLength = Math.max(normalizedPersonName.length, normalizedInputName.length)
      const similarity = 1 - distance / maxLength

      // Consider it similar if 80% or more characters match
      return similarity >= 0.8
    })

    if (similarMatches.length > 0) {
      return NextResponse.json({
        hasDuplicates: true,
        matches: similarMatches.map((person) => ({
          id: person.id,
          branchId: person.branches[0]?.id || null,
          name: person.name,
          birthDate: person.birthDate,
          deathDate: person.deathDate,
          memoryCount: person.memoryCount,
          ownerName: person.owner?.name || 'Unknown',
          discoveryEnabled: person.discoveryEnabled,
        })),
      })
    }

    return NextResponse.json({
      hasDuplicates: false,
      matches: [],
    })
  } catch (error: any) {
    console.error('Error checking for duplicates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check for duplicates' },
      { status: 500 }
    )
  }
}

/**
 * Calculate Levenshtein distance between two strings
 * (measure of similarity - lower is more similar)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = []

  for (let i = 0; i <= m; i++) {
    dp[i] = []
    dp[i][0] = i
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        )
      }
    }
  }

  return dp[m][n]
}

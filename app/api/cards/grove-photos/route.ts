import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any)?.id

    // Parse query parameters for search and pagination
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') // 'photo' | 'soundwave' | null (all)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get total count first to determine adaptive limit
    const totalCount = await prisma.entry.count({
      where: {
        branch: {
          ownerId: userId,
          status: 'ACTIVE',
        },
        status: 'ACTIVE',
        OR: [
          { mediaUrl: { not: null } },
          { audioUrl: { not: null } }
        ]
      }
    })

    // Adaptive limit based on total count
    let defaultLimit = 100
    if (totalCount < 50) {
      defaultLimit = 50 // Show all for small collections
    } else if (totalCount <= 200) {
      defaultLimit = 50 // Show 50 for medium collections
    } else {
      defaultLimit = 30 // Show 30 for large collections, encourage search
    }

    const requestedLimit = parseInt(searchParams.get('limit') || defaultLimit.toString())
    const limit = Math.min(requestedLimit, 200) // Max 200

    // Build WHERE clause for entries
    const entryWhere: any = {
      branch: {
        ownerId: userId,
        status: 'ACTIVE',
      },
      status: 'ACTIVE',
    }

    // Filter by type
    if (type === 'photo') {
      entryWhere.mediaUrl = { not: null }
      entryWhere.audioUrl = null
    } else if (type === 'soundwave') {
      entryWhere.audioUrl = { not: null }
    } else {
      // All media (photos or audio)
      entryWhere.OR = [
        { mediaUrl: { not: null } },
        { audioUrl: { not: null } }
      ]
    }

    // Add search filter if provided
    if (search) {
      entryWhere.OR = [
        ...(entryWhere.OR || []),
        { text: { contains: search, mode: 'insensitive' } },
        { branch: { title: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Fetch entries directly with pagination
    const entries = await prisma.entry.findMany({
      where: entryWhere,
      select: {
        id: true,
        mediaUrl: true,
        audioUrl: true,
        text: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Transform entries to media format
    const media = entries.map((entry) => {
      // If it has a photo, use the photo
      if (entry.mediaUrl) {
        return {
          id: entry.id,
          url: entry.mediaUrl,
          type: 'photo',
          caption: entry.text?.substring(0, 100) || '',
          branchId: entry.branch.id,
          branchName: entry.branch.title,
          createdAt: entry.createdAt,
        }
      }
      // If it has audio, use the soundwave image
      else if (entry.audioUrl) {
        return {
          id: entry.id,
          url: `/audio/${entry.id}-soundwave.png`,
          type: 'soundwave',
          caption: entry.text?.substring(0, 100) || '',
          branchId: entry.branch.id,
          branchName: entry.branch.title,
          createdAt: entry.createdAt,
        }
      }
      return null
    }).filter(Boolean)

    return NextResponse.json({
      media,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: offset + limit < totalCount,
        requiresSearch: totalCount > 200, // Encourage search for large collections
        defaultLimit, // Tell UI what the adaptive default was
      },
    })
  } catch (error) {
    console.error('Error fetching grove photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

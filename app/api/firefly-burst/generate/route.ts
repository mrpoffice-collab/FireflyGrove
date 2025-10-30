import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if bursts are enabled for this user
    const burstSettings = await prisma.userBurstSettings.findUnique({
      where: { userId: user.id },
    })

    if (burstSettings && !burstSettings.enabled) {
      return NextResponse.json({ error: 'Bursts are disabled' }, { status: 403 })
    }

    // Get sessionId from request body (optional)
    const body = await request.json().catch(() => ({}))
    const sessionId = body.sessionId || null

    // If sessionId provided, check if burst already exists for this session
    if (sessionId) {
      const existingBurst = await prisma.fireflyBurst.findFirst({
        where: {
          userId: user.id,
          sessionId,
          viewed: false,
        },
        include: {
          memories: {
            orderBy: { position: 'asc' },
          },
        },
      })

      if (existingBurst) {
        // Return existing unviewed burst
        const memories = await prisma.entry.findMany({
          where: {
            id: { in: existingBurst.memories.map((m) => m.entryId) },
          },
          include: {
            author: { select: { id: true, name: true, email: true } },
            branch: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        // Sort memories by position
        const sortedMemories = existingBurst.memories
          .map((bm) => memories.find((m) => m.id === bm.entryId))
          .filter(Boolean)

        return NextResponse.json({
          burst: existingBurst,
          memories: sortedMemories,
        })
      }
    }

    // Get all memories for this user (from all their branches)
    const branches = await prisma.branch.findMany({
      where: {
        ownerId: user.id,
        status: 'ACTIVE',
        archived: false,
      },
      select: { id: true },
    })

    const branchIds = branches.map((b) => b.id)

    // Get all active memories (including text-only)
    const allMemories = await prisma.entry.findMany({
      where: {
        branchId: { in: branchIds },
        status: 'ACTIVE',
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (allMemories.length === 0) {
      return NextResponse.json(
        { error: 'No memories available for burst', memories: [] },
        { status: 200 }
      )
    }

    // Select 5 random memories (or fewer if not enough available)
    const burstCount = Math.min(5, allMemories.length)
    const shuffled = [...allMemories].sort(() => Math.random() - 0.5)
    const selectedMemories = shuffled.slice(0, burstCount)

    // Create the burst
    const burst = await prisma.fireflyBurst.create({
      data: {
        userId: user.id,
        memoryCount: burstCount,
        sessionId,
        memories: {
          create: selectedMemories.map((memory, index) => ({
            entryId: memory.id,
            position: index + 1,
          })),
        },
      },
      include: {
        memories: {
          orderBy: { position: 'asc' },
        },
      },
    })

    return NextResponse.json({
      burst,
      memories: selectedMemories,
    })
  } catch (error) {
    console.error('Error generating firefly burst:', error)
    return NextResponse.json(
      { error: 'Failed to generate burst' },
      { status: 500 }
    )
  }
}

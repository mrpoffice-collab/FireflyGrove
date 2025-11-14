import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get user's last prompt ID to avoid repeating
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastPromptId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get a random prompt (avoid last one used)
    const prompts = await prisma.treasurePrompt.findMany({
      where: {
        isActive: true,
        ...(user.lastPromptId ? { id: { not: user.lastPromptId } } : {}),
      },
      select: {
        id: true,
        text: true,
        category: true,
        weight: true,
      },
    })

    if (prompts.length === 0) {
      return NextResponse.json(
        { error: 'No prompts available' },
        { status: 404 }
      )
    }

    // Weighted random selection
    const totalWeight = prompts.reduce((sum, p) => sum + p.weight, 0)
    let random = Math.random() * totalWeight
    let selectedPrompt = null

    for (const prompt of prompts) {
      random -= prompt.weight
      if (random <= 0) {
        selectedPrompt = prompt
        break
      }
    }

    // Fallback to first if somehow nothing selected
    if (!selectedPrompt) {
      selectedPrompt = prompts[0]
    }

    // Update user's lastPromptId so next refresh won't repeat this one
    await prisma.user.update({
      where: { id: userId },
      data: { lastPromptId: selectedPrompt.id },
    })

    return NextResponse.json({
      prompt: selectedPrompt,
    })
  } catch (error) {
    console.error('Refresh prompt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

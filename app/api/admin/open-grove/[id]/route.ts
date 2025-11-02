import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    const memorial = await prisma.branch.findUnique({
      where: { id: params.id }
    })

    if (!memorial) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 })
    }

    switch (action) {
      case 'feature':
        await prisma.branch.update({
          where: { id: params.id },
          data: { isFeatured: true }
        })
        break

      case 'unfeature':
        await prisma.branch.update({
          where: { id: params.id },
          data: { isFeatured: false }
        })
        break

      case 'hide':
        await prisma.branch.update({
          where: { id: params.id },
          data: { isPublic: false }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log the admin action
    await prisma.audit.create({
      data: {
        actorId: user.id,
        action: `memorial_${action}`,
        targetType: 'branch',
        targetId: memorial.id,
        metadata: JSON.stringify({
          memorialId: memorial.id,
          memorialTitle: memorial.title,
          action
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Memorial action error:', error)
    return NextResponse.json(
      { error: 'Failed to process memorial action' },
      { status: 500 }
    )
  }
}

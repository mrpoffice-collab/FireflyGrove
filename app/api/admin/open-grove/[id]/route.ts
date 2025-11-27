import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
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

    const memorial = await prisma.person.findUnique({
      where: { id: params.id },
      include: {
        branches: true,
        memberships: true,
      }
    })

    if (!memorial) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 })
    }

    // Delete related records first (due to foreign key constraints)
    // Delete branches
    await prisma.branch.deleteMany({
      where: { personId: params.id }
    })

    // Delete grove memberships
    await prisma.groveTreeMembership.deleteMany({
      where: { personId: params.id }
    })

    // Delete any memories associated with this person
    await prisma.memory.deleteMany({
      where: { personId: params.id }
    })

    // Delete the person
    await prisma.person.delete({
      where: { id: params.id }
    })

    // Log the admin action
    await prisma.audit.create({
      data: {
        actorId: user.id,
        action: 'memorial_delete',
        targetType: 'person',
        targetId: params.id,
        metadata: JSON.stringify({
          memorialId: params.id,
          memorialName: memorial.name,
          action: 'delete'
        })
      }
    })

    return NextResponse.json({ success: true, message: `Memorial "${memorial.name}" deleted` })
  } catch (error: any) {
    console.error('Memorial delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete memorial' },
      { status: 500 }
    )
  }
}

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

    const memorial = await prisma.person.findUnique({
      where: { id: params.id }
    })

    if (!memorial) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 })
    }

    switch (action) {
      case 'feature':
        // Person model doesn't have isFeatured field
        // This action is not applicable for memorials
        return NextResponse.json({ error: 'Feature action not supported for memorials' }, { status: 400 })

      case 'unfeature':
        // Person model doesn't have isFeatured field
        return NextResponse.json({ error: 'Unfeature action not supported for memorials' }, { status: 400 })

      case 'hide':
        await prisma.person.update({
          where: { id: params.id },
          data: { discoveryEnabled: false }
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
        targetType: 'person',
        targetId: memorial.id,
        metadata: JSON.stringify({
          memorialId: memorial.id,
          memorialName: memorial.name,
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

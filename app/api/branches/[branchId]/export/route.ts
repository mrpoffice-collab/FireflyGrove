import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createForeverKit } from '@/lib/export'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { branchId } = await params

    const kit = await createForeverKit(branchId, userId)

    return new NextResponse(kit.html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${kit.filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Error creating export:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create export' },
      { status: 500 }
    )
  }
}

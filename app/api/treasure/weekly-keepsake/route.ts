import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateWeeklyKeepsake } from '@/lib/weekly-keepsake-generator'
import { startOfWeek } from 'date-fns'

// Force Node.js runtime for PDFKit
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get week parameter from query (optional)
    const { searchParams } = new URL(req.url)
    const weekParam = searchParams.get('week')

    let weekStart: Date
    if (weekParam) {
      weekStart = startOfWeek(new Date(weekParam), { weekStartsOn: 0 })
    } else {
      weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
    }

    // Generate the keepsake
    const keepsake = await generateWeeklyKeepsake({
      userId,
      weekStart,
    })

    // Return PDF as download
    return new NextResponse(keepsake.pdf as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Weekly-Keepsake-${keepsake.weekLabel.replace(/ /g, '-')}.pdf"`,
        'Content-Length': keepsake.pdf.length.toString(),
      },
    })
  } catch (error) {
    console.error('Weekly keepsake error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate weekly keepsake',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { runScheduledJobs } from '@/lib/jobs'

// This endpoint is called by Vercel Cron Jobs
// Configure in vercel.json

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  // Verify cron secret
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const jobType = searchParams.get('job')

  if (!jobType) {
    return NextResponse.json({ error: 'Job type required' }, { status: 400 })
  }

  try {
    const result = await runScheduledJobs(jobType)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

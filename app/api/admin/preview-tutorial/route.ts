import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tutorialId } = await request.json()

    if (!tutorialId) {
      return NextResponse.json({ error: 'Missing tutorialId' }, { status: 400 })
    }

    // Run the preview command
    const command = `cd "C:\\Users\\mrpof\\APPS Homemade\\firefly videos" && npx tsx preview-split-screen.ts ${tutorialId}`

    // Start the process in the background
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Preview error: ${error.message}`)
        return
      }
      if (stderr) {
        console.error(`Preview stderr: ${stderr}`)
      }
      console.log(`Preview stdout: ${stdout}`)
    })

    return NextResponse.json({
      success: true,
      message: `Preview started for ${tutorialId}. Check your terminal for the browser window.`
    })

  } catch (error: any) {
    console.error('Error starting preview:', error)
    return NextResponse.json({
      error: 'Failed to start preview',
      details: error.message
    }, { status: 500 })
  }
}

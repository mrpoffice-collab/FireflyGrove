import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tutorialId, title, description } = await request.json()

    if (!tutorialId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Path to the drafts folder
    const draftsDir = path.join('C:', 'Users', 'mrpof', 'APPS Homemade', 'firefly videos', 'tutorial-videos', 'drafts')

    // Ensure drafts directory exists FIRST
    try {
      if (!fs.existsSync(draftsDir)) {
        fs.mkdirSync(draftsDir, { recursive: true })
      }
    } catch (dirError: any) {
      return NextResponse.json({
        error: 'Failed to create drafts directory',
        details: dirError.message
      }, { status: 500 })
    }

    const draftPath = path.join(draftsDir, `${tutorialId}.json`)

    // Check if file already exists
    if (fs.existsSync(draftPath)) {
      return NextResponse.json({
        error: 'Draft already exists',
        message: `${tutorialId}.json already exists. Open it in Notepad++ to edit.`,
        path: draftPath
      }, { status: 409 })
    }

    // Create basic draft template
    const draft = {
      id: tutorialId,
      title: title,
      description: description || '',
      introNarration: `Welcome to this tutorial on ${title}. Let me show you how this works.`,
      steps: [
        {
          title: 'Step 1',
          page: '/',
          actions: [
            'Show page for 2 seconds'
          ],
          narration: 'First, we\'ll start here.'
        },
        {
          title: 'Step 2',
          page: '/',
          actions: [
            'Click "Button" button',
            'Wait for page transition'
          ],
          narration: 'Next, click the button.'
        }
      ],
      outroNarration: `And that's how you ${title.toLowerCase()}. Visit fireflygrove.app to try it yourself!`
    }

    // Write the file
    fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'Draft created successfully!',
      path: draftPath,
      nextSteps: [
        `1. Open in Notepad++: ${draftPath}`,
        `2. Edit the steps to match your tutorial`,
        `3. Preview: npx tsx preview-split-screen.ts ${tutorialId}`,
        `4. Generate voices when ready`
      ]
    })

  } catch (error: any) {
    console.error('Error creating draft:', error)
    return NextResponse.json({
      error: 'Failed to create draft',
      details: error.message
    }, { status: 500 })
  }
}

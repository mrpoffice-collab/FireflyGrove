import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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

    // Use AI to generate intelligent tutorial steps
    console.log(`Generating AI draft for: ${title}`)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a JSON API that creates tutorial structures. You MUST return ONLY valid JSON, nothing else.

Create a tutorial for Firefly Grove (family memory app) with:
- App features: sign up, branches (family members), memories (text/photo/audio), invites, timeline, public memorials
- Pages: / (landing), /signup, /login, /grove (main), /branch/[id], /nest (photos)

Return this exact JSON structure with NO extra text:
{
  "introNarration": "string (20-30 words)",
  "steps": [
    {
      "title": "string",
      "page": "string (URL path)",
      "actions": ["string"],
      "narration": "string (20-40 words)"
    }
  ],
  "outroNarration": "string (15-25 words)"
}

Make narration conversational and friendly. Use specific actions like "Click 'Get Started' button" or "Type email: demo@fireflygrove.app".`
        },
        {
          role: 'user',
          content: `Tutorial: "${title}"\nDescription: ${description || 'Show how to use this feature'}\n\nCreate 3-5 steps. Return ONLY JSON.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const responseContent = completion.choices[0].message.content || '{}'

    // Clean up any potential markdown or extra text
    let jsonText = responseContent.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '')
    }

    const aiResponse = JSON.parse(jsonText)

    // Create draft with AI-generated content
    const draft = {
      id: tutorialId,
      title: title,
      description: description || '',
      introNarration: aiResponse.introNarration || `Welcome to this tutorial on ${title}. Let me show you how this works.`,
      steps: aiResponse.steps || [
        {
          title: 'Step 1',
          page: '/',
          actions: ['Show page for 2 seconds'],
          narration: 'First, we\'ll start here.'
        }
      ],
      outroNarration: aiResponse.outroNarration || `And that's how you ${title.toLowerCase()}. Visit fireflygrove.app to try it yourself!`
    }

    // Write the file
    fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'AI-powered draft created successfully!',
      path: draftPath,
      nextSteps: [
        `1. Open in Notepad++: ${draftPath}`,
        `2. Review and refine the AI-generated steps`,
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

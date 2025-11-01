import puppeteer from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import fs from 'fs'
import path from 'path'

interface TutorialStep {
  title: string
  page: string
  action: string
  duration: string
  voiceover?: string
}

interface Tutorial {
  id: string
  title: string
  description: string
  steps: TutorialStep[]
}

/**
 * Automated Tutorial Video Generator
 *
 * This script:
 * 1. Launches a browser with Puppeteer
 * 2. Navigates through tutorial steps automatically
 * 3. Records the screen
 * 4. Generates voiceover narration (placeholder for now)
 * 5. Outputs MP4 video file
 */
export async function generateTutorialVideo(
  tutorial: Tutorial,
  options: {
    baseUrl?: string
    outputDir?: string
    slowMo?: number
    showMouse?: boolean
  } = {}
) {
  const {
    baseUrl = 'http://localhost:3000',
    outputDir = './tutorial-videos',
    slowMo = 500, // Slow down actions for visibility
    showMouse = true
  } = options

  console.log(`\n🎬 Starting video generation for: ${tutorial.title}`)
  console.log(`📁 Output directory: ${outputDir}\n`)

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const videoPath = path.join(outputDir, `${tutorial.id}.mp4`)
  const browser = await puppeteer.launch({
    headless: false, // Show browser so we can see what's happening
    slowMo, // Slow down for recording
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled' // Look more natural
    ]
  })

  try {
    const page = await browser.newPage()

    // Configure screen recorder
    const recorder = new PuppeteerScreenRecorder(page, {
      followNewTab: false,
      fps: 30,
      videoFrame: {
        width: 1920,
        height: 1080
      },
      aspectRatio: '16:9'
    })

    console.log('🔴 Starting screen recording...\n')
    await recorder.start(videoPath)

    // Add intro pause
    console.log('📍 Step 0: Intro (3 seconds)')
    console.log('   🎙️  Voiceover: "Welcome to this Firefly Grove tutorial"')
    await page.waitForTimeout(3000)

    // Execute each tutorial step
    for (let i = 0; i < tutorial.steps.length; i++) {
      const step = tutorial.steps[i]
      console.log(`\n📍 Step ${i + 1}: ${step.title}`)
      console.log(`   📄 Page: ${step.page}`)
      console.log(`   🎬 Action: ${step.action}`)
      console.log(`   ⏱️  Duration: ${step.duration}`)
      console.log(`   🎙️  Voiceover: "${generateVoiceover(step)}"`)

      // Navigate to the page
      const url = step.page.includes('[id]')
        ? step.page.replace('[id]', 'demo-tree-id')
        : step.page

      await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle0' })
      await page.waitForTimeout(1000)

      // Perform the action (this is where we'd add specific interactions)
      await performStepAction(page, step)

      // Wait for the duration specified
      const durationMs = parseDuration(step.duration)
      await page.waitForTimeout(durationMs)
    }

    // Add outro pause
    console.log('\n📍 Final: Outro (3 seconds)')
    console.log('   🎙️  Voiceover: "Thanks for watching! Visit fireflygrove.app to get started"')
    await page.waitForTimeout(3000)

    console.log('\n⏹️  Stopping recording...')
    await recorder.stop()

    console.log(`\n✅ Video generated successfully!`)
    console.log(`📹 Location: ${videoPath}`)
    console.log(`\n💡 Next steps:`)
    console.log(`   1. Add voiceover narration (we'll integrate TTS next)`)
    console.log(`   2. Add background music`)
    console.log(`   3. Export to YouTube/Vimeo\n`)

    return {
      success: true,
      videoPath,
      tutorial: tutorial.title
    }
  } catch (error) {
    console.error('❌ Error generating video:', error)
    throw error
  } finally {
    await browser.close()
  }
}

/**
 * Generate natural voiceover text for a step
 */
function generateVoiceover(step: TutorialStep): string {
  if (step.voiceover) return step.voiceover

  // Generate default voiceover based on action
  const action = step.action.toLowerCase()

  if (action.includes('click')) {
    return `Now, let's ${step.action.toLowerCase()}.`
  } else if (action.includes('enter') || action.includes('type')) {
    return `Next, ${step.action.toLowerCase()}.`
  } else if (action.includes('view') || action.includes('see')) {
    return `Here you can ${step.action.toLowerCase()}.`
  } else {
    return step.action
  }
}

/**
 * Perform automated actions for each step
 * This is a placeholder - we'll expand with specific selectors
 */
async function performStepAction(page: any, step: TutorialStep) {
  const action = step.action.toLowerCase()

  // Add visual highlight to show what we're doing
  await highlightActiveArea(page, step)

  // Specific action handlers (we'll expand this)
  if (action.includes('click signup') || action.includes('click "get started"')) {
    try {
      await page.click('a[href="/signup"]')
    } catch (e) {
      console.log('   ⚠️  Could not find signup button, continuing...')
    }
  } else if (action.includes('enter email')) {
    try {
      await page.type('input[type="email"]', 'demo@example.com', { delay: 100 })
    } catch (e) {
      console.log('   ⚠️  Could not find email input, continuing...')
    }
  }
  // We'll add more action handlers as we build this out
}

/**
 * Add visual highlight to show what area is active
 */
async function highlightActiveArea(page: any, step: TutorialStep) {
  // Add a subtle highlight effect (we can make this fancier)
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse-tutorial {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
    `
    document.head.appendChild(style)
  })
}

/**
 * Parse duration string to milliseconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*(s|sec|min|m)/i)
  if (!match) return 2000 // default 2 seconds

  const value = parseInt(match[1])
  const unit = match[2].toLowerCase()

  if (unit === 'm' || unit === 'min') {
    return value * 60 * 1000
  }
  return value * 1000
}

// Example: Run from command line
if (require.main === module) {
  const exampleTutorial: Tutorial = {
    id: 'signup-demo',
    title: 'Sign Up & Create First Tree',
    description: 'Complete walkthrough of signing up and creating your first memory tree',
    steps: [
      { title: 'Landing Page', page: '/', action: 'View landing page', duration: '3s' },
      { title: 'Navigate to Signup', page: '/', action: 'Click "Get Started" button', duration: '2s' },
      { title: 'Signup Form', page: '/signup', action: 'View signup form', duration: '2s' },
      { title: 'Enter Email', page: '/signup', action: 'Enter email address', duration: '3s' },
    ]
  }

  generateTutorialVideo(exampleTutorial, {
    baseUrl: 'http://localhost:3000',
    outputDir: './tutorial-videos',
    slowMo: 300
  }).catch(console.error)
}

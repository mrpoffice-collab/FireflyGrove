'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface TutorialStep {
  title: string
  page: string
  action: string
  screenshot?: string
  duration?: string
}

interface Tutorial {
  id: string
  title: string
  description: string
  audience: 'New User' | 'Beta Tester' | 'Admin' | 'All Users'
  estimatedTime: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Needed' | 'In Progress' | 'Done'
  steps: TutorialStep[]
  videoUrl?: string
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'signup',
    title: 'How to Sign Up & Create Your First Tree',
    description: 'Complete walkthrough from landing page to first memory',
    audience: 'New User',
    estimatedTime: '3 min',
    priority: 'Critical',
    status: 'Needed',
    steps: [
      { title: 'Visit Landing Page', page: '/fb-post', action: 'Click "Become a Beta Tester"', duration: '10s' },
      { title: 'Fill Signup Form', page: '/fb-post', action: 'Enter name, email, password', duration: '30s' },
      { title: 'Welcome to Grove', page: '/grove', action: 'See empty grove dashboard', duration: '10s' },
      { title: 'Create First Tree', page: '/grove', action: 'Click "Plant a Tree"', duration: '20s' },
      { title: 'Name Your Tree', page: '/grove', action: 'Enter person\'s name, dates', duration: '30s' },
      { title: 'View Tree Page', page: '/tree/[id]', action: 'See tree with branches', duration: '15s' },
      { title: 'Add First Memory', page: '/branch/[id]', action: 'Click "Light a Memory"', duration: '45s' },
    ]
  },
  {
    id: 'add-memory',
    title: 'How to Add a Memory (Text, Photo, Audio)',
    description: 'Show all 3 memory types with examples',
    audience: 'All Users',
    estimatedTime: '4 min',
    priority: 'Critical',
    status: 'Needed',
    steps: [
      { title: 'Navigate to Branch', page: '/branch/[id]', action: 'Select a branch', duration: '10s' },
      { title: 'Click Memory Button', page: '/branch/[id]', action: 'Click "Light a Memory"', duration: '5s' },
      { title: 'Choose Story Spark', page: '/branch/[id]', action: 'Select prompt or skip', duration: '15s' },
      { title: 'Write Text Memory', page: '/branch/[id]', action: 'Type memory text', duration: '45s' },
      { title: 'Upload Photo', page: '/branch/[id]', action: 'Click camera icon, select photo', duration: '20s' },
      { title: 'Record Audio', page: '/branch/[id]', action: 'Click mic icon, record message', duration: '30s' },
      { title: 'Submit Memory', page: '/branch/[id]', action: 'Click "Save Memory"', duration: '5s' },
    ]
  },
  {
    id: 'invite-beta',
    title: 'How to Invite Friends (Email & SMS)',
    description: 'Send beta invitations via email or text message',
    audience: 'Beta Tester',
    estimatedTime: '2 min',
    priority: 'High',
    status: 'Needed',
    steps: [
      { title: 'Open Beta Invites', page: '/admin/beta-invites', action: 'Click "Invite Friends" button', duration: '5s' },
      { title: 'Email Invite', page: '/admin/beta-invites', action: 'Enter email, name, message', duration: '30s' },
      { title: 'SMS Invite', page: '/admin/beta-invites', action: 'Enter phone number, send text', duration: '30s' },
      { title: 'View Sent Invites', page: '/admin/beta-invites', action: 'See invite history', duration: '15s' },
    ]
  },
  {
    id: 'spark-collections',
    title: 'How to Upload & Use Custom Prompts',
    description: 'Upload prompt collections and use them when creating memories',
    audience: 'All Users',
    estimatedTime: '3 min',
    priority: 'High',
    status: 'Needed',
    steps: [
      { title: 'Go to Settings', page: '/spark-collections', action: 'Username → Settings → Upload Prompts', duration: '10s' },
      { title: 'Upload Prompt File', page: '/spark-collections', action: 'Click "Upload Collection", select .txt', duration: '20s' },
      { title: 'Name Collection', page: '/spark-collections', action: 'Enter name, icon, description', duration: '20s' },
      { title: 'Activate Collection', page: '/spark-collections', action: 'Toggle "Active" switch on', duration: '5s' },
      { title: 'Use in Branch', page: '/branch/[id]', action: 'Click "My Sparks" button', duration: '15s' },
      { title: 'Select Prompt', page: '/branch/[id]', action: 'Choose prompt from collection', duration: '10s' },
    ]
  },
  {
    id: 'nest-photos',
    title: 'How to Use the Nest (Photo Storage)',
    description: 'Upload photos to nest and organize them into memories',
    audience: 'All Users',
    estimatedTime: '3 min',
    priority: 'Medium',
    status: 'Needed',
    steps: [
      { title: 'Open Nest', page: '/nest', action: 'Click "🪺 My Nest" in nav', duration: '5s' },
      { title: 'Upload Photos', page: '/nest', action: 'Drag and drop or click upload', duration: '30s' },
      { title: 'View Photos', page: '/nest', action: 'See uploaded photos in grid', duration: '15s' },
      { title: 'Create Memory from Nest', page: '/nest', action: 'Click photo → "Create Memory"', duration: '20s' },
      { title: 'Assign to Branch', page: '/nest', action: 'Select tree, branch, add text', duration: '45s' },
    ]
  },
  {
    id: 'firefly-burst',
    title: 'What is Firefly Burst & How to Use It',
    description: 'Understand the memory slideshow feature and controls',
    audience: 'All Users',
    estimatedTime: '2 min',
    priority: 'Medium',
    status: 'Needed',
    steps: [
      { title: 'Burst Auto-Plays', page: '/grove', action: 'Wait for burst to appear on grove visit', duration: '5s' },
      { title: 'View Memories', page: '/grove', action: 'Watch slideshow with music', duration: '30s' },
      { title: 'Use Controls', page: '/grove', action: 'Pause, mute, navigate, snooze', duration: '20s' },
      { title: 'Snooze Feature', page: '/grove', action: 'Click clock icon to snooze 3h', duration: '10s' },
      { title: 'Re-enable Later', page: '/grove', action: 'Click "Bursts Snoozed" to wake', duration: '10s' },
    ]
  },
  {
    id: 'manage-plan',
    title: 'How to View & Upgrade Your Plan',
    description: 'Check plan limits and upgrade options',
    audience: 'All Users',
    estimatedTime: '2 min',
    priority: 'Low',
    status: 'Needed',
    steps: [
      { title: 'Open Settings', page: '/billing', action: 'Username → Settings → Manage Plan', duration: '10s' },
      { title: 'View Current Plan', page: '/billing', action: 'See plan details, limits, usage', duration: '20s' },
      { title: 'Compare Plans', page: '/billing', action: 'View plan comparison table', duration: '30s' },
      { title: 'Upgrade Option', page: '/billing', action: 'Click "Upgrade" on desired plan', duration: '10s' },
    ]
  },
  {
    id: 'open-grove',
    title: 'How to Create a Public Memorial',
    description: 'Make a tree public in Open Grove for sharing',
    audience: 'All Users',
    estimatedTime: '2 min',
    priority: 'Medium',
    status: 'Needed',
    steps: [
      { title: 'Go to Tree', page: '/tree/[id]', action: 'Select tree to make public', duration: '10s' },
      { title: 'Open Settings', page: '/tree/[id]', action: 'Click tree settings/edit', duration: '5s' },
      { title: 'Toggle Public', page: '/tree/[id]', action: 'Enable "Show in Open Grove"', duration: '10s' },
      { title: 'Visit Open Grove', page: '/open-grove', action: 'See tree in public listings', duration: '15s' },
      { title: 'Share Link', page: '/memorial/[id]', action: 'Copy memorial link to share', duration: '10s' },
    ]
  },
]

export default function TutorialsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedAudience, setSelectedAudience] = useState<string>('All')
  const [selectedPriority, setSelectedPriority] = useState<string>('All')
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null)

  const isAdmin = (session?.user as any)?.isAdmin

  useEffect(() => {
    if (!isAdmin && session) {
      router.push('/grove')
    }
  }, [isAdmin, session, router])

  if (!isAdmin) {
    return null
  }

  const audiences = ['All', 'New User', 'Beta Tester', 'Admin', 'All Users']
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low']

  const filteredTutorials = TUTORIALS.filter(t => {
    const audienceMatch = selectedAudience === 'All' || t.audience === selectedAudience
    const priorityMatch = selectedPriority === 'All' || t.priority === selectedPriority
    return audienceMatch && priorityMatch
  })

  const totalTime = filteredTutorials.reduce((sum, t) => {
    const mins = parseInt(t.estimatedTime)
    return sum + mins
  }, 0)

  const statusCounts = {
    needed: TUTORIALS.filter(t => t.status === 'Needed').length,
    inProgress: TUTORIALS.filter(t => t.status === 'In Progress').length,
    done: TUTORIALS.filter(t => t.status === 'Done').length,
  }

  const generateScript = (tutorial: Tutorial) => {
    return `
# ${tutorial.title}

**Audience:** ${tutorial.audience}
**Duration:** ${tutorial.estimatedTime}
**Priority:** ${tutorial.priority}

## Script

${tutorial.steps.map((step, i) => `
### Step ${i + 1}: ${step.title} (${step.duration})

**Page:** ${step.page}
**Action:** ${step.action}

**What to show:**
- Navigate to ${step.page}
- ${step.action}
- Highlight key UI elements
- Show result/success state

**Voiceover:**
"Now, ${step.action.toLowerCase()}. Notice how [describe what happens]."

---
`).join('\n')}

## Recording Tips:
1. Record in 1920x1080 resolution
2. Use screen recording tool (OBS, Loom, QuickTime)
3. Clear browser cookies/cache for clean demo
4. Slow down cursor movements
5. Pause 2 seconds after each action
6. Use voiceover OR captions (not both)

## Editing Checklist:
- [ ] Trim dead time at start/end
- [ ] Add intro title card (3s)
- [ ] Add outro/CTA (5s)
- [ ] Add captions if no voiceover
- [ ] Add background music (low volume)
- [ ] Export as MP4 (H.264)
- [ ] Upload to YouTube/Vimeo
    `.trim()
  }

  const copyScript = (tutorial: Tutorial) => {
    navigator.clipboard.writeText(generateScript(tutorial))
    alert(`Script copied for: ${tutorial.title}`)
  }

  const openPages = (tutorial: Tutorial) => {
    const uniquePages = Array.from(new Set(tutorial.steps.map(s => s.page)))

    uniquePages.forEach((page, index) => {
      setTimeout(() => {
        const url = page.includes('[id]')
          ? page.replace('[id]', 'example-id')
          : page
        if (typeof window !== 'undefined') {
          window.open(`${window.location.origin}${url}`, `_blank_${index}`)
        }
      }, index * 200)
    })

    alert(`Opening ${uniquePages.length} pages for tutorial recording`)
  }

  const generateVideo = async (tutorial: Tutorial) => {
    const confirmed = confirm(
      `🎬 Generate automated video for:\n"${tutorial.title}"\n\n` +
      `This will:\n` +
      `✅ Auto-navigate through ${tutorial.steps.length} steps\n` +
      `✅ Record screen automatically\n` +
      `🔄 Generate Nora's voiceover (coming soon)\n` +
      `📹 Output MP4 video file\n\n` +
      `Continue?`
    )

    if (!confirmed) return

    try {
      const response = await fetch('/api/admin/generate-tutorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorialId: tutorial.id })
      })

      const result = await response.json()

      if (response.ok) {
        // Format the setup instructions
        const setupSteps = result.setup ?
          Object.values(result.setup).join('\n   ') : ''

        const localSteps = result.howToRun?.locally ?
          Object.values(result.howToRun.locally).join('\n   ') : ''

        alert(
          `🎬 Video Generation System Ready!\n\n` +
          `Tutorial: ${tutorial.title}\n` +
          `Status: ${result.status}\n\n` +
          `📋 Setup:\n   ${setupSteps}\n\n` +
          `💻 How to Run Locally:\n   ${localSteps}\n\n` +
          `🚀 Next Steps:\n` +
          (result.nextSteps ? result.nextSteps.join('\n') : '') +
          `\n\n${result.note || ''}`
        )
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Failed to start video generation: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header
        userName={session?.user?.name || ''}
        isAdmin={isAdmin}
        isBetaTester={(session?.user as any)?.isBetaTester || false}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-firefly-glow mb-2">
            🎥 Tutorial Video Planner
          </h1>
          <p className="text-text-muted">
            Step-by-step guides for creating tutorial videos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
            <p className="text-text-muted text-sm mb-1">Total Tutorials</p>
            <p className="text-3xl text-firefly-glow">{TUTORIALS.length}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-text-muted text-sm mb-1">Needed</p>
            <p className="text-3xl text-red-400">{statusCounts.needed}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-text-muted text-sm mb-1">In Progress</p>
            <p className="text-3xl text-yellow-400">{statusCounts.inProgress}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-text-muted text-sm mb-1">Done</p>
            <p className="text-3xl text-green-400">{statusCounts.done}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-text-muted mb-2 block">Audience</label>
              <div className="flex flex-wrap gap-2">
                {audiences.map(aud => (
                  <button
                    key={aud}
                    onClick={() => setSelectedAudience(aud)}
                    className={`px-3 py-1.5 rounded text-sm transition-soft ${
                      selectedAudience === aud
                        ? 'bg-firefly-dim text-bg-dark'
                        : 'bg-bg-dark text-text-muted hover:bg-border-subtle'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm text-text-muted mb-2 block">Priority</label>
              <div className="flex flex-wrap gap-2">
                {priorities.map(pri => (
                  <button
                    key={pri}
                    onClick={() => setSelectedPriority(pri)}
                    className={`px-3 py-1.5 rounded text-sm transition-soft ${
                      selectedPriority === pri
                        ? 'bg-firefly-dim text-bg-dark'
                        : 'bg-bg-dark text-text-muted hover:bg-border-subtle'
                    }`}
                  >
                    {pri}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-text-muted text-sm mt-3">
            Showing {filteredTutorials.length} tutorials • Total time: ~{totalTime} minutes
          </p>
        </div>

        {/* Tutorials List */}
        <div className="space-y-4">
          {filteredTutorials.map((tutorial) => {
            const isExpanded = expandedTutorial === tutorial.id

            return (
              <div
                key={tutorial.id}
                className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden"
              >
                {/* Tutorial Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-border-subtle/30 transition-soft"
                  onClick={() => setExpandedTutorial(isExpanded ? null : tutorial.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg text-text-soft font-medium mb-1">
                        {tutorial.title}
                      </h3>
                      <p className="text-text-muted text-sm mb-2">
                        {tutorial.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tutorial.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
                          tutorial.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
                          tutorial.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {tutorial.priority}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {tutorial.audience}
                        </span>
                        <span className="px-2 py-1 bg-bg-dark text-text-muted rounded text-xs">
                          ⏱️ {tutorial.estimatedTime}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tutorial.status === 'Done' ? 'bg-green-500/20 text-green-300' :
                          tutorial.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {tutorial.status}
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-text-muted transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border-subtle p-4 bg-bg-dark">
                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <button
                        onClick={() => generateVideo(tutorial)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded font-medium text-sm transition-soft shadow-lg"
                      >
                        🎬 Generate Video Automatically
                      </button>
                      <button
                        onClick={() => openPages(tutorial)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-soft"
                      >
                        📱 Open Pages
                      </button>
                      <button
                        onClick={() => copyScript(tutorial)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-soft"
                      >
                        📋 Copy Script
                      </button>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      {tutorial.steps.map((step, index) => (
                        <div
                          key={index}
                          className="bg-bg-elevated border border-border-subtle rounded p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-firefly-dim/20 text-firefly-glow flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-text-soft font-medium mb-1">
                                {step.title}
                              </h4>
                              <p className="text-text-muted text-sm mb-1">
                                {step.action}
                              </p>
                              <div className="flex gap-2 text-xs">
                                <code className="bg-bg-dark px-2 py-1 rounded text-text-muted">
                                  {step.page}
                                </code>
                                <span className="px-2 py-1 bg-bg-dark rounded text-text-muted">
                                  ⏱️ {step.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Recording Instructions */}
        <div className="mt-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6">
          <h2 className="text-xl text-text-soft mb-4">🎬 Video Recording Guide</h2>

          <div className="space-y-4 text-text-muted text-sm">
            <div>
              <h3 className="text-text-soft font-medium mb-2">Tools You'll Need:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Loom</strong> (easiest) - loom.com - Free, records screen + webcam</li>
                <li><strong>OBS Studio</strong> (advanced) - obsproject.com - Free, professional</li>
                <li><strong>QuickTime</strong> (Mac) - Built-in screen recording</li>
                <li><strong>Windows Game Bar</strong> (Win+G) - Built-in for Windows</li>
              </ul>
            </div>

            <div>
              <h3 className="text-text-soft font-medium mb-2">Recording Tips:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use 1920x1080 resolution (Full HD)</li>
                <li>Clear browser cache before recording (clean demo)</li>
                <li>Slow down cursor movements</li>
                <li>Pause 2 seconds after each action</li>
                <li>Record voiceover OR add captions later</li>
                <li>Keep videos under 5 minutes each</li>
              </ul>
            </div>

            <div>
              <h3 className="text-text-soft font-medium mb-2">Workflow:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Select tutorial above</li>
                <li>Click "Open Pages for Recording"</li>
                <li>Review steps in script</li>
                <li>Start screen recording</li>
                <li>Follow script step-by-step</li>
                <li>Stop recording</li>
                <li>Edit (trim, add titles, captions)</li>
                <li>Upload to YouTube/Vimeo</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

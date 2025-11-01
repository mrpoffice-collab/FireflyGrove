'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

const TUTORIAL_IDEAS = [
  {
    id: 'signup',
    title: 'How to Sign Up & Create Your First Tree',
    description: 'Complete walkthrough from landing page to first memory',
    priority: 'Critical',
    estimatedTime: '3 min'
  },
  {
    id: 'add-memory',
    title: 'How to Add a Memory (Text, Photo, Audio)',
    description: 'Show all 3 memory types with examples',
    priority: 'Critical',
    estimatedTime: '4 min'
  },
  {
    id: 'invite-beta',
    title: 'How to Invite Friends (Email & SMS)',
    description: 'Send beta invitations via email or text message',
    priority: 'High',
    estimatedTime: '2 min'
  },
  {
    id: 'spark-collections',
    title: 'How to Upload & Use Custom Prompts',
    description: 'Upload prompt collections and use them when creating memories',
    priority: 'High',
    estimatedTime: '3 min'
  },
  {
    id: 'nest-photos',
    title: 'How to Use the Nest (Photo Storage)',
    description: 'Upload photos to nest and organize them into memories',
    priority: 'Medium',
    estimatedTime: '3 min'
  },
  {
    id: 'firefly-burst',
    title: 'What is Firefly Burst & How to Use It',
    description: 'Understand the memory slideshow feature and controls',
    priority: 'Medium',
    estimatedTime: '2 min'
  },
  {
    id: 'manage-plan',
    title: 'How to View & Upgrade Your Plan',
    description: 'Check plan limits and upgrade options',
    priority: 'Low',
    estimatedTime: '2 min'
  },
  {
    id: 'open-grove',
    title: 'How to Create a Public Memorial',
    description: 'Make a tree public in Open Grove for sharing',
    priority: 'Medium',
    estimatedTime: '2 min'
  },
]

export default function TutorialsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'ideas' | 'create' | 'guide'>('ideas')
  const [creatingDraft, setCreatingDraft] = useState<string | null>(null)

  const isAdmin = (session?.user as any)?.isAdmin

  const createDraft = async (idea: typeof TUTORIAL_IDEAS[0]) => {
    setCreatingDraft(idea.id)

    try {
      const response = await fetch('/api/admin/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorialId: idea.id,
          title: idea.title,
          description: idea.description
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(
          `✅ Draft created successfully!\n\n` +
          `File: ${result.path}\n\n` +
          `Next steps:\n` +
          result.nextSteps.join('\n')
        )
      } else if (response.status === 409) {
        alert(
          `⚠️ ${result.message}\n\n` +
          `Path: ${result.path}\n\n` +
          `Edit it in Notepad++ or delete it to create a new one.`
        )
      } else {
        alert(`❌ Error: ${result.error}\n${result.details || ''}`)
      }
    } catch (error) {
      alert(`❌ Failed to create draft: ${error}`)
    } finally {
      setCreatingDraft(null)
    }
  }

  useEffect(() => {
    if (!isAdmin && session) {
      router.push('/grove')
    }
  }, [isAdmin, session, router])

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header
        userName={session?.user?.name || ''}
        isAdmin={isAdmin}
        isBetaTester={(session?.user as any)?.isBetaTester || false}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-firefly-glow mb-2">
            🎥 Tutorial Video System
          </h1>
          <p className="text-text-muted">
            Create professional tutorial videos with AI voiceover
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-6 py-3 font-medium transition-soft ${
              activeTab === 'ideas'
                ? 'text-firefly-glow border-b-2 border-firefly-glow'
                : 'text-text-muted hover:text-text-soft'
            }`}
          >
            💡 Video Ideas
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-medium transition-soft ${
              activeTab === 'create'
                ? 'text-firefly-glow border-b-2 border-firefly-glow'
                : 'text-text-muted hover:text-text-soft'
            }`}
          >
            ✨ Create Videos
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-6 py-3 font-medium transition-soft ${
              activeTab === 'guide'
                ? 'text-firefly-glow border-b-2 border-firefly-glow'
                : 'text-text-muted hover:text-text-soft'
            }`}
          >
            📖 Complete Guide
          </button>
        </div>

        {/* Video Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
              <h2 className="text-xl text-text-soft mb-3">💡 Suggested Tutorial Videos</h2>
              <p className="text-text-muted text-sm mb-4">
                These are the most important tutorials to create. Pick any one to start with - you can work in any order!
              </p>
              <p className="text-text-muted text-sm">
                To create a video: Copy <code className="bg-bg-dark px-2 py-1 rounded text-xs">signup-complete-v2.json</code> as a template,
                edit it with your steps, then follow the 3-phase workflow in the "Create Videos" tab.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TUTORIAL_IDEAS.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-firefly-dim/40 transition-soft"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg text-text-soft font-medium">{idea.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                      idea.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
                      idea.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
                      idea.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {idea.priority}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm mb-3">{idea.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-text-muted">⏱️ {idea.estimatedTime}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-bg-dark px-2 py-1 rounded text-firefly-glow">{idea.id}.json</code>
                      <button
                        onClick={() => createDraft(idea)}
                        disabled={creatingDraft === idea.id}
                        className="px-3 py-1.5 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-xs font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingDraft === idea.id ? '...' : '📝 Create Draft'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6 mt-6">
              <h3 className="text-lg text-text-soft font-medium mb-3">📝 How to Create Your Draft</h3>
              <ol className="list-decimal list-inside space-y-2 text-text-muted text-sm ml-2">
                <li>Copy the example draft file as a template:
                  <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs mt-1">
                    cp tutorial-videos/drafts/signup-complete-v2.json tutorial-videos/drafts/YOUR-VIDEO-NAME.json
                  </code>
                </li>
                <li className="mt-3">Open your new file in Notepad++</li>
                <li>Edit the <code className="bg-bg-dark px-1 rounded text-xs">id</code>, <code className="bg-bg-dark px-1 rounded text-xs">title</code>, and steps to match your tutorial idea</li>
                <li>Save and preview using: <code className="bg-bg-dark px-1 rounded text-xs">npx tsx preview-split-screen.ts YOUR-VIDEO-NAME</code></li>
                <li>Once perfect, head to the "Create Videos" tab to generate voices and record!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6">
              <h2 className="text-xl text-text-soft mb-4 flex items-center gap-2">
                <span>🚀</span>
                <span>Quick Start - 3 Easy Phases</span>
              </h2>

              <div className="space-y-4">
                {/* Phase 1 */}
                <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg text-text-soft font-medium mb-2">
                        Draft & Preview (FREE - unlimited)
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-text-muted text-sm mb-2">
                            1. Open your draft file in Notepad++:
                          </p>
                          <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs mb-2">
                            C:\Users\mrpof\APPS Homemade\firefly videos\tutorial-videos\drafts\YOUR-VIDEO-NAME.json
                          </code>
                        </div>
                        <div>
                          <p className="text-text-muted text-sm mb-2">
                            2. Preview as many times as you want (FREE):
                          </p>
                          <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs">
                            cd "C:\Users\mrpof\APPS Homemade\firefly videos"<br/>
                            npx tsx preview-split-screen.ts YOUR-VIDEO-NAME
                          </code>
                        </div>
                        <p className="text-green-400 text-sm font-medium">
                          ✅ Edit, preview, edit, preview... until perfect! This costs $0.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg text-text-soft font-medium mb-2">
                        Generate AI Voices (COSTS ~$0.015 per clip)
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-text-muted text-sm mb-2">
                            When you're 100% happy with your draft, generate Nora's voice:
                          </p>
                          <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs">
                            npx tsx generate-voices.ts YOUR-VIDEO-NAME
                          </code>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                          <p className="text-yellow-400 text-sm font-medium mb-1">
                            💰 Cost: (steps + 2) × $0.015
                          </p>
                          <p className="text-text-muted text-xs">
                            • 3 steps = 5 clips = $0.075<br/>
                            • 5 steps = 7 clips = $0.105<br/>
                            • 10 steps = 12 clips = $0.18
                          </p>
                        </div>
                        <p className="text-green-400 text-sm font-medium">
                          ✅ Voices are cached! If you regenerate with same text, it's FREE.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg text-text-soft font-medium mb-2">
                        Record Final Video (FREE)
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-text-muted text-sm mb-2">
                            Make sure your app is running:
                          </p>
                          <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs mb-3">
                            npm run dev
                          </code>
                          <p className="text-text-muted text-sm mb-2">
                            Then record the final video:
                          </p>
                          <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs">
                            npx tsx record-video.ts YOUR-VIDEO-NAME
                          </code>
                        </div>
                        <p className="text-green-400 text-sm font-medium">
                          ✅ Your final video: tutorial-videos/YOUR-VIDEO-NAME/final-video.mp4
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <h2 className="text-xl text-text-soft mb-4">⚡ Quick Command Reference</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-text-soft font-medium mb-2">Preview (FREE - do this a lot!)</h3>
                  <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs">
                    npx tsx preview-split-screen.ts signup-complete-v2
                  </code>
                </div>

                <div>
                  <h3 className="text-sm text-text-soft font-medium mb-2">Generate voices (COSTS MONEY - do once when ready)</h3>
                  <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs">
                    npx tsx generate-voices.ts signup-complete-v2
                  </code>
                </div>

                <div>
                  <h3 className="text-sm text-text-soft font-medium mb-2">Record video (FREE)</h3>
                  <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs">
                    npx tsx record-video.ts signup-complete-v2
                  </code>
                </div>

                <div>
                  <h3 className="text-sm text-text-soft font-medium mb-2">Create new tutorial</h3>
                  <code className="block bg-bg-dark text-text-soft p-2 rounded text-xs">
                    # Copy existing draft as template<br/>
                    cp tutorial-videos/drafts/signup-complete-v2.json tutorial-videos/drafts/new-tutorial.json<br/>
                    <br/>
                    # Edit new-tutorial.json in Notepad++<br/>
                    # Then preview it<br/>
                    npx tsx preview-split-screen.ts new-tutorial
                  </code>
                </div>
              </div>
            </div>

            {/* Demo Data Management */}
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <h2 className="text-xl text-text-soft mb-4">🗑️ Demo Data Management</h2>

              <p className="text-text-muted text-sm mb-4">
                After recording tutorials, you'll have test data in your database. Here are two strategies:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bg-dark border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-green-400 font-medium mb-2">✅ Strategy 1: Increment emails (Recommended)</h3>
                  <p className="text-text-muted text-sm mb-3">
                    Use different demo emails each time - never need to delete users!
                  </p>
                  <code className="block bg-bg-elevated text-text-soft p-2 rounded text-xs">
                    demo1@fireflygrove.app<br/>
                    demo2@fireflygrove.app<br/>
                    demo3@fireflygrove.app
                  </code>
                </div>

                <div className="bg-bg-dark border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-blue-400 font-medium mb-2">🧹 Strategy 2: Safe cleanup script</h3>
                  <p className="text-text-muted text-sm mb-3">
                    Delete ONLY @fireflygrove.app emails (real users are safe):
                  </p>
                  <code className="block bg-bg-elevated text-text-soft p-2 rounded text-xs">
                    npx tsx clean-demo-users.ts
                  </code>
                  <p className="text-text-muted text-xs mt-2">
                    This shows which users will be deleted before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <h2 className="text-2xl text-text-soft mb-6">📖 Complete Video Creation Guide</h2>

            <div className="prose prose-invert max-w-none">
              <div className="space-y-6 text-text-muted">
                <section>
                  <h3 className="text-xl text-text-soft mb-3">File Structure</h3>
                  <code className="block bg-bg-dark text-text-soft p-4 rounded text-xs whitespace-pre">
{`C:\\Users\\mrpof\\APPS Homemade\\firefly videos\\
├── tutorial-videos/
│   ├── drafts/
│   │   └── vid1.json          ← Edit this
│   └── vid1/
│       ├── voices/             ← Generated voices
│       ├── video-raw.mp4       ← Screen recording
│       ├── audio-merged.mp3    ← All voices combined
│       └── final-video.mp4     ← FINAL OUTPUT ✨
├── preview-split-screen.ts     ← Preview tool
├── generate-voices.ts          ← Voice generation
└── record-video.ts             ← Final recording`}
                  </code>
                </section>

                <section>
                  <h3 className="text-xl text-text-soft mb-3">JSON File Structure</h3>
                  <code className="block bg-bg-dark text-text-soft p-4 rounded text-xs whitespace-pre">
{`{
  "id": "tutorial-id",
  "title": "Tutorial Title",
  "introNarration": "What Nora says at the start...",
  "steps": [
    {
      "title": "Step Name",
      "page": "/page-url",
      "actions": [
        "Type full name: John Doe",
        "Type email: demo@fireflygrove.app",
        "Click \\"Button Name\\" button"
      ],
      "narration": "What Nora says during this step..."
    }
  ],
  "outroNarration": "What Nora says at the end..."
}`}
                  </code>
                </section>

                <section>
                  <h3 className="text-xl text-text-soft mb-3">Available Actions</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><code className="text-xs bg-bg-dark px-2 py-1 rounded">"Show landing page for 2 seconds"</code> - Wait/pause</li>
                    <li><code className="text-xs bg-bg-dark px-2 py-1 rounded">"Click \\"Get Started\\" button"</code> - Click a button</li>
                    <li><code className="text-xs bg-bg-dark px-2 py-1 rounded">"Type full name: John Doe"</code> - Type in name field</li>
                    <li><code className="text-xs bg-bg-dark px-2 py-1 rounded">"Type email: demo@fireflygrove.app"</code> - Type in email field</li>
                    <li><code className="text-xs bg-bg-dark px-2 py-1 rounded">"Type password: SecurePass123!"</code> - Type in password field</li>
                    <li><code className="text-xs bg-bg-dark px-2 py-1 rounded">"Brief pause to show completed form"</code> - Short wait</li>
                    <li><code className="text-xs bg-bg-dark px-2 py-1 rounded">"Wait for page transition"</code> - Wait for navigation</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl text-text-soft mb-3">Editing JSON Files</h3>
                  <p className="mb-3">To merge steps: Copy actions from one step into another, update narration, delete the old step.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Before:</p>
                      <code className="block bg-bg-dark text-text-soft p-3 rounded text-xs whitespace-pre">
{`{
  "title": "Fill Form",
  "actions": ["Type email", "Type password"]
},
{
  "title": "Submit",
  "actions": ["Click Submit"]
}`}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">After (merged):</p>
                      <code className="block bg-bg-dark text-text-soft p-3 rounded text-xs whitespace-pre">
{`{
  "title": "Fill and Submit Form",
  "actions": [
    "Type email",
    "Type password",
    "Click Submit"
  ],
  "narration": "Type your email and password, then click Submit."
}`}
                      </code>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl text-text-soft mb-3">Troubleshooting</h3>
                  <div className="space-y-3">
                    <div className="bg-bg-dark border border-yellow-500/30 rounded p-3">
                      <p className="font-medium text-yellow-400 mb-1">Browser stuck on blank page</p>
                      <p className="text-xs">Make sure <code className="bg-bg-elevated px-1 py-0.5 rounded">npm run dev</code> is running at <code className="bg-bg-elevated px-1 py-0.5 rounded">http://localhost:3000</code></p>
                    </div>
                    <div className="bg-bg-dark border border-yellow-500/30 rounded p-3">
                      <p className="font-medium text-yellow-400 mb-1">Name input not found</p>
                      <p className="text-xs">The name field selector might be wrong. Check your signup page HTML and update preview-split-screen.ts line ~235</p>
                    </div>
                    <div className="bg-bg-dark border border-yellow-500/30 rounded p-3">
                      <p className="font-medium text-yellow-400 mb-1">VS Code/Cursor showing old JSON</p>
                      <p className="text-xs">Close and reopen the file, or use Notepad++ instead (it doesn't cache files)</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl text-text-soft mb-3">Cost Calculator</h3>
                  <div className="bg-bg-dark border border-border-subtle rounded p-4">
                    <p className="mb-3">Per tutorial: <strong className="text-firefly-glow">(steps + 2) × $0.015</strong></p>
                    <ul className="space-y-1 text-sm">
                      <li>• 3 steps = 5 clips = <span className="text-green-400">$0.075</span></li>
                      <li>• 5 steps = 7 clips = <span className="text-green-400">$0.105</span></li>
                      <li>• 10 steps = 12 clips = <span className="text-green-400">$0.18</span></li>
                    </ul>
                    <p className="text-xs mt-3 text-yellow-400">Remember: Previewing is FREE! Only generating voices costs money.</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl text-text-soft mb-3">Pro Tips</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                    <li>Work in any order - vid1, vid5, vid3, whatever makes sense to you</li>
                    <li>Each video is completely independent</li>
                    <li>Preview unlimited times before spending money on voices</li>
                    <li>Voice caching saves money - if text doesn't change, voices are reused (FREE!)</li>
                    <li>Keep draft JSON files - they're tiny (~2 KB) and make great templates</li>
                    <li>Use incrementing demo emails to avoid database cleanup</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

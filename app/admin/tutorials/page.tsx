'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function TutorialsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'create' | 'guide'>('create')

  const isAdmin = (session?.user as any)?.isAdmin

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

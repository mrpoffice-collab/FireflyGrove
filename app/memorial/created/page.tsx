'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function MemorialCreatedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || 'your loved one'

  return (
    <div className="min-h-screen bg-bg-darker">
      {/* Simple Header */}
      <div className="border-b border-border-subtle bg-bg-dark">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-light text-firefly-glow hover:text-firefly-dim transition-soft"
          >
            Firefly Grove
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🕯️</div>

          <h1 className="text-4xl font-light text-text-soft mb-4">
            Memorial Created
          </h1>

          <p className="text-text-muted text-lg mb-8">
            You've created a memorial for <span className="text-[var(--legacy-text)]">{name}</span>
          </p>

          <div className="bg-bg-dark border border-[var(--legacy-amber)]/30 rounded-lg p-8 mb-8">
            <h2 className="text-xl text-text-soft mb-4">What's Next?</h2>

            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✍️</div>
                <div>
                  <div className="text-text-soft font-medium mb-1">
                    Add the first memory
                  </div>
                  <div className="text-text-muted text-sm">
                    Share a story, photo, or reflection to begin the memorial
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">👥</div>
                <div>
                  <div className="text-text-soft font-medium mb-1">
                    Invite family and friends
                  </div>
                  <div className="text-text-muted text-sm">
                    Let others contribute their memories and stories
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">🔄</div>
                <div>
                  <div className="text-text-soft font-medium mb-1">
                    Transfer to a family member (optional)
                  </div>
                  <div className="text-text-muted text-sm">
                    You have 60 days as trustee - transfer ownership anytime through settings
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">🌳</div>
                <div>
                  <div className="text-text-soft font-medium mb-1">
                    Adopt into a grove (optional)
                  </div>
                  <div className="text-text-muted text-sm">
                    Move to a private grove for unlimited memories beyond the 100-memory limit
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/grove')}
            className="px-8 py-3 bg-[var(--legacy-amber)] hover:bg-[var(--legacy-glow)] text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Go to Memorial
          </button>

          <div className="mt-8 p-4 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg">
            <div className="text-text-muted text-sm">
              💡 <strong>Tip for funeral homes:</strong> Bookmark <span className="text-firefly-glow">/memorial/create</span> to quickly create memorials for families. You can transfer ownership to them after setup.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MemorialCreatedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-darker flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    }>
      <MemorialCreatedContent />
    </Suspense>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function MemorialCreatedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || 'your loved one'
  const birthDate = searchParams.get('birthDate')
  const deathDate = searchParams.get('deathDate')
  const branchId = searchParams.get('branchId')

  // Format dates for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen">
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

          {/* Grave Marker Style Display */}
          <div className="mb-8 py-8 px-6 bg-bg-dark border border-[var(--legacy-amber)]/30 rounded-lg">
            <div className="text-2xl font-light text-[var(--legacy-text)] mb-3">
              {name}
            </div>
            {birthDate && deathDate && (
              <div className="text-text-muted text-sm">
                {formatDate(birthDate)} ~ {formatDate(deathDate)}
              </div>
            )}
          </div>

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
            onClick={() => router.push(branchId ? `/branch/${branchId}` : '/grove')}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    }>
      <MemorialCreatedContent />
    </Suspense>
  )
}

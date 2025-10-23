import Link from 'next/link'

export default function HomePage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  return (
    <div className="min-h-screen bg-bg-darker flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl font-light text-firefly-glow">
              Firefly Grove
            </h1>
            {isDemoMode && (
              <span className="px-3 py-1 text-xs rounded-full bg-firefly-dim/20 text-firefly-glow border border-firefly-dim/30">
                BETA
              </span>
            )}
          </div>
          <p className="text-xl text-text-soft mb-2">
            Connecting generations through stories that never fade
          </p>
          <p className="text-text-muted">
            Where memories take root and keep growing
          </p>
        </div>

        <div className="mb-12">
          <div className="inline-block p-8">
            <svg width="200" height="150" viewBox="0 0 200 150">
              <circle cx="50" cy="50" r="8" fill="#ffd966" opacity="0.8">
                <animate
                  attributeName="opacity"
                  values="0.4;1;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="100" cy="70" r="6" fill="#ffd966" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.3;0.9;0.3"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="150" cy="50" r="10" fill="#ffd966" opacity="0.9">
                <animate
                  attributeName="opacity"
                  values="0.5;1;0.5"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="80" cy="100" r="7" fill="#ffd966" opacity="0.7">
                <animate
                  attributeName="opacity"
                  values="0.4;0.95;0.4"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="130" cy="110" r="9" fill="#ffd966" opacity="0.75">
                <animate
                  attributeName="opacity"
                  values="0.45;1;0.45"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full max-w-xs mx-auto py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
          >
            Enter Your Grove
          </Link>
          <p className="text-text-muted text-sm">
            A quiet place to remember what matters most
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <div className="text-firefly-glow text-2xl mb-2">🌿</div>
            <h3 className="text-text-soft font-medium mb-2">Branches</h3>
            <p className="text-text-muted text-sm">
              Each person or relationship becomes a branch in your grove.
            </p>
          </div>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <div className="text-firefly-glow text-2xl mb-2">✦</div>
            <h3 className="text-text-soft font-medium mb-2">Memories</h3>
            <p className="text-text-muted text-sm">
              Small moments that glow like fireflies in the night.
            </p>
          </div>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <div className="text-firefly-glow text-2xl mb-2">🔒</div>
            <h3 className="text-text-soft font-medium mb-2">Legacy</h3>
            <p className="text-text-muted text-sm">
              Share memories with loved ones when the time is right.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

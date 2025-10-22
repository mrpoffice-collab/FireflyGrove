'use client'

import { signOut } from 'next-auth/react'

interface HeaderProps {
  userName: string
}

export default function Header({ userName }: HeaderProps) {
  return (
    <header className="bg-bg-dark border-b border-border-subtle">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-firefly-glow text-2xl">✦</span>
            <h1 className="text-xl font-light text-text-soft">Firefly Grove</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-text-muted text-sm">
              {userName}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-text-muted hover:text-text-soft text-sm transition-soft"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

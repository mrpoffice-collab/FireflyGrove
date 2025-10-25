'use client'

import { useEffect, useState } from 'react'

interface Stats {
  trees: number
}

export default function CommunityGoalBanner() {
  const [stats, setStats] = useState<Stats | null>(null)
  const GOAL = 1000000 // 1M trees

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err))
  }, [])

  if (!stats) return null

  const percentage = (stats.trees / GOAL) * 100
  const formattedTrees = stats.trees.toLocaleString()
  const formattedGoal = GOAL.toLocaleString()

  return (
    <div className="bg-firefly-dim/10 border-b border-firefly-dim/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <div className="text-sm">
              <span className="text-firefly-glow font-bold text-lg">{formattedTrees}</span>
              <span className="text-text-muted"> / {formattedGoal} Trees</span>
            </div>
          </div>
          <div className="hidden sm:block text-text-muted">•</div>
          <div className="text-text-muted text-sm">
            Community Goal: 1M by end of 2026
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full max-w-md mx-auto bg-bg-darker rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-firefly-dim to-firefly-glow h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="text-center text-xs text-text-muted mt-1">
          {percentage.toFixed(2)}% complete
        </div>
      </div>
    </div>
  )
}

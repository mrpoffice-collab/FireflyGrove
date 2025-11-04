'use client'

import { useState } from 'react'

interface TreasureWelcomeModalProps {
  onClose: () => void
}

export default function TreasureWelcomeModal({ onClose }: TreasureWelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated border-2 border-firefly-glow rounded-xl max-w-lg w-full p-8 shadow-2xl animate-fadeIn">
        {/* Glowing icon */}
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-pulse">✨</div>
          <h2 className="text-3xl font-light text-firefly-glow mb-2">
            Your Glow Trail Awaits
          </h2>
          <p className="text-text-muted text-sm">New Feature: Treasure Chest</p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8 text-text-soft">
          <p className="leading-relaxed">
            Each night, capture a moment of wisdom, gratitude, or a treasured thought.
            Like fireflies lighting up the darkness, your daily reflections create a glowing trail of memories.
          </p>

          <div className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-firefly-glow text-xl mt-0.5">📜</span>
              <div>
                <div className="text-sm font-medium text-text-soft">Daily Treasures</div>
                <div className="text-xs text-text-muted">End the day with a mindful prompt.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-firefly-glow text-xl mt-0.5">🎙️</span>
              <div>
                <div className="text-sm font-medium text-text-soft">Voice or Text</div>
                <div className="text-xs text-text-muted">Share from the heart—spoken or written.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-firefly-glow text-xl mt-0.5">✨</span>
              <div>
                <div className="text-sm font-medium text-text-soft">Glow Trail</div>
                <div className="text-xs text-text-muted">A quiet chain of days that shine.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-firefly-glow text-xl mt-0.5">🖼️</span>
              <div>
                <div className="text-sm font-medium text-text-soft">Weekly Keepsakes</div>
                <div className="text-xs text-text-muted">Simple, elegant printables for your family.</div>
              </div>
            </div>
          </div>

          <p className="text-sm text-text-muted italic text-center">
            Your treasures are private, passed only to those you choose when the time is right.
          </p>
        </div>

        {/* Call to action */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 bg-firefly-glow hover:bg-firefly-glow/90 text-bg-dark rounded-lg font-medium transition-soft text-lg"
          >
            Start My Glow Trail
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft text-sm transition-soft"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Firefly {
  id: number
  x: number
  y: number
  size: number
  glow: number
  age: number
  duration: number
  delay: number
  color: string
}

interface FireflyGroveProps {
  memoryCount: number
  memoryAges?: number[]
}

export default function FireflyGrove({ memoryCount, memoryAges }: FireflyGroveProps) {
  const [fireflies, setFireflies] = useState<Firefly[]>([])

  // Calculate glow and color based on age
  const getFireflyState = (age: number) => {
    if (age <= 7) {
      // Freshly Kindled - Bright gold
      return {
        glow: 0.95,
        color: '255, 230, 109',
      }
    } else if (age <= 30) {
      // Warmly Glowing - Warm amber
      return {
        glow: 0.8,
        color: '251, 191, 36',
      }
    } else if (age <= 60) {
      // Softly Fading - Gentle gold
      return {
        glow: 0.5,
        color: '217, 158, 54',
      }
    } else {
      // Peaceful Ember - Dim
      return {
        glow: 0.25,
        color: '180, 130, 70',
      }
    }
  }

  useEffect(() => {
    const flies: Firefly[] = []

    for (let i = 0; i < memoryCount; i++) {
      const age = memoryAges?.[i] || Math.random() * 90
      const state = getFireflyState(age)

      flies.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2.5 + Math.random() * 2,
        glow: state.glow,
        age,
        duration: 15 + Math.random() * 15, // Much slower: 15-30 seconds
        delay: Math.random() * 10,
        color: state.color,
      })
    }

    setFireflies(flies)
  }, [memoryCount, memoryAges])

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden border border-[var(--legacy-amber)]/20"
      style={{
        height: '700px',
        background: 'linear-gradient(to bottom, rgba(17, 24, 28, 0.95), rgba(17, 24, 28, 0.85))',
      }}
    >
      {fireflies.map((firefly) => (
        <motion.div
          key={firefly.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${firefly.x}%`,
            top: `${firefly.y}%`,
            width: `${firefly.size * 3}px`,
            height: `${firefly.size * 3}px`,
            background: `radial-gradient(circle, rgba(${firefly.color}, ${firefly.glow}) 0%, rgba(${firefly.color}, ${firefly.glow * 0.4}) 40%, transparent 70%)`,
            boxShadow: `0 0 ${firefly.size * 5}px rgba(${firefly.color}, ${firefly.glow * 0.8}), 0 0 ${firefly.size * 10}px rgba(${firefly.color}, ${firefly.glow * 0.4})`,
          }}
          animate={{
            y: [0, -40, -80, -60, -20, 0],
            x: [0, 25, -15, 30, -10, 0],
            opacity: [
              firefly.glow * 0.3,
              firefly.glow * 0.7,
              firefly.glow,
              firefly.glow * 0.8,
              firefly.glow * 0.6,
              firefly.glow * 0.3,
            ],
            scale: [1, 1.3, 1.1, 1.4, 1.2, 1],
          }}
          transition={{
            duration: firefly.duration,
            delay: firefly.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 bg-bg-dark/80 backdrop-blur-sm border border-[var(--legacy-amber)]/30 rounded px-4 py-3 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFE66D] flex-shrink-0" style={{ boxShadow: '0 0 10px rgba(255, 230, 109, 0.8)' }}></div>
            <span className="text-text-muted">Freshly Kindled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FBBF24] flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div>
            <span className="text-text-muted">Warmly Glowing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D99E36] flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(217, 158, 54, 0.4)' }}></div>
            <span className="text-text-muted">Softly Fading</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#B48246] opacity-50 flex-shrink-0"></div>
            <span className="text-text-muted">Peaceful Ember</span>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Branch {
  id: string
  title: string
  personStatus: string
  lastMemoryDate: string | null
  _count: {
    entries: number
  }
}

interface FireflyCanvasProps {
  branches: Branch[]
}

interface Firefly {
  id: string
  x: number
  y: number
  size: number
  brightness: number
  pulseSpeed: number
  duration: number
  delay: number
  isLegacy: boolean
  recency: string
}

export default function FireflyCanvas({ branches }: FireflyCanvasProps) {
  const [fireflies, setFireflies] = useState<Firefly[]>([])

  // Calculate recency-based brightness
  const getRecencyState = (lastMemoryDate: string | null) => {
    if (!lastMemoryDate) {
      return {
        recency: 'dormant',
        brightness: 0.15,
        pulseSpeed: 0.005,
      }
    }

    const now = Date.now()
    const lastMemory = new Date(lastMemoryDate).getTime()
    const daysSince = (now - lastMemory) / (1000 * 60 * 60 * 24)

    if (daysSince <= 7) {
      return { recency: 'active', brightness: 0.95, pulseSpeed: 0.03 }
    } else if (daysSince <= 90) {
      return { recency: 'warm', brightness: 0.75, pulseSpeed: 0.02 }
    } else if (daysSince <= 365) {
      return { recency: 'quiet', brightness: 0.55, pulseSpeed: 0.015 }
    } else if (daysSince <= 1095) {
      return { recency: 'ember', brightness: 0.35, pulseSpeed: 0.01 }
    } else {
      return { recency: 'sleeping', brightness: 0.2, pulseSpeed: 0.005 }
    }
  }

  useEffect(() => {
    const flies = branches.map((branch) => {
      const isLegacy = branch.personStatus === 'legacy'
      const recencyState = getRecencyState(branch.lastMemoryDate)
      const size = 3 + Math.min(branch._count.entries, 10) * 0.5

      return {
        id: branch.id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        brightness: recencyState.brightness,
        pulseSpeed: recencyState.pulseSpeed,
        duration: isLegacy ? 12 + Math.random() * 8 : 8 + Math.random() * 8, // Legacy moves slower
        delay: Math.random() * 5,
        isLegacy,
        recency: recencyState.recency,
      }
    })
    setFireflies(flies)
  }, [branches])

  return (
    <div
      className="relative w-full h-80 rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {fireflies.map((firefly) => {
        const rgb = firefly.isLegacy
          ? '212, 165, 116' // Legacy amber
          : '255, 217, 102' // Living golden

        return (
          <motion.div
            key={firefly.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${firefly.x}%`,
              top: `${firefly.y}%`,
              width: `${firefly.size * 2}px`,
              height: `${firefly.size * 2}px`,
              background: `radial-gradient(circle, rgba(${rgb}, ${firefly.brightness}) 0%, rgba(${rgb}, ${firefly.brightness * 0.4}) 40%, transparent 70%)`,
              boxShadow: `0 0 ${firefly.size * 3}px rgba(${rgb}, ${firefly.brightness * 0.8}), 0 0 ${firefly.size * 6}px rgba(${rgb}, ${firefly.brightness * 0.4})`,
            }}
            animate={{
              y: [0, -20, -40, -20, 0],
              x: [0, 15, -10, 12, 0],
              opacity: [
                firefly.brightness * 0.3,
                firefly.brightness * 0.8,
                firefly.brightness,
                firefly.brightness * 0.8,
                firefly.brightness * 0.3,
              ],
              scale: [1, 1.15, 1, 1.15, 1],
            }}
            transition={{
              duration: firefly.duration,
              delay: firefly.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}

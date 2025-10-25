'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Firefly {
  id: number
  x: number
  y: number
  delay: number
  duration: number
  size: number
}

export default function FireflyParticles({ count = 20 }: { count?: number }) {
  const [fireflies, setFireflies] = useState<Firefly[]>([])

  useEffect(() => {
    const flies = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 8,
      size: 2 + Math.random() * 4,
    }))
    setFireflies(flies)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {fireflies.map((firefly) => (
        <motion.div
          key={firefly.id}
          className="absolute rounded-full"
          style={{
            left: `${firefly.x}%`,
            top: `${firefly.y}%`,
            width: `${firefly.size}px`,
            height: `${firefly.size}px`,
            background: 'radial-gradient(circle, #ffd700 0%, rgba(255, 215, 0, 0.4) 40%, transparent 70%)',
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)',
          }}
          animate={{
            y: [0, -30, -60, -30, 0],
            x: [0, 20, -10, 15, 0],
            opacity: [0.3, 0.8, 1, 0.8, 0.3],
            scale: [1, 1.2, 1, 1.2, 1],
          }}
          transition={{
            duration: firefly.duration,
            delay: firefly.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

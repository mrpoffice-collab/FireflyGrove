'use client'

import { useEffect, useRef, useState } from 'react'

interface Firefly {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  glow: number // 0 to 1, where 1 is brightest
  age: number // days since memory was created
  pulseOffset: number
}

interface FireflyGroveProps {
  memoryCount: number
  memoryAges?: number[] // ages in days for each memory
}

export default function FireflyGrove({ memoryCount, memoryAges }: FireflyGroveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const firefliesRef = useRef<Firefly[]>([])
  const animationFrameRef = useRef<number>()
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Initialize fireflies
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Update canvas dimensions
    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
      canvas.width = rect.width
      canvas.height = rect.height
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    // Create fireflies
    const fireflies: Firefly[] = []
    for (let i = 0; i < memoryCount; i++) {
      const age = memoryAges?.[i] || Math.random() * 90 // Random age if not provided
      const glow = calculateGlow(age)

      fireflies.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 2,
        glow,
        age,
        pulseOffset: Math.random() * Math.PI * 2,
      })
    }

    firefliesRef.current = fireflies

    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [memoryCount, memoryAges, dimensions.width, dimensions.height])

  // Calculate glow based on age (0-60 days = bright, 60+ = faded)
  const calculateGlow = (age: number): number => {
    if (age <= 60) {
      return 1 - (age / 60) * 0.7 // Fade from 1.0 to 0.3
    }
    return 0.3 - Math.min((age - 60) / 30, 1) * 0.3 // Fade from 0.3 to 0
  }

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0

    const animate = () => {
      time += 0.02

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(17, 24, 28, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const fireflies = firefliesRef.current

      fireflies.forEach((firefly) => {
        // Update position
        firefly.x += firefly.vx
        firefly.y += firefly.vy

        // Bounce off edges
        if (firefly.x < 0 || firefly.x > canvas.width) {
          firefly.vx *= -1
          firefly.x = Math.max(0, Math.min(canvas.width, firefly.x))
        }
        if (firefly.y < 0 || firefly.y > canvas.height) {
          firefly.vy *= -1
          firefly.y = Math.max(0, Math.min(canvas.height, firefly.y))
        }

        // Add slight random movement
        firefly.vx += (Math.random() - 0.5) * 0.05
        firefly.vy += (Math.random() - 0.5) * 0.05

        // Limit velocity
        const maxSpeed = 0.8
        const speed = Math.sqrt(firefly.vx ** 2 + firefly.vy ** 2)
        if (speed > maxSpeed) {
          firefly.vx = (firefly.vx / speed) * maxSpeed
          firefly.vy = (firefly.vy / speed) * maxSpeed
        }

        // Pulsing glow
        const pulse = Math.sin(time + firefly.pulseOffset) * 0.3 + 0.7
        const glowIntensity = firefly.glow * pulse

        if (glowIntensity > 0.05) {
          // Draw firefly glow
          const gradient = ctx.createRadialGradient(
            firefly.x,
            firefly.y,
            0,
            firefly.x,
            firefly.y,
            firefly.size * 8
          )

          // Color based on age
          let color
          if (firefly.age <= 7) {
            // New memories: bright gold
            color = `rgba(255, 230, 109, ${glowIntensity})`
          } else if (firefly.age <= 30) {
            // Recent memories: warm amber
            color = `rgba(251, 191, 36, ${glowIntensity})`
          } else if (firefly.age <= 60) {
            // Fading memories: soft gold
            color = `rgba(217, 158, 54, ${glowIntensity * 0.8})`
          } else {
            // Old memories: dim ember
            color = `rgba(180, 130, 70, ${glowIntensity * 0.5})`
          }

          gradient.addColorStop(0, color)
          gradient.addColorStop(0.3, color.replace(/[\d.]+\)$/g, `${glowIntensity * 0.5})`))
          gradient.addColorStop(1, 'rgba(255, 230, 109, 0)')

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(firefly.x, firefly.y, firefly.size * 8, 0, Math.PI * 2)
          ctx.fill()

          // Draw bright center
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full" style={{ height: '400px' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg border border-[var(--legacy-amber)]/20"
        style={{ background: 'rgba(17, 24, 28, 0.8)' }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-bg-dark/80 backdrop-blur-sm border border-[var(--legacy-amber)]/30 rounded px-4 py-2 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFE66D]" style={{ boxShadow: '0 0 10px rgba(255, 230, 109, 0.8)' }}></div>
            <span className="text-text-muted">New (0-7 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FBBF24]" style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div>
            <span className="text-text-muted">Recent (8-30 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D99E36]" style={{ boxShadow: '0 0 6px rgba(217, 158, 54, 0.4)' }}></div>
            <span className="text-text-muted">Fading (31-60 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#B48246] opacity-50"></div>
            <span className="text-text-muted">Old (60+ days)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

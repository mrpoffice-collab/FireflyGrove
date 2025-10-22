'use client'

import { useEffect, useRef } from 'react'

interface Branch {
  id: string
  title: string
  _count: {
    entries: number
  }
}

interface FireflyCanvasProps {
  branches: Branch[]
}

export default function FireflyCanvas({ branches }: FireflyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    updateSize()

    // Firefly data
    const fireflies = branches.map((branch, i) => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      brightness: 0.5 + (branch._count.entries / 10) * 0.5,
      size: 3 + Math.min(branch._count.entries, 10) * 0.5,
      phase: Math.random() * Math.PI * 2,
    }))

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      fireflies.forEach((firefly, i) => {
        // Update position
        firefly.x += firefly.vx
        firefly.y += firefly.vy

        // Bounce off edges
        if (firefly.x < 0 || firefly.x > canvas.offsetWidth) firefly.vx *= -1
        if (firefly.y < 0 || firefly.y > canvas.offsetHeight) firefly.vy *= -1

        // Keep in bounds
        firefly.x = Math.max(0, Math.min(canvas.offsetWidth, firefly.x))
        firefly.y = Math.max(0, Math.min(canvas.offsetHeight, firefly.y))

        // Pulsing glow
        firefly.phase += 0.02
        const glow = 0.5 + Math.sin(firefly.phase) * 0.5

        // Draw glow
        const gradient = ctx.createRadialGradient(
          firefly.x,
          firefly.y,
          0,
          firefly.x,
          firefly.y,
          firefly.size * 3
        )
        gradient.addColorStop(0, `rgba(255, 217, 102, ${firefly.brightness * glow})`)
        gradient.addColorStop(0.5, `rgba(255, 217, 102, ${firefly.brightness * glow * 0.3})`)
        gradient.addColorStop(1, 'rgba(255, 217, 102, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(firefly.x, firefly.y, firefly.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Draw core
        ctx.fillStyle = `rgba(255, 217, 102, ${0.8 + glow * 0.2})`
        ctx.beginPath()
        ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [branches])

  return (
    <div className="relative w-full h-80 bg-bg-dark rounded-lg border border-border-subtle overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

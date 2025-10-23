'use client'

import { useEffect, useRef } from 'react'

interface Branch {
  id: string
  title: string
  personStatus: string
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
    const fireflies = branches.map((branch, i) => {
      const isLegacy = branch.personStatus === 'legacy'

      return {
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * (isLegacy ? 0.2 : 0.5), // Legacy moves slower
        vy: (Math.random() - 0.5) * (isLegacy ? 0.2 : 0.5),
        brightness: 0.5 + (branch._count.entries / 10) * 0.5,
        size: 3 + Math.min(branch._count.entries, 10) * 0.5,
        phase: Math.random() * Math.PI * 2,
        isLegacy,
        // Blinking behavior
        blinkPhase: Math.random() * Math.PI * 2,
        blinkSpeed: 0.03 + Math.random() * 0.02,
        nextBlinkIn: Math.random() * 400 + 300,
        isBlinking: false,
        blinkDuration: 0,
      }
    })

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      fireflies.forEach((firefly, i) => {
        // Update position (fireflies keep moving even when blinking off)
        firefly.x += firefly.vx
        firefly.y += firefly.vy

        // Bounce off edges
        if (firefly.x < 0 || firefly.x > canvas.offsetWidth) firefly.vx *= -1
        if (firefly.y < 0 || firefly.y > canvas.offsetHeight) firefly.vy *= -1

        // Keep in bounds
        firefly.x = Math.max(0, Math.min(canvas.offsetWidth, firefly.x))
        firefly.y = Math.max(0, Math.min(canvas.offsetHeight, firefly.y))

        // Blinking logic
        if (!firefly.isBlinking) {
          firefly.nextBlinkIn--
          if (firefly.nextBlinkIn <= 0) {
            // Start blinking
            firefly.isBlinking = true
            firefly.blinkDuration = 30 + Math.random() * 30 // Blink for 30-60 frames (0.5-1 second)
            firefly.blinkPhase = 0
          }
        } else {
          firefly.blinkPhase += 0.08 // Faster blink speed
          firefly.blinkDuration--
          if (firefly.blinkDuration <= 0) {
            // Stop blinking
            firefly.isBlinking = false
            firefly.nextBlinkIn = 300 + Math.random() * 400 // Wait 300-700 frames before next blink (5-12 seconds)
          }
        }

        // Pulsing glow (continuous, subtle)
        // Legacy fireflies pulse slower and calmer
        firefly.phase += firefly.isLegacy ? 0.01 : 0.02
        const basePulse = firefly.isLegacy
          ? 0.75 + Math.sin(firefly.phase) * 0.25  // Calmer, more stable
          : 0.7 + Math.sin(firefly.phase) * 0.3

        // Blink effect - firefly disappears completely
        let blinkAlpha = 1
        if (firefly.isBlinking) {
          // Create a sharp blink that goes fully to 0
          const blinkCycle = firefly.blinkPhase % (Math.PI * 2)

          if (blinkCycle < Math.PI) {
            // Fading out - goes from 1 to 0
            blinkAlpha = Math.cos(blinkCycle / 2)
          } else {
            // Fading in - goes from 0 to 1
            blinkAlpha = Math.cos((blinkCycle - Math.PI) / 2)
          }

          // Square the alpha to make the off period more pronounced
          blinkAlpha = Math.max(0, blinkAlpha) ** 2
        }

        // Combine base pulse with blink
        const finalAlpha = basePulse * blinkAlpha

        // Only draw if alpha > 0.01 (firefly completely disappears during blink)
        if (finalAlpha > 0.01) {
          // Legacy fireflies use warm amber-silver glow, living fireflies use golden yellow
          const color = firefly.isLegacy
            ? { r: 212, g: 165, b: 116 }  // --legacy-amber: #d4a574
            : { r: 255, g: 217, b: 102 }  // --firefly-glow: #ffd966

          // Draw glow
          const gradient = ctx.createRadialGradient(
            firefly.x,
            firefly.y,
            0,
            firefly.x,
            firefly.y,
            firefly.size * 3
          )
          gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${firefly.brightness * finalAlpha})`)
          gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${firefly.brightness * finalAlpha * 0.3})`)
          gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(firefly.x, firefly.y, firefly.size * 3, 0, Math.PI * 2)
          ctx.fill()

          // Draw core
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.8 * finalAlpha})`
          ctx.beginPath()
          ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2)
          ctx.fill()
        }
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

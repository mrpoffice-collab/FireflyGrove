'use client'

import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { BlogVideoSection } from '@/lib/blogVideoParser'

interface AudioResult {
  sectionId: string
  audioData: string
  duration: number
  format: string
}

interface BlogVideoRendererProps {
  sections: BlogVideoSection[]
  audioResults: AudioResult[]
  onProgress: (progress: number) => void
  onComplete: (videoBlob: Blob) => void
  onError: (error: string) => void
}

export interface BlogVideoRendererHandle {
  renderVideo: () => void
}

const BlogVideoRenderer = forwardRef<BlogVideoRendererHandle, BlogVideoRendererProps>(
  ({ sections, audioResults, onProgress, onComplete, onError }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [rendering, setRendering] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const audioContextRef = useRef<AudioContext | null>(null)
    const audioElementsRef = useRef<HTMLAudioElement[]>([])

    useImperativeHandle(ref, () => ({
      renderVideo,
    }))

    // Helper to wrap text with max width
    const wrapText = (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ): number => {
      const words = text.split(' ')
      let line = ''
      let currentY = y
      const lines: string[] = []

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          lines.push(line)
          line = words[n] + ' '
        } else {
          line = testLine
        }
      }
      lines.push(line)

      // Draw all lines
      lines.forEach((l) => {
        ctx.fillText(l, x, currentY)
        currentY += lineHeight
      })

      return currentY
    }

    // Draw title slide (blog title + excerpt)
    const drawTitleSlide = (
      ctx: CanvasRenderingContext2D,
      section: BlogVideoSection,
      width: number,
      height: number,
      opacity: number = 1
    ) => {
      // Dark background
      ctx.fillStyle = '#0a0f1e'
      ctx.fillRect(0, 0, width, height)

      // Gradient overlay
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.15)') // firefly-glow
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
      ctx.fillStyle = gradient
      ctx.globalAlpha = opacity
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      // Title
      ctx.fillStyle = '#fbbf24' // firefly-glow
      ctx.font = 'bold 72px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = opacity
      wrapText(ctx, section.heading || '', width / 2, height / 2 - 100, width * 0.8, 90)

      // Subtitle/excerpt
      if (section.text) {
        ctx.fillStyle = '#9ca3af' // text-muted
        ctx.font = '32px Inter, sans-serif'
        wrapText(ctx, section.text, width / 2, height / 2 + 80, width * 0.7, 45)
      }

      ctx.globalAlpha = 1
    }

    // Draw section header slide
    const drawSectionSlide = (
      ctx: CanvasRenderingContext2D,
      section: BlogVideoSection,
      width: number,
      height: number,
      opacity: number = 1
    ) => {
      // Dark background with subtle gradient
      ctx.fillStyle = '#1a1f2e'
      ctx.fillRect(0, 0, width, height)

      // Accent bar
      ctx.fillStyle = '#fbbf24'
      ctx.globalAlpha = opacity * 0.8
      ctx.fillRect(width * 0.1, height / 2 - 3, width * 0.8, 6)
      ctx.globalAlpha = 1

      // Section heading
      ctx.fillStyle = '#e5e7eb' // text-soft
      ctx.font = 'bold 56px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = opacity
      wrapText(ctx, section.heading || section.text, width / 2, height / 2, width * 0.8, 70)
      ctx.globalAlpha = 1
    }

    // Draw content slide (text + optional image)
    const drawContentSlide = (
      ctx: CanvasRenderingContext2D,
      section: BlogVideoSection,
      width: number,
      height: number,
      progress: number = 1
    ) => {
      // Background
      ctx.fillStyle = '#0a0f1e'
      ctx.fillRect(0, 0, width, height)

      // If image exists, show it on the left side
      const hasImage = section.image
      const textStartX = hasImage ? width * 0.55 : width * 0.15
      const textWidth = hasImage ? width * 0.4 : width * 0.7

      // TODO: Load and draw image if available
      // For now, just show colored panel where image would go
      if (hasImage) {
        ctx.fillStyle = '#1a1f2e'
        ctx.fillRect(0, 0, width * 0.5, height)
      }

      // Section heading (small, at top of text area)
      if (section.heading) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 36px Inter, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(section.heading, textStartX, 120)
      }

      // Content bullets/text (animated reveal)
      const bullets = section.text.split('\n').filter(b => b.trim())
      ctx.fillStyle = '#e5e7eb'
      ctx.font = '32px Inter, sans-serif'

      bullets.forEach((bullet, i) => {
        const revealProgress = Math.max(0, Math.min(1, (progress - i * 0.15) / 0.3))
        if (revealProgress > 0) {
          ctx.globalAlpha = revealProgress
          const yPos = 220 + (i * 100)
          wrapText(ctx, `• ${bullet}`, textStartX, yPos, textWidth, 45)
        }
      })

      ctx.globalAlpha = 1
    }

    // Draw CTA slide
    const drawCTASlide = (
      ctx: CanvasRenderingContext2D,
      section: BlogVideoSection,
      width: number,
      height: number,
      opacity: number = 1
    ) => {
      // Dark background with gradient
      ctx.fillStyle = '#0a0f1e'
      ctx.fillRect(0, 0, width, height)

      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.1)')
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
      ctx.fillStyle = gradient
      ctx.globalAlpha = opacity
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      // CTA heading
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 64px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = opacity
      wrapText(ctx, section.heading || 'Get Started', width / 2, height / 2 - 80, width * 0.8, 80)

      // CTA text
      ctx.fillStyle = '#9ca3af'
      ctx.font = '32px Inter, sans-serif'
      wrapText(ctx, section.text, width / 2, height / 2 + 40, width * 0.7, 45)

      // URL/brand
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 40px Inter, sans-serif'
      ctx.fillText('fireflygrove.app', width / 2, height / 2 + 150)

      ctx.globalAlpha = 1
    }

    // Render single frame
    const renderFrame = (
      ctx: CanvasRenderingContext2D,
      section: BlogVideoSection,
      width: number,
      height: number,
      sectionProgress: number
    ) => {
      switch (section.type) {
        case 'title':
          drawTitleSlide(ctx, section, width, height, 1)
          break
        case 'section':
          drawSectionSlide(ctx, section, width, height, 1)
          break
        case 'content':
        case 'quote':
          drawContentSlide(ctx, section, width, height, sectionProgress)
          break
        case 'cta':
          drawCTASlide(ctx, section, width, height, 1)
          break
        default:
          drawContentSlide(ctx, section, width, height, sectionProgress)
      }
    }

    // Main render function
    const renderVideo = async () => {
      if (rendering) return
      if (!canvasRef.current) {
        onError('Canvas not ready')
        return
      }

      setRendering(true)
      chunksRef.current = []

      try {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')

        // Video settings
        const width = 1920
        const height = 1080
        const fps = 30

        canvas.width = width
        canvas.height = height

        // Create audio elements for all sections
        audioElementsRef.current = audioResults.map(result => {
          const audio = new Audio(`data:audio/mp3;base64,${result.audioData}`)
          audio.preload = 'auto'
          return audio
        })

        // Setup MediaRecorder
        const stream = canvas.captureStream(fps)

        // Combine audio streams
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext
        const destination = audioContext.createMediaStreamDestination()

        // Add all audio tracks (they'll play sequentially)
        audioElementsRef.current.forEach(audio => {
          const source = audioContext.createMediaElementSource(audio)
          source.connect(destination)
          source.connect(audioContext.destination)
        })

        // Add audio track to stream
        destination.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track)
        })

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 5000000, // 5 Mbps
        })

        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' })
          onComplete(blob)
          setRendering(false)

          // Cleanup
          audioElementsRef.current.forEach(audio => audio.pause())
          audioContextRef.current?.close()
        }

        mediaRecorder.start()

        // Calculate total frames and duration
        let totalDuration = 0
        const sectionFrames: { section: BlogVideoSection; startFrame: number; frameCount: number; audioIndex: number }[] = []

        sections.forEach((section, index) => {
          const audioResult = audioResults.find(a => a.sectionId === section.id)
          const duration = audioResult ? audioResult.duration : section.duration
          const frameCount = Math.ceil(duration * fps)

          sectionFrames.push({
            section,
            startFrame: Math.floor(totalDuration * fps),
            frameCount,
            audioIndex: index,
          })

          totalDuration += duration
        })

        const totalFrames = Math.ceil(totalDuration * fps)

        console.log(`Rendering ${totalFrames} frames at ${fps} FPS (${totalDuration.toFixed(1)}s total)`)

        // Start rendering frames
        let currentFrame = 0
        let currentSectionIndex = 0
        let currentAudioPlaying = false

        const renderNextFrame = () => {
          if (currentFrame >= totalFrames) {
            mediaRecorder.stop()
            return
          }

          // Find current section
          while (
            currentSectionIndex < sectionFrames.length - 1 &&
            currentFrame >= sectionFrames[currentSectionIndex + 1].startFrame
          ) {
            currentSectionIndex++
            currentAudioPlaying = false
          }

          const currentSectionData = sectionFrames[currentSectionIndex]
          const sectionFrame = currentFrame - currentSectionData.startFrame
          const sectionProgress = sectionFrame / currentSectionData.frameCount

          // Play audio for this section (once)
          if (!currentAudioPlaying && audioElementsRef.current[currentSectionData.audioIndex]) {
            audioElementsRef.current[currentSectionData.audioIndex].play().catch(err => {
              console.error('Audio playback error:', err)
            })
            currentAudioPlaying = true
          }

          // Render frame
          renderFrame(ctx, currentSectionData.section, width, height, sectionProgress)

          // Update progress
          const overallProgress = (currentFrame / totalFrames) * 100
          onProgress(overallProgress)

          currentFrame++

          // Schedule next frame
          setTimeout(renderNextFrame, 1000 / fps)
        }

        // Start rendering
        renderNextFrame()
      } catch (error) {
        console.error('Rendering error:', error)
        onError(error instanceof Error ? error.message : 'Rendering failed')
        setRendering(false)
      }
    }

    return (
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={1920}
        height={1080}
      />
    )
  }
)

BlogVideoRenderer.displayName = 'BlogVideoRenderer'

export default BlogVideoRenderer

'use client'

import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { BlogVideoSection } from '@/lib/blogVideoParser'
import { SectionMedia } from './BlogVideoVisualSelector'

interface AudioResult {
  sectionId: string
  audioData: string
  duration: number
  format: string
}

interface BlogVideoRendererProps {
  sections: BlogVideoSection[]
  audioResults: AudioResult[]
  sectionMedia?: { [sectionId: string]: SectionMedia }
  onProgress: (progress: number) => void
  onComplete: (videoBlob: Blob) => void
  onError: (error: string) => void
}

export interface BlogVideoRendererHandle {
  renderVideo: () => void
}

const BlogVideoRenderer = forwardRef<BlogVideoRendererHandle, BlogVideoRendererProps>(
  ({ sections, audioResults, sectionMedia = {}, onProgress, onComplete, onError }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [rendering, setRendering] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const audioContextRef = useRef<AudioContext | null>(null)
    const audioElementsRef = useRef<HTMLAudioElement[]>([])
    const loadedMediaRef = useRef<{ [sectionId: string]: HTMLImageElement | HTMLVideoElement }>({})

    useImperativeHandle(ref, () => ({
      renderVideo,
    }))

    // Preload all media (images and videos)
    const preloadMedia = async (): Promise<void> => {
      const loadPromises: Promise<void>[] = []

      Object.entries(sectionMedia).forEach(([sectionId, media]) => {
        if (media.type === 'image') {
          const promise = new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              loadedMediaRef.current[sectionId] = img
              resolve()
            }
            img.onerror = () => reject(new Error(`Failed to load image for section ${sectionId}`))
            img.src = media.url
          })
          loadPromises.push(promise)
        } else if (media.type === 'video') {
          const promise = new Promise<void>((resolve, reject) => {
            const video = document.createElement('video')
            video.crossOrigin = 'anonymous'
            video.preload = 'auto'
            video.muted = true
            video.onloadeddata = () => {
              loadedMediaRef.current[sectionId] = video
              resolve()
            }
            video.onerror = () => reject(new Error(`Failed to load video for section ${sectionId}`))
            video.src = media.url
          })
          loadPromises.push(promise)
        }
      })

      await Promise.all(loadPromises)
    }

    // Draw background media for a section
    const drawBackgroundMedia = (
      ctx: CanvasRenderingContext2D,
      sectionId: string,
      width: number,
      height: number,
      style: string,
      progress: number = 1
    ) => {
      const mediaElement = loadedMediaRef.current[sectionId]
      if (!mediaElement) return

      ctx.save()

      if (style === 'full') {
        // Full-screen background
        drawImageCover(ctx, mediaElement, 0, 0, width, height)
        // Add dark overlay for text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fillRect(0, 0, width, height)
      } else if (style === 'background-blur') {
        // Blurred background with sharp image overlay
        ctx.filter = 'blur(20px) brightness(0.6)'
        drawImageCover(ctx, mediaElement, 0, 0, width, height)
        ctx.filter = 'none'
      } else if (style === 'split-left' || style === 'split-right') {
        // Split screen layout
        const imgWidth = width * 0.5
        const imgX = style === 'split-left' ? 0 : width * 0.5
        drawImageCover(ctx, mediaElement, imgX, 0, imgWidth, height)
      } else if (style === 'ken-burns') {
        // Ken Burns effect (slow zoom/pan)
        const scale = 1 + progress * 0.1 // Zoom from 1x to 1.1x
        const offsetX = (width * scale - width) / 2
        const offsetY = (height * scale - height) / 2
        ctx.translate(-offsetX, -offsetY)
        drawImageCover(ctx, mediaElement, 0, 0, width * scale, height * scale)
        ctx.translate(offsetX, offsetY)
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.fillRect(0, 0, width, height)
      }

      ctx.restore()
    }

    // Helper to draw image covering the entire area (object-fit: cover)
    const drawImageCover = (
      ctx: CanvasRenderingContext2D,
      media: HTMLImageElement | HTMLVideoElement,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const mediaWidth = media instanceof HTMLVideoElement ? media.videoWidth : media.width
      const mediaHeight = media instanceof HTMLVideoElement ? media.videoHeight : media.height

      const scale = Math.max(width / mediaWidth, height / mediaHeight)
      const scaledWidth = mediaWidth * scale
      const scaledHeight = mediaHeight * scale
      const offsetX = (width - scaledWidth) / 2
      const offsetY = (height - scaledHeight) / 2

      ctx.drawImage(media, x + offsetX, y + offsetY, scaledWidth, scaledHeight)
    }

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
      const media = sectionMedia[section.id]

      if (media) {
        // Draw background media
        drawBackgroundMedia(ctx, section.id, width, height, media.style, 1)
      } else {
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
      }

      // Title (with shadow for readability)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.fillStyle = '#fbbf24' // firefly-glow
      ctx.font = 'bold 72px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = opacity
      wrapText(ctx, section.heading || '', width / 2, height / 2 - 100, width * 0.8, 90)

      // Subtitle/excerpt
      if (section.text) {
        ctx.fillStyle = '#ffffff' // brighter for better contrast
        ctx.font = '32px Inter, sans-serif'
        wrapText(ctx, section.text, width / 2, height / 2 + 80, width * 0.7, 45)
      }

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

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
      const media = sectionMedia[section.id]

      if (media) {
        // Draw background media
        drawBackgroundMedia(ctx, section.id, width, height, media.style, 1)
      } else {
        // Dark background with subtle gradient
        ctx.fillStyle = '#1a1f2e'
        ctx.fillRect(0, 0, width, height)
      }

      // Accent bar
      ctx.fillStyle = '#fbbf24'
      ctx.globalAlpha = opacity * 0.8
      ctx.fillRect(width * 0.1, height / 2 - 3, width * 0.8, 6)
      ctx.globalAlpha = 1

      // Section heading (with shadow)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 3
      ctx.fillStyle = '#ffffff' // bright white for better contrast
      ctx.font = 'bold 56px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = opacity
      wrapText(ctx, section.heading || section.text, width / 2, height / 2, width * 0.8, 70)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
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
      const media = sectionMedia[section.id]
      const hasMedia = !!media

      if (media) {
        // Draw background media
        drawBackgroundMedia(ctx, section.id, width, height, media.style, progress)
      } else {
        // Background
        ctx.fillStyle = '#0a0f1e'
        ctx.fillRect(0, 0, width, height)
      }

      // Adjust text positioning based on media style
      let textStartX = width * 0.15
      let textWidth = width * 0.7

      if (hasMedia && media.style === 'split-left') {
        textStartX = width * 0.55
        textWidth = width * 0.4
      } else if (hasMedia && media.style === 'split-right') {
        textStartX = width * 0.05
        textWidth = width * 0.4
      }

      // Text shadow for readability over images
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2

      // Section heading (small, at top of text area)
      if (section.heading) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 36px Inter, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(section.heading, textStartX, 120)
      }

      // Content bullets/text (animated reveal)
      const bullets = section.text.split('\n').filter(b => b.trim())
      ctx.fillStyle = '#ffffff'
      ctx.font = '32px Inter, sans-serif'

      bullets.forEach((bullet, i) => {
        const revealProgress = Math.max(0, Math.min(1, (progress - i * 0.15) / 0.3))
        if (revealProgress > 0) {
          ctx.globalAlpha = revealProgress
          const yPos = 220 + (i * 100)
          wrapText(ctx, `• ${bullet}`, textStartX, yPos, textWidth, 45)
        }
      })

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

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
      const media = sectionMedia[section.id]

      if (media) {
        // Draw background media
        drawBackgroundMedia(ctx, section.id, width, height, media.style, 1)
      } else {
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
      }

      // Text shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4

      // CTA heading
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 64px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = opacity
      wrapText(ctx, section.heading || 'Get Started', width / 2, height / 2 - 80, width * 0.8, 80)

      // CTA text
      ctx.fillStyle = '#ffffff'
      ctx.font = '32px Inter, sans-serif'
      wrapText(ctx, section.text, width / 2, height / 2 + 40, width * 0.7, 45)

      // URL/brand
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 40px Inter, sans-serif'
      ctx.fillText('fireflygrove.app', width / 2, height / 2 + 150)

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

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

        // Preload all media (images and videos)
        console.log('Preloading media for', Object.keys(sectionMedia).length, 'sections...')
        await preloadMedia()
        console.log('Media preloaded successfully!')

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

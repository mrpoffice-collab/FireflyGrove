'use client'

import { useRef, useState, forwardRef, useImperativeHandle } from 'react'

interface Photo {
  id: string
  file: File
  url: string
  duration: number
  filter: string
  transition: string
  caption?: string
}

interface VideoSettings {
  introText: string
  introSubtext: string
  outroText: string
  outroSubtext: string
  musicFile: File | null
  photoDuration: number
  transitionDuration: number
  defaultTransition: string
  defaultFilter: string
}

interface VideoRendererProps {
  photos: Photo[]
  settings: VideoSettings
  onProgress: (progress: number) => void
  onComplete: (videoBlob: Blob) => void
  onError: (error: string) => void
}

const VideoRenderer = forwardRef<{ renderVideo: () => void }, VideoRendererProps>(
  ({ photos, settings, onProgress, onComplete, onError }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [rendering, setRendering] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    // Expose renderVideo method to parent
    useImperativeHandle(ref, () => ({
      renderVideo,
    }))

    const applyFilter = (ctx: CanvasRenderingContext2D, filter: string) => {
      switch (filter) {
        case 'bw':
          ctx.filter = 'grayscale(100%)'
          break
        case 'sepia':
          ctx.filter = 'sepia(100%)'
          break
        case 'vintage':
          ctx.filter = 'sepia(50%) contrast(120%) saturate(80%)'
          break
        case 'warm':
          ctx.filter = 'sepia(30%) saturate(130%) brightness(105%)'
          break
        case 'cool':
          ctx.filter = 'hue-rotate(180deg) saturate(80%)'
          break
        default:
          ctx.filter = 'none'
      }
    }

    const drawIntroSlide = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opacity: number = 1
  ) => {
    // Black background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    // Gradient overlay
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)')
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
    ctx.fillStyle = gradient
    ctx.globalAlpha = opacity
    ctx.fillRect(0, 0, width, height)
    ctx.globalAlpha = 1

    // Main title
    if (settings.introText) {
      ctx.fillStyle = '#ffd700'
      ctx.font = `${width * 0.06}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = opacity
      ctx.fillText(settings.introText, width / 2, height / 2 - 40)
    }

    // Subtitle (name and dates)
    if (settings.introSubtext) {
      ctx.fillStyle = '#cccccc'
      ctx.font = `${width * 0.03}px sans-serif`
      ctx.textAlign = 'center'
      ctx.globalAlpha = opacity
      ctx.fillText(settings.introSubtext, width / 2, height / 2 + 40)
    }

    ctx.globalAlpha = 1
  }

  const drawOutroSlide = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opacity: number = 1
  ) => {
    // Black background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    // Main text
    if (settings.outroText) {
      ctx.fillStyle = '#ffd700'
      ctx.font = `${width * 0.05}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = opacity
      ctx.fillText(settings.outroText, width / 2, height / 2 - 30)
    }

    // Subtext
    if (settings.outroSubtext) {
      ctx.fillStyle = '#888888'
      ctx.font = `${width * 0.02}px sans-serif`
      ctx.textAlign = 'center'
      ctx.globalAlpha = opacity
      ctx.fillText(settings.outroSubtext, width / 2, height / 2 + 30)
    }

    ctx.globalAlpha = 1
  }

  const drawCaption = (
    ctx: CanvasRenderingContext2D,
    caption: string,
    width: number,
    height: number,
    scrollProgress: number = 0, // 0 to 1, controls scroll position
    opacity: number = 1
  ) => {
    if (!caption || !caption.trim()) return

    ctx.save()
    ctx.globalAlpha = opacity

    // Larger semi-transparent background bar at bottom
    const barHeight = 200
    const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.8)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, height - barHeight, width, barHeight)

    // Larger caption text
    ctx.fillStyle = '#ffffff'
    const fontSize = width * 0.032 // Increased from 0.024
    ctx.font = `${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    // Word wrap the caption
    const maxWidth = width * 0.9
    const words = caption.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    if (currentLine) {
      lines.push(currentLine)
    }

    // Calculate scroll effect
    const lineHeight = fontSize * 1.4 // Line spacing
    const totalTextHeight = lines.length * lineHeight
    const visibleHeight = barHeight - 40 // Leave padding

    // Calculate scroll offset based on progress
    // Start with text at bottom, scroll up to show all content
    const maxScroll = Math.max(0, totalTextHeight - visibleHeight)
    const scrollOffset = maxScroll * scrollProgress

    // Clip to the caption bar area
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, height - barHeight + 20, width, barHeight - 40)
    ctx.clip()

    // Draw all lines with scroll offset
    const startY = height - barHeight + 30 - scrollOffset

    lines.forEach((line, index) => {
      const y = startY + index * lineHeight

      // Add subtle text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2

      ctx.fillText(line, width / 2, y)
    })

    ctx.restore()
    ctx.restore()
  }

  const drawPhotoWithTransition = async (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
    progress: number,
    transition: string,
    filter: string,
    caption?: string,
    photoDisplayProgress: number = 0 // 0 to 1, how long photo has been displayed
  ) => {
    ctx.save()
    applyFilter(ctx, filter)

    // Calculate aspect-fit dimensions
    const imgAspect = img.width / img.height
    const canvasAspect = width / height
    let drawWidth, drawHeight, drawX, drawY

    if (imgAspect > canvasAspect) {
      drawWidth = width
      drawHeight = width / imgAspect
      drawX = 0
      drawY = (height - drawHeight) / 2
    } else {
      drawHeight = height
      drawWidth = height * imgAspect
      drawX = (width - drawWidth) / 2
      drawY = 0
    }

    // Apply transition effects
    switch (transition) {
      case 'fade':
        ctx.globalAlpha = progress
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        break

      case 'slide':
        const slideX = drawX - (width * (1 - progress))
        ctx.drawImage(img, slideX, drawY, drawWidth, drawHeight)
        break

      case 'zoom':
        const scale = 0.8 + (progress * 0.2)
        const scaledWidth = drawWidth * scale
        const scaledHeight = drawHeight * scale
        const scaledX = drawX - (scaledWidth - drawWidth) / 2
        const scaledY = drawY - (scaledHeight - drawHeight) / 2
        ctx.globalAlpha = progress
        ctx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight)
        break

      case 'kenburns':
        // Slow zoom with slight pan
        const kbScale = 1 + (progress * 0.1)
        const kbWidth = drawWidth * kbScale
        const kbHeight = drawHeight * kbScale
        const panX = progress * (width * 0.05)
        const kbX = drawX - (kbWidth - drawWidth) / 2 + panX
        const kbY = drawY - (kbHeight - drawHeight) / 2
        ctx.drawImage(img, kbX, kbY, kbWidth, kbHeight)
        break

      case 'crossfade':
        ctx.globalAlpha = progress
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        break

      default:
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
    }

    ctx.restore()

    // Draw caption overlay with scrolling if provided
    if (caption) {
      // Calculate scroll progress based on how long photo has been displayed
      // Delay scroll start by 20%, then scroll during middle 60%, hold at end
      let scrollProgress = 0
      if (photoDisplayProgress > 0.2) {
        scrollProgress = Math.min(1, (photoDisplayProgress - 0.2) / 0.6)
      }

      drawCaption(ctx, caption, width, height, scrollProgress, 1)
    }
  }

  const renderVideo = async () => {
    const canvas = canvasRef.current
    if (!canvas) {
      onError('Canvas not found')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onError('Could not get canvas context')
      return
    }

    setRendering(true)
    const width = 1920
    const height = 1080
    canvas.width = width
    canvas.height = height

    try {
      // Set up MediaRecorder
      const stream = canvas.captureStream(30) // 30 FPS

      // Add audio track if music is provided
      if (settings.musicFile) {
        const audioUrl = URL.createObjectURL(settings.musicFile)
        const audio = new Audio(audioUrl)
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaElementSource(audio)
        const dest = audioCtx.createMediaStreamDestination()
        source.connect(dest)
        source.connect(audioCtx.destination)

        // Add audio track to stream
        dest.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track)
        })

        audio.play()
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000, // 5 Mbps for high quality
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        onComplete(blob)
        setRendering(false)
      }

      mediaRecorder.start(100) // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder

      console.log('[VideoRenderer] Starting video generation with', photos.length, 'photos')

      // Load all images
      const loadedImages = await Promise.all(
        photos.map(
          (photo) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image()
              img.crossOrigin = 'anonymous' // Enable CORS for external images
              img.onload = () => resolve(img)
              img.onerror = (error) => {
                console.error('Failed to load image:', photo.url, error)
                reject(new Error(`Failed to load image: ${photo.url}`))
              }
              img.src = photo.url
            })
        )
      )

      console.log('[VideoRenderer] All images loaded successfully')

      const fps = 30
      const frameDuration = 1000 / fps
      let currentFrame = 0
      let isRendering = true // Use local flag instead of state

      // Calculate total frames
      const introFrames = 90 // 3 seconds
      const outroFrames = 90 // 3 seconds
      const transitionFrames = Math.floor(settings.transitionDuration * fps)
      const photoFrames = Math.floor(settings.photoDuration * fps)
      const totalPhotoFrames = photos.length * (photoFrames + transitionFrames)
      const totalFrames = introFrames + totalPhotoFrames + outroFrames

      console.log('[VideoRenderer] Total frames:', totalFrames, '| Duration:', Math.ceil(totalFrames / fps), 'seconds')

      // Animation loop
      const renderFrame = () => {
        if (!isRendering) return

        currentFrame++
        const frameProgress = currentFrame / totalFrames
        onProgress(frameProgress * 100)

        // Log progress every 30 frames (every second)
        if (currentFrame % 30 === 0) {
          console.log('[VideoRenderer] Progress:', Math.round(frameProgress * 100) + '%', '| Frame:', currentFrame, '/', totalFrames)
        }

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Render intro
        if (currentFrame <= introFrames) {
          const introProgress = currentFrame / introFrames
          drawIntroSlide(ctx, width, height, Math.min(1, introProgress * 2))
        }
        // Render photos
        else if (currentFrame <= introFrames + totalPhotoFrames) {
          const photoFrame = currentFrame - introFrames
          const currentPhotoIndex = Math.floor(photoFrame / (photoFrames + transitionFrames))
          const frameInPhoto = photoFrame % (photoFrames + transitionFrames)

          if (currentPhotoIndex < photos.length) {
            const photo = photos[currentPhotoIndex]
            const img = loadedImages[currentPhotoIndex]
            const isTransitioning = frameInPhoto < transitionFrames
            const transitionProgress = isTransitioning
              ? frameInPhoto / transitionFrames
              : 1

            // Calculate how long the photo has been displayed (0 to 1)
            // This is used for scrolling the caption
            const photoDisplayProgress = frameInPhoto / (photoFrames + transitionFrames)

            // Draw previous photo fading out during transition
            if (isTransitioning && currentPhotoIndex > 0) {
              const prevImg = loadedImages[currentPhotoIndex - 1]
              const prevPhoto = photos[currentPhotoIndex - 1]
              drawPhotoWithTransition(
                ctx,
                prevImg,
                width,
                height,
                1 - transitionProgress,
                prevPhoto.transition,
                prevPhoto.filter,
                prevPhoto.caption,
                1 // Previous photo is fully displayed
              )
            }

            // Draw current photo
            drawPhotoWithTransition(
              ctx,
              img,
              width,
              height,
              transitionProgress,
              photo.transition,
              photo.filter,
              photo.caption,
              photoDisplayProgress
            )
          }
        }
        // Render outro
        else {
          const outroFrame = currentFrame - introFrames - totalPhotoFrames
          const outroProgress = outroFrame / outroFrames
          drawOutroSlide(ctx, width, height, Math.min(1, outroProgress * 2))
        }

        // Continue or finish
        if (currentFrame < totalFrames) {
          setTimeout(renderFrame, frameDuration)
        } else {
          mediaRecorder.stop()
        }
      }

      // Start rendering
      renderFrame()
    } catch (error) {
      console.error('Rendering error:', error)
      onError(error instanceof Error ? error.message : 'Failed to render video')
      setRendering(false)

      // Stop media recorder if it was started
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }

    return (
      <div className="hidden">
        <canvas ref={canvasRef} />
      </div>
    )
  }
)

VideoRenderer.displayName = 'VideoRenderer'

export { VideoRenderer }

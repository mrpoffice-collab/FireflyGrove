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

  const drawPhotoWithTransition = async (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
    progress: number,
    transition: string,
    filter: string
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

      // Load all images
      const loadedImages = await Promise.all(
        photos.map(
          (photo) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image()
              img.onload = () => resolve(img)
              img.onerror = reject
              img.src = photo.url
            })
        )
      )

      const fps = 30
      const frameDuration = 1000 / fps
      let currentFrame = 0

      // Calculate total frames
      const introFrames = 90 // 3 seconds
      const outroFrames = 90 // 3 seconds
      const transitionFrames = Math.floor(settings.transitionDuration * fps)
      const photoFrames = Math.floor(settings.photoDuration * fps)
      const totalPhotoFrames = photos.length * (photoFrames + transitionFrames)
      const totalFrames = introFrames + totalPhotoFrames + outroFrames

      // Animation loop
      const renderFrame = () => {
        if (!rendering) return

        currentFrame++
        const frameProgress = currentFrame / totalFrames
        onProgress(frameProgress * 100)

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
                prevPhoto.filter
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
              photo.filter
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

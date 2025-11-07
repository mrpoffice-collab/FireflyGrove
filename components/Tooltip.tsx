'use client'

import { ReactNode, useState, useRef, useEffect, cloneElement, isValidElement } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const updateTooltipPosition = () => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const offset = 8 // Distance from the element

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = rect.top - offset
        left = rect.left + rect.width / 2
        break
      case 'bottom':
        top = rect.bottom + offset
        left = rect.left + rect.width / 2
        break
      case 'left':
        top = rect.top + rect.height / 2
        left = rect.left - offset
        break
      case 'right':
        top = rect.top + rect.height / 2
        left = rect.right + offset
        break
    }

    setTooltipStyle({
      top: `${top}px`,
      left: `${left}px`,
    })
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    triggerRef.current = e.currentTarget as HTMLElement
    timeoutRef.current = setTimeout(() => {
      updateTooltipPosition()
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const getTransformOrigin = () => {
    switch (position) {
      case 'top':
        return 'bottom center'
      case 'bottom':
        return 'top center'
      case 'left':
        return 'right center'
      case 'right':
        return 'left center'
      default:
        return 'bottom center'
    }
  }

  const getTransform = () => {
    switch (position) {
      case 'top':
        return 'translate(-50%, -100%)'
      case 'bottom':
        return 'translate(-50%, 0)'
      case 'left':
        return 'translate(-100%, -50%)'
      case 'right':
        return 'translate(0, -50%)'
      default:
        return 'translate(-50%, -100%)'
    }
  }

  // Clone the child element and add mouse event handlers
  const wrappedChild = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        onMouseEnter: (e: React.MouseEvent) => {
          handleMouseEnter(e)
          // Call original handler if it exists
          const originalOnMouseEnter = (children as any).props?.onMouseEnter
          if (originalOnMouseEnter) originalOnMouseEnter(e)
        },
        onMouseLeave: (e: React.MouseEvent) => {
          handleMouseLeave()
          // Call original handler if it exists
          const originalOnMouseLeave = (children as any).props?.onMouseLeave
          if (originalOnMouseLeave) originalOnMouseLeave(e)
        },
      })
    : children

  return (
    <>
      {wrappedChild}
      {isVisible && (
        <div
          className="fixed z-[9999] px-3 py-2 text-sm bg-[#0f1419] border border-firefly-glow/40 text-text-soft rounded-md shadow-2xl whitespace-nowrap pointer-events-none animate-fadeIn"
          style={{
            ...tooltipStyle,
            transform: getTransform(),
            transformOrigin: getTransformOrigin(),
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  )
}

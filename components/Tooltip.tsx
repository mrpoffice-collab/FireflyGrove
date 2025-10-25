'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'

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
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top,
        })
      }
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    }
  }

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-t-bg-darker border-l-transparent border-r-transparent border-b-transparent'
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-bg-darker border-l-transparent border-r-transparent border-t-transparent'
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-bg-darker border-t-transparent border-b-transparent border-r-transparent'
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-bg-darker border-t-transparent border-b-transparent border-l-transparent'
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-bg-darker border-l-transparent border-r-transparent border-b-transparent'
    }
  }

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm
            bg-bg-darker border border-firefly-dim/30
            text-text-soft rounded-md shadow-lg
            whitespace-nowrap pointer-events-none
            animate-fadeIn
            ${getPositionClasses()}
          `}
          role="tooltip"
        >
          {content}
          <div
            className={`
              absolute w-0 h-0
              border-4
              ${getArrowClasses()}
            `}
          />
        </div>
      )}
    </div>
  )
}

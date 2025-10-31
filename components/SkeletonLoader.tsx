'use client'

/**
 * Skeleton Loader Components
 *
 * Reusable skeleton loading UI components for various content types
 */

interface SkeletonProps {
  className?: string
}

export function SkeletonBox({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-bg-darker via-border-subtle to-bg-darker bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 2s infinite linear',
      }}
    />
  )
}

export function SkeletonText({ className = '' }: SkeletonProps) {
  return <SkeletonBox className={`h-4 ${className}`} />
}

export function SkeletonTitle({ className = '' }: SkeletonProps) {
  return <SkeletonBox className={`h-8 ${className}`} />
}

export function SkeletonCircle({ className = '' }: SkeletonProps) {
  return <SkeletonBox className={`rounded-full ${className}`} />
}

/**
 * Skeleton Card - Generic card layout
 */
export function SkeletonCard() {
  return (
    <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
      <div className="flex items-start gap-4">
        <SkeletonCircle className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonTitle className="w-3/4" />
          <SkeletonText className="w-full" />
          <SkeletonText className="w-5/6" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Tree Card - For Grove page tree cards
 */
export function SkeletonTreeCard() {
  return (
    <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/30 transition-soft">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <SkeletonTitle className="w-48 mb-2" />
          <SkeletonText className="w-64 mb-1" />
          <SkeletonText className="w-32" />
        </div>
        <SkeletonCircle className="w-10 h-10" />
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
        <div className="flex-1">
          <SkeletonText className="w-24 mb-1" />
          <SkeletonText className="w-16" />
        </div>
        <div className="flex-1">
          <SkeletonText className="w-24 mb-1" />
          <SkeletonText className="w-16" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Person Card - For Grove page person cards
 */
export function SkeletonPersonCard() {
  return (
    <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/30 transition-soft">
      <div className="flex items-center gap-4 mb-4">
        <SkeletonCircle className="w-16 h-16" />
        <div className="flex-1">
          <SkeletonTitle className="w-40 mb-2" />
          <SkeletonText className="w-32" />
        </div>
      </div>
      <div className="flex items-center gap-4 pt-4 border-t border-border-subtle">
        <div className="flex-1">
          <SkeletonText className="w-20 mb-1" />
          <SkeletonText className="w-12" />
        </div>
        <div className="flex-1">
          <SkeletonText className="w-20 mb-1" />
          <SkeletonText className="w-12" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Memory Card - For branch page memory entries
 */
export function SkeletonMemoryCard() {
  return (
    <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <SkeletonCircle className="w-10 h-10" />
        <div className="flex-1">
          <SkeletonText className="w-32 mb-2" />
          <SkeletonText className="w-24" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <SkeletonText className="w-full" />
        <SkeletonText className="w-full" />
        <SkeletonText className="w-3/4" />
      </div>
      <SkeletonBox className="w-full h-64 mb-4" />
      <div className="flex items-center gap-4">
        <SkeletonText className="w-20" />
        <SkeletonText className="w-20" />
        <SkeletonText className="w-20" />
      </div>
    </div>
  )
}

/**
 * Skeleton List - Generic list of skeleton items
 */
export function SkeletonList({ count = 3, ItemComponent = SkeletonCard }: { count?: number; ItemComponent?: React.ComponentType }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ItemComponent key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton Grid - Grid layout of skeleton items
 */
export function SkeletonGrid({ count = 6, ItemComponent = SkeletonCard, columns = 3 }: { count?: number; ItemComponent?: React.ComponentType; columns?: number }) {
  const gridClass = columns === 2 ? 'grid-cols-1 md:grid-cols-2' : columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ItemComponent key={i} />
      ))}
    </div>
  )
}

/**
 * Add shimmer animation to global styles
 * This should be added to tailwind.config.js or global CSS
 */

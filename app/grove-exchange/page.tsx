'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  icon: string
  price: string
  href: string
  badge?: string
  badgeColor?: string
}

export default function GroveExchangePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const products: Product[] = [
    {
      id: 'video-collage',
      name: 'Memorial Video Collage',
      description: 'Create beautiful video tributes from your memories. Combine photos, stories, and music into a lasting memorial video.',
      icon: '🎬',
      price: 'Complimentary',
      href: '/video-collage',
      badge: 'Complimentary',
      badgeColor: 'bg-green-500/20 text-success-text border-green-500/30',
    },
    {
      id: 'sound-wave-art',
      name: 'Sound Wave Art',
      description: 'Turn voices, music, or special moments into beautiful scannable artwork. Perfect for gifts and keepsakes.',
      icon: '🎵',
      price: 'Complimentary',
      href: '/soundart',
      badge: 'Complimentary',
      badgeColor: 'bg-green-500/20 text-success-text border-green-500/30',
    },
    {
      id: 'forever-kit',
      name: 'Forever Kit Export',
      description: 'Download a complete backup of your memories in multiple formats. Keep your legacy safe beyond the cloud.',
      icon: '📦',
      price: 'Included',
      href: '/forever-kit',
      badge: 'Included',
      badgeColor: 'bg-firefly-dim/20 text-firefly-glow border-firefly-dim/30',
    },
    {
      id: 'greeting-cards',
      name: 'Greeting Card Hub',
      description: 'Send heartfelt digital cards via email. Physical printed cards coming soon with transparent pricing.',
      icon: '💌',
      price: '$0.99 - $2.99',
      href: '/cards',
      badge: 'New',
      badgeColor: 'bg-firefly-dim/20 text-firefly-glow border-firefly-dim/30',
    },
    {
      id: 'photo-books',
      name: 'Custom Photo Books',
      description: 'Turn your digital memories into beautiful printed keepsakes. Professional quality photo books delivered to your door.',
      icon: '📚',
      price: 'Coming Soon',
      href: '#',
      badge: 'Coming Soon',
      badgeColor: 'bg-blue-500/20 text-info-text border-blue-500/30',
    },
    {
      id: 'memorial-prints',
      name: 'Memorial Prints',
      description: 'High-quality prints of your cherished photos. Frame-ready, archival quality paper that lasts generations.',
      icon: '🖼️',
      price: 'Coming Soon',
      href: '#',
      badge: 'Coming Soon',
      badgeColor: 'bg-blue-500/20 text-info-text border-blue-500/30',
    },
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">🏪</span>
              <h1 className="text-4xl font-light text-text-soft">
                The Grove Exchange
              </h1>
            </div>
            <p className="text-text-muted text-lg">
              Treasures born from memory — crafted to keep love glowing.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={product.href}
                className={`
                  bg-bg-dark border border-border-subtle rounded-lg p-6
                  hover:border-firefly-dim/50 transition-soft
                  ${product.href === '#' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                `}
                onClick={(e) => {
                  if (product.href === '#') {
                    e.preventDefault()
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{product.icon}</div>
                  {product.badge && (
                    <span className={`px-2 py-1 text-xs rounded border ${product.badgeColor}`}>
                      {product.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl text-text-soft font-medium mb-2">
                  {product.name}
                </h3>

                <p className="text-text-muted text-sm mb-4">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-firefly-glow font-medium">
                    {product.price}
                  </span>
                  {product.href !== '#' && (
                    <span className="text-text-muted text-sm">
                      View →
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-bg-dark border border-border-subtle rounded-lg p-6">
            <h2 className="text-lg text-text-soft font-medium mb-3">
              About The Grove Exchange
            </h2>
            <div className="text-text-muted text-sm space-y-2">
              <p>
                The Grove Exchange offers carefully selected products and services to complement your digital grove.
                From free tools like video collages to premium printed keepsakes, we're building a collection
                of ways to preserve and share your family's story.
              </p>
              <p>
                All products are optional. Your subscription includes everything you need to maintain your grove.
                These are simply additional ways to experience and share your memories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

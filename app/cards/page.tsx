'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Header from '@/components/Header'

export default function GreetingCardsPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen">
      {session && <Header userName={session.user?.name || ''} />}

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-bg-dark to-bg-darker py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">💌</div>
            <h1 className="text-5xl font-light text-firefly-glow mb-6">
              Greeting Card Hub
            </h1>
            <p className="text-xl text-text-soft mb-4">
              Send heartfelt cards with photos from your grove
            </p>
            <p className="text-lg text-text-muted mb-8">
              Digital delivery or professionally printed and mailed — perfect for every occasion
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cards/create"
                className="px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft"
              >
                Create Your Card
              </Link>
              {session && (
                <Link
                  href="/cards/orders"
                  className="px-8 py-4 bg-bg-elevated border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium text-lg transition-soft"
                >
                  View Orders
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-text-soft text-center mb-12">
            Two Ways to Send
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Digital Cards */}
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-2xl text-firefly-glow font-medium mb-4">
                Digital Delivery
              </h3>
              <p className="text-text-muted mb-6">
                Instant delivery via email with a beautiful shareable link
              </p>

              <ul className="space-y-3 text-text-soft text-sm mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-firefly-glow">✓</span>
                  <span>Sent instantly to recipient's email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-firefly-glow">✓</span>
                  <span>Track when they view your card</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-firefly-glow">✓</span>
                  <span>Beautiful animated firefly effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-firefly-glow">✓</span>
                  <span>Can be viewed anytime, anywhere</span>
                </li>
              </ul>

              <div className="border-t border-border-subtle pt-6">
                <p className="text-firefly-glow text-2xl font-medium mb-4">
                  Complimentary for Grove Owners
                </p>
                <p className="text-text-muted text-sm mb-6">
                  Create your first memory to unlock complimentary cards
                </p>
                <Link
                  href="/cards/create"
                  className="inline-block px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                >
                  Create Your Card →
                </Link>
              </div>
            </div>

            {/* Physical Cards */}
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-8 opacity-60">
              <div className="text-5xl mb-4">📮</div>
              <h3 className="text-2xl text-firefly-glow font-medium mb-4">
                Printed & Mailed
              </h3>
              <p className="text-text-muted mb-6">
                Coming soon - we're finding a print partner with transparent pricing
              </p>

              <ul className="space-y-3 text-text-soft text-sm mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-text-muted">•</span>
                  <span>High-quality professional printing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-muted">•</span>
                  <span>Mailed directly to recipient</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-muted">•</span>
                  <span>USPS tracking included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-muted">•</span>
                  <span>Arrives in 3-5 business days</span>
                </li>
              </ul>

              <p className="text-text-muted text-lg font-medium">
                Coming Soon
              </p>
            </div>
          </div>

          {/* Categories */}
          <h2 className="text-3xl font-light text-text-soft text-center mb-12">
            Cards for Every Occasion
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: '🕯️', name: 'Sympathy' },
              { icon: '🎂', name: 'Birthday' },
              { icon: '🎄', name: 'Holiday' },
              { icon: '💐', name: 'Thank You' },
              { icon: '💭', name: 'Thinking of You' },
              { icon: '💒', name: 'Anniversary' },
              { icon: '🌱', name: 'New Baby' },
              { icon: '🎓', name: 'Graduation' },
              { icon: '🌅', name: 'Encouragement' },
              { icon: '✨', name: 'Friendship' },
              { icon: '🐾', name: 'Pet Remembrance' },
              { icon: '💛', name: 'Just Because' },
            ].map((category) => (
              <div
                key={category.name}
                className="bg-bg-dark border border-border-subtle rounded-lg p-6 text-center"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <p className="text-text-soft text-sm">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import Header from '@/components/Header'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with email service (Resend, ConvertKit, etc.)
    console.log('Email submitted:', email)
    setSubscribed(true)
    setTimeout(() => {
      setSubscribed(false)
      setEmail('')
    }, 3000)
  }

  return (
    <div className="min-h-screen">
      <Header userName="" />

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-firefly-glow/10 border border-firefly-glow/30 rounded-full mb-6">
              <span className="text-firefly-glow text-sm font-medium">🌟 Preserve Your Family Legacy Forever</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-light text-text-soft mb-6 leading-tight">
              Where Memories Take Root<br />
              <span className="text-firefly-glow">and Keep Growing</span>
            </h1>

            <p className="text-xl md:text-2xl text-text-muted mb-8 max-w-3xl mx-auto">
              Create a beautiful digital legacy for your family. Preserve photos, videos, voices, and stories.
              Build memorial tributes and share across generations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/signup"
                className="px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft inline-block"
              >
                Start Your Grove Free →
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-bg-elevated hover:bg-bg-darker border border-border-subtle text-text-soft rounded-lg font-medium text-lg transition-soft inline-block"
              >
                See How It Works
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-text-muted text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success-text" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success-text" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success-text" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-4 py-16 bg-bg-elevated border-y border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-text-muted mb-6">Trusted by families worldwide to preserve their most precious memories</p>
            <div className="flex items-center justify-center gap-12 flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-light text-firefly-glow mb-1">500+</div>
                <div className="text-text-muted text-sm">Families</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-firefly-glow mb-1">10,000+</div>
                <div className="text-text-muted text-sm">Memories Preserved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-firefly-glow mb-1">4.9/5</div>
                <div className="text-text-muted text-sm">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-text-soft mb-4">
              Everything You Need to Preserve Your <span className="text-firefly-glow">Legacy</span>
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Powerful features designed to help families preserve, organize, and share their most precious memories
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8 hover:border-firefly-dim/50 transition-soft">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-xl font-medium text-text-soft mb-3">Branch Organization</h3>
              <p className="text-text-muted mb-4">
                Organize memories by person, relationship, or timeline. Each branch grows with your family's story.
              </p>
              <Link href="/signup" className="text-firefly-glow hover:text-firefly-bright text-sm font-medium">
                Learn more →
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8 hover:border-firefly-dim/50 transition-soft">
              <div className="text-4xl mb-4">🎥</div>
              <h3 className="text-xl font-medium text-text-soft mb-3">Memorial Videos</h3>
              <p className="text-text-muted mb-4">
                AI-generated video tributes with music, captions, and beautiful transitions. Honor loved ones beautifully.
              </p>
              <Link href="/memorial/create" className="text-firefly-glow hover:text-firefly-bright text-sm font-medium">
                Create free memorial →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8 hover:border-firefly-dim/50 transition-soft">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-medium text-text-soft mb-3">Sound Wave Art</h3>
              <p className="text-text-muted mb-4">
                Transform voices into beautiful, scannable artwork. Preserve "I love you" forever as wall art with QR codes.
              </p>
              <Link href="/soundart" className="text-firefly-glow hover:text-firefly-bright text-sm font-medium">
                Try it free →
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8 hover:border-firefly-dim/50 transition-soft">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-medium text-text-soft mb-3">Photo & Video Storage</h3>
              <p className="text-text-muted mb-4">
                Unlimited storage for your precious photos and videos. Organize, search, and share easily.
              </p>
              <Link href="/signup" className="text-firefly-glow hover:text-firefly-bright text-sm font-medium">
                Get started →
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8 hover:border-firefly-dim/50 transition-soft">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-medium text-text-soft mb-3">Heir Management</h3>
              <p className="text-text-muted mb-4">
                Designate heirs to inherit your digital legacy. Ensure memories pass down through generations.
              </p>
              <Link href="/signup" className="text-firefly-glow hover:text-firefly-bright text-sm font-medium">
                Secure your legacy →
              </Link>
            </div>

            {/* Feature 6 */}
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8 hover:border-firefly-dim/50 transition-soft">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-medium text-text-soft mb-3">Private & Secure</h3>
              <p className="text-text-muted mb-4">
                Bank-level encryption. Your memories are private by default. Share only what you choose, when you choose.
              </p>
              <Link href="/signup" className="text-firefly-glow hover:text-firefly-bright text-sm font-medium">
                See security →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-24 bg-bg-elevated">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-text-soft mb-4">
              Stories from Our <span className="text-firefly-glow">Community</span>
            </h2>
            <p className="text-xl text-text-muted">
              See how families are preserving their legacy with Firefly Grove
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-bg-dark border border-border-subtle rounded-xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-firefly-glow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-muted mb-4">
                "The sound wave art feature is incredible. I recorded my grandmother saying 'I love you' before she passed. Now it's a beautiful piece of art we can scan anytime to hear her voice."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-firefly-dim/20 rounded-full flex items-center justify-center text-firefly-glow">
                  SM
                </div>
                <div>
                  <div className="text-text-soft font-medium">Sarah M.</div>
                  <div className="text-text-muted text-sm">Family Grove Owner</div>
                </div>
              </div>
            </div>

            <div className="bg-bg-dark border border-border-subtle rounded-xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-firefly-glow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-muted mb-4">
                "Finally, a place to organize all our family photos and videos. The memorial video feature helped us create a beautiful tribute for my father's celebration of life."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-firefly-dim/20 rounded-full flex items-center justify-center text-firefly-glow">
                  JT
                </div>
                <div>
                  <div className="text-text-soft font-medium">James T.</div>
                  <div className="text-text-muted text-sm">Family Historian</div>
                </div>
              </div>
            </div>

            <div className="bg-bg-dark border border-border-subtle rounded-xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-firefly-glow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-muted mb-4">
                "Knowing that my children and grandchildren will have access to all these stories and photos gives me such peace. This is the legacy I want to leave behind."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-firefly-dim/20 rounded-full flex items-center justify-center text-firefly-glow">
                  LP
                </div>
                <div>
                  <div className="text-text-soft font-medium">Linda P.</div>
                  <div className="text-text-muted text-sm">Grandmother of 8</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-text-soft mb-6">
            Start Preserving Your Family's <span className="text-firefly-glow">Story Today</span>
          </h2>
          <p className="text-xl text-text-muted mb-8">
            Join hundreds of families who trust Firefly Grove to preserve their most precious memories
          </p>

          {/* Email Capture Form */}
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Get Started
              </button>
            </div>
            {subscribed && (
              <p className="text-success-text text-sm mt-2">✓ Thanks! We'll be in touch soon.</p>
            )}
          </form>

          <p className="text-text-muted text-sm mb-8">
            No credit card required • Free forever plan available
          </p>

          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft"
          >
            Create Your Free Grove →
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-24 bg-bg-elevated">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-text-soft mb-4">
              Frequently Asked <span className="text-firefly-glow">Questions</span>
            </h2>
          </div>

          <div className="space-y-6">
            <details className="bg-bg-dark border border-border-subtle rounded-lg p-6 group">
              <summary className="text-lg font-medium text-text-soft cursor-pointer list-none flex items-center justify-between">
                Is Firefly Grove really free?
                <span className="text-firefly-glow group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-text-muted mt-4">
                Yes! We offer a generous free forever plan that includes basic memory storage and organization.
                Premium features like unlimited storage, memorial videos, and sound wave art are available with paid plans starting at just $9/month.
              </p>
            </details>

            <details className="bg-bg-dark border border-border-subtle rounded-lg p-6 group">
              <summary className="text-lg font-medium text-text-soft cursor-pointer list-none flex items-center justify-between">
                How secure is my data?
                <span className="text-firefly-glow group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-text-muted mt-4">
                Your memories are protected with bank-level encryption. All data is stored securely and backed up regularly.
                Your content is private by default - you control exactly what gets shared and with whom.
              </p>
            </details>

            <details className="bg-bg-dark border border-border-subtle rounded-lg p-6 group">
              <summary className="text-lg font-medium text-text-soft cursor-pointer list-none flex items-center justify-between">
                What happens to my memories if something happens to me?
                <span className="text-firefly-glow group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-text-muted mt-4">
                You can designate heirs who will inherit access to your digital legacy. We also offer automated backup and export features
                so you always have a copy of your memories. Your family's stories will be preserved for generations.
              </p>
            </details>

            <details className="bg-bg-dark border border-border-subtle rounded-lg p-6 group">
              <summary className="text-lg font-medium text-text-soft cursor-pointer list-none flex items-center justify-between">
                Can I export my data?
                <span className="text-firefly-glow group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-text-muted mt-4">
                Absolutely! You can export all your memories, photos, and videos at any time. We believe your data is yours -
                we're just here to help you preserve and organize it beautifully.
              </p>
            </details>

            <details className="bg-bg-dark border border-border-subtle rounded-lg p-6 group">
              <summary className="text-lg font-medium text-text-soft cursor-pointer list-none flex items-center justify-between">
                How does the sound wave art work?
                <span className="text-firefly-glow group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-text-muted mt-4">
                Upload or record any audio (like a loved one's voice), and we'll transform it into beautiful artwork.
                We generate a unique QR code that's embedded in the image - scan it to play the audio. Perfect for gifts,
                memorials, or preserving special moments as wall art.
              </p>
            </details>

            <details className="bg-bg-dark border border-border-subtle rounded-lg p-6 group">
              <summary className="text-lg font-medium text-text-soft cursor-pointer list-none flex items-center justify-between">
                Can I cancel anytime?
                <span className="text-firefly-glow group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-text-muted mt-4">
                Yes, you can cancel your subscription at any time with no penalties. You'll still have access to your free plan features,
                and all your memories remain safe and accessible.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-text-soft mb-6">
            Your Family's Story Deserves to Be <span className="text-firefly-glow">Remembered</span>
          </h2>
          <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
            Start preserving your legacy today. It takes less than 2 minutes to get started.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft"
          >
            Create Your Free Grove →
          </Link>
          <p className="text-text-muted text-sm mt-4">
            Join 500+ families preserving their memories
          </p>
        </div>
      </section>
    </div>
  )
}

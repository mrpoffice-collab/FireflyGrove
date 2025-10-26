'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ViewCardPage() {
  const params = useParams()
  const code = params.code as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCard()
  }, [code])

  const fetchCard = async () => {
    try {
      const res = await fetch(`/api/cards/view/${code}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (error) {
      console.error('Failed to fetch card:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading card...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Card not found</div>
      </div>
    )
  }

  const photos = order.selectedPhotos ? JSON.parse(order.selectedPhotos) : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-dark to-bg-darker flex items-center justify-center p-4">
      {/* Animated Fireflies */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="firefly firefly-1"></div>
        <div className="firefly firefly-2"></div>
        <div className="firefly firefly-3"></div>
        <div className="firefly firefly-4"></div>
        <div className="firefly firefly-5"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Card Title */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{order.template.category.icon}</div>
          <h1 className="text-3xl font-light text-firefly-glow">
            {order.template.name}
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Sent on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Open Card View - Side by Side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* FRONT of Card */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-bg-dark to-bg-darker p-6">
              <p className="text-xs text-text-muted mb-4 text-center uppercase tracking-wide">Front</p>
              <div className="aspect-[5/7] flex flex-col items-center justify-center p-8 space-y-6">
                {/* Photos on Front - Firefly Grove Style */}
                {photos.length > 0 && (
                  <div className="w-full flex items-center justify-center mb-6">
                    {photos.length === 1 ? (
                      // Single photo - Large with firefly glow
                      <div className="relative">
                        <div className="absolute inset-0 bg-firefly-glow/20 blur-xl rounded-lg"></div>
                        <div className="relative bg-white p-4 shadow-2xl transform hover:scale-105 transition-transform rounded-sm">
                          <div className="aspect-[4/5] w-72 overflow-hidden">
                            <img
                              src={photos[0]}
                              alt="Memory"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    ) : photos.length === 2 ? (
                      // Two photos - Larger overlapping collage
                      <div className="relative w-full h-64">
                        <div className="absolute left-12 top-4 bg-white p-3 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform">
                          <div className="aspect-[3/2] w-52 overflow-hidden">
                            <img src={photos[0]} alt="Memory 1" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="absolute right-12 top-12 bg-white p-3 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform z-10">
                          <div className="aspect-[3/2] w-52 overflow-hidden">
                            <img src={photos[1]} alt="Memory 2" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        {/* Firefly accent */}
                        <div className="absolute top-0 right-1/4 w-2 h-2 bg-firefly-glow rounded-full blur-sm animate-pulse"></div>
                      </div>
                    ) : (
                      // Three photos - Random artistic collage with more space
                      <div className="relative w-full h-72">
                        <div className="absolute left-8 top-2 bg-white p-3 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform">
                          <div className="aspect-[4/5] w-36 overflow-hidden">
                            <img src={photos[0]} alt="Memory 1" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-16 bg-white p-3 shadow-2xl z-10 transform hover:scale-105 transition-transform">
                          <div className="aspect-[3/2] w-48 overflow-hidden">
                            <img src={photos[1]} alt="Memory 2" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="absolute right-8 top-6 bg-white p-3 shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
                          <div className="aspect-[4/5] w-36 overflow-hidden">
                            <img src={photos[2]} alt="Memory 3" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        {/* Firefly accents */}
                        <div className="absolute top-4 left-1/3 w-2 h-2 bg-firefly-glow rounded-full blur-sm animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-firefly-glow rounded-full blur-sm animate-pulse" style={{animationDelay: '1.5s'}}></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cover Message - Elegant and Prominent */}
                {order.template.coverMessage && (
                  <div className="flex-1 flex items-center justify-center px-4">
                    <p className="text-text-soft text-2xl leading-loose text-center italic font-light max-w-md">
                      {order.template.coverMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* INSIDE of Card */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-bg-dark to-bg-darker p-6">
              <p className="text-xs text-text-muted mb-4 text-center uppercase tracking-wide">Inside</p>
              <div className="aspect-[5/7] flex flex-col justify-between p-10 py-12">
                {/* Inside Message from Firefly Grove - Elegant Typography */}
                {order.template.insideMessage && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="max-w-md relative">
                      {/* Firefly decorative accents */}
                      <div className="absolute -left-8 top-1/2 w-1.5 h-1.5 bg-firefly-glow rounded-full blur-sm animate-pulse"></div>
                      <div className="absolute -right-8 top-1/3 w-1.5 h-1.5 bg-firefly-glow rounded-full blur-sm animate-pulse" style={{animationDelay: '1s'}}></div>
                      <p className="text-text-soft text-xl leading-loose text-center font-light whitespace-pre-line">
                        {order.template.insideMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Personal Message - Handwriting Style */}
                {order.customMessage && (
                  <div className="text-center my-8">
                    <p
                      className="text-text-soft text-lg leading-relaxed whitespace-pre-wrap max-w-md mx-auto"
                      style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                    >
                      {order.customMessage}
                    </p>
                  </div>
                )}

                {/* Signature - Elegant */}
                {(order.signature || order.senderName) && (
                  <div className="text-center mt-auto mb-6">
                    {order.signature ? (
                      <p
                        className="text-text-soft text-2xl italic"
                        style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                      >
                        {order.signature}
                      </p>
                    ) : order.senderName && (
                      <>
                        <p className="text-text-muted text-xs mb-2">With love,</p>
                        <p className="text-text-soft text-base font-medium">
                          {order.senderName}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Firefly Grove Branding */}
                <div className="text-center pt-4 border-t border-border-subtle">
                  <p className="text-text-muted text-xs flex items-center justify-center gap-1 mb-2">
                    <span className="text-firefly-glow">✦</span>
                    Firefly Grove
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-firefly-dim/20 hover:bg-firefly-dim/40 text-firefly-glow border border-firefly-dim/50 rounded-lg text-sm font-medium transition-soft"
          >
            Create Your Own Card
          </Link>
        </div>
      </div>

      {/* Firefly CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(50px, -50px) scale(1.2);
            opacity: 1;
          }
        }

        .firefly {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #FFD966;
          border-radius: 50%;
          box-shadow: 0 0 20px #FFD966, 0 0 40px #FFD966;
          animation: float 6s ease-in-out infinite;
        }

        .firefly-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 8s;
        }

        .firefly-2 {
          top: 30%;
          right: 20%;
          animation-delay: 2s;
          animation-duration: 6s;
        }

        .firefly-3 {
          bottom: 20%;
          left: 30%;
          animation-delay: 4s;
          animation-duration: 7s;
        }

        .firefly-4 {
          top: 60%;
          right: 15%;
          animation-delay: 1s;
          animation-duration: 9s;
        }

        .firefly-5 {
          bottom: 40%;
          left: 60%;
          animation-delay: 3s;
          animation-duration: 5s;
        }
      `}</style>
    </div>
  )
}

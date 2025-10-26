'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ViewCardPage() {
  const params = useParams()
  const code = params.code as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [showFireflies, setShowFireflies] = useState(false)

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

  const handleOpenCard = () => {
    setIsOpen(true)
    setShowFireflies(true)
    // Hide fireflies after animation completes
    setTimeout(() => setShowFireflies(false), 3000)
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
    <div className="min-h-screen bg-gradient-to-b from-bg-dark to-bg-darker flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Fireflies - Released when card opens */}
      {showFireflies && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="firefly-release"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${i * 0.1}s`,
                '--random-x': `${Math.random() * 200 - 100}vw`,
                '--random-y': `${Math.random() * 200 - 100}vh`,
              } as any}
            ></div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-4xl w-full">
        {/* Card Title */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{order.template.category.icon}</div>
          <h1 className="text-3xl font-light text-firefly-glow">
            {order.template.name}
          </h1>
          <p className="text-text-muted text-sm mt-2">
            From {order.senderName || 'someone special'} • {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Card Display */}
        <div className="perspective-1000">
          {!isOpen ? (
            /* CLOSED CARD - Show Front */
            <div className="relative mx-auto max-w-md">
              <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden shadow-2xl transform-gpu transition-transform hover:scale-105">
                <div className="bg-gradient-to-br from-bg-dark to-bg-darker p-8">
                  <div className="aspect-[5/7] flex flex-col items-center justify-center p-8 space-y-6">
                    {/* Photos on Front */}
                    {photos.length > 0 && (
                      <div className="w-full flex items-center justify-center mb-6">
                        {photos.length === 1 ? (
                          <div className="relative">
                            <div className="absolute inset-0 bg-firefly-glow/20 blur-xl rounded-lg"></div>
                            <div className="relative bg-white p-4 shadow-2xl rounded-sm">
                              <div className="aspect-[4/5] w-64 overflow-hidden">
                                <img src={photos[0]} alt="Memory" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          </div>
                        ) : photos.length === 2 ? (
                          <div className="relative w-full h-64">
                            <div className="absolute left-12 top-4 bg-white p-3 shadow-2xl transform -rotate-6">
                              <div className="aspect-[3/2] w-48 overflow-hidden">
                                <img src={photos[0]} alt="Memory 1" className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div className="absolute right-12 top-12 bg-white p-3 shadow-2xl transform rotate-6 z-10">
                              <div className="aspect-[3/2] w-48 overflow-hidden">
                                <img src={photos[1]} alt="Memory 2" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-72">
                            <div className="absolute left-8 top-2 bg-white p-3 shadow-xl transform -rotate-3">
                              <div className="aspect-[4/5] w-32 overflow-hidden">
                                <img src={photos[0]} alt="Memory 1" className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 top-16 bg-white p-3 shadow-2xl z-10">
                              <div className="aspect-[3/2] w-44 overflow-hidden">
                                <img src={photos[1]} alt="Memory 2" className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div className="absolute right-8 top-6 bg-white p-3 shadow-xl transform rotate-3">
                              <div className="aspect-[4/5] w-32 overflow-hidden">
                                <img src={photos[2]} alt="Memory 3" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cover Message */}
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

              {/* Open Card Button */}
              <div className="text-center mt-8">
                <button
                  onClick={handleOpenCard}
                  className="px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg text-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  Open Card ✨
                </button>
                <p className="text-text-muted text-xs mt-3">Click to see your message</p>
              </div>
            </div>
          ) : (
            /* OPENED CARD - Show Inside */
            <div className="relative mx-auto max-w-2xl animate-card-open">
              <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-bg-dark to-bg-darker p-8">
                  <div className="aspect-[5/7] flex flex-col justify-between p-10 py-12">
                    {/* Inside Message from Firefly Grove */}
                    {order.template.insideMessage && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="max-w-md relative">
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
                          className="text-text-soft text-2xl leading-relaxed whitespace-pre-wrap max-w-md mx-auto"
                          style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                        >
                          {order.customMessage}
                        </p>
                      </div>
                    )}

                    {/* Signature */}
                    {(order.signature || order.senderName) && (
                      <div className="text-center mt-auto mb-6">
                        {order.signature ? (
                          <p
                            className="text-text-soft text-3xl italic"
                            style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                          >
                            {order.signature}
                          </p>
                        ) : order.senderName && (
                          <>
                            <p className="text-text-muted text-xs mb-2">With love,</p>
                            <p className="text-text-soft text-lg font-medium">
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
          )}
        </div>

        {/* CTA - Only show after opening */}
        {isOpen && (
          <div className="text-center mt-8 animate-fade-in">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-firefly-dim/20 hover:bg-firefly-dim/40 text-firefly-glow border border-firefly-dim/50 rounded-lg text-sm font-medium transition-soft"
            >
              Create Your Own Card
            </Link>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes firefly-release {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--random-x), var(--random-y)) scale(1);
            opacity: 0;
          }
        }

        @keyframes card-open {
          0% {
            transform: scale(0.8) rotateY(-15deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .firefly-release {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #FFD966;
          border-radius: 50%;
          box-shadow: 0 0 20px #FFD966, 0 0 40px #FFD966;
          animation: firefly-release 3s ease-out forwards;
        }

        .animate-card-open {
          animation: card-open 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out 0.5s both;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}

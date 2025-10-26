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
              <div className="aspect-[5/7] flex flex-col items-center justify-center p-6 space-y-6">
                {/* Photos on Front */}
                {photos.length > 0 && (
                  <div className={`grid gap-3 w-full ${
                    photos.length === 1 ? 'grid-cols-1' :
                    photos.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {photos.slice(0, 3).map((url: string, index: number) => (
                      <div
                        key={index}
                        className={`rounded-lg overflow-hidden ${
                          photos.length === 1 ? 'aspect-video' :
                          photos.length === 3 && index === 0 ? 'col-span-2 aspect-video' :
                          'aspect-square'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Memory ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Cover Message */}
                {order.template.coverMessage && (
                  <p className="text-text-soft text-lg leading-relaxed text-center italic flex-1 flex items-center">
                    {order.template.coverMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* INSIDE of Card */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-bg-dark to-bg-darker p-6">
              <p className="text-xs text-text-muted mb-4 text-center uppercase tracking-wide">Inside</p>
              <div className="aspect-[5/7] flex flex-col justify-center p-6 space-y-6">
                {/* Inside Message from Firefly Grove */}
                {order.template.insideMessage && (
                  <div className="bg-firefly-dim/5 border border-firefly-dim/20 rounded-lg p-5">
                    <p className="text-text-soft text-base leading-relaxed text-center">
                      {order.template.insideMessage}
                    </p>
                  </div>
                )}

                {/* Personal Message */}
                {order.customMessage && (
                  <div className="text-center">
                    <p className="text-text-soft text-base leading-relaxed whitespace-pre-wrap">
                      {order.customMessage}
                    </p>
                  </div>
                )}

                {/* Signature */}
                {(order.signature || order.senderName) && (
                  <div className="text-center mt-auto">
                    {order.signature ? (
                      <p
                        className="text-text-soft text-xl italic"
                        style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                      >
                        {order.signature}
                      </p>
                    ) : order.senderName && (
                      <>
                        <p className="text-text-muted text-xs mb-1">With love,</p>
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

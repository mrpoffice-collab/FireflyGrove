import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface PageProps {
  params: { code: string }
}

export default async function ViewCardPage({ params }: PageProps) {
  const { code } = params

  // Fetch delivery and order info
  const delivery = await prisma.cardDelivery.findUnique({
    where: { viewCode: code },
    include: {
      order: {
        include: {
          template: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  })

  if (!delivery) {
    notFound()
  }

  // Track view (increment count and record first open)
  await prisma.cardDelivery.update({
    where: { id: delivery.id },
    data: {
      viewCount: { increment: 1 },
      openedAt: delivery.openedAt || new Date(),
      status: 'opened',
    },
  })

  const { order } = delivery
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

      <div className="relative z-10 max-w-2xl w-full">
        {/* Card Container */}
        <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="bg-gradient-to-br from-bg-dark to-bg-darker p-8 text-center border-b border-border-subtle">
            <div className="text-5xl mb-4">{order.template.category.icon}</div>
            <h1 className="text-3xl font-light text-firefly-glow mb-2">
              {order.template.name}
            </h1>
          </div>

          {/* Card Body */}
          <div className="p-8 md:p-12">
            {/* Photos */}
            {photos.length > 0 && (
              <div className={`grid gap-4 mb-8 ${
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

            {/* Message */}
            <div className="bg-gradient-to-br from-bg-dark/50 to-bg-darker/50 rounded-lg p-8 mb-8">
              <p className="text-text-soft text-lg leading-relaxed whitespace-pre-wrap text-center">
                {order.customMessage}
              </p>
            </div>

            {/* Sender */}
            {order.senderName && (
              <div className="text-center mb-8">
                <p className="text-text-muted text-sm mb-2">With love,</p>
                <p className="text-text-soft text-xl font-medium">
                  {order.senderName}
                </p>
              </div>
            )}

            {/* Firefly Grove Branding */}
            <div className="text-center pt-8 border-t border-border-subtle">
              <p className="text-text-muted text-xs flex items-center justify-center gap-2 mb-3">
                <span className="text-firefly-glow text-lg">✦</span>
                Sent with Firefly Grove
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/40 text-firefly-glow border border-firefly-dim/50 rounded-lg text-sm font-medium transition-soft"
              >
                Create Your Own Card
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <p className="text-text-muted text-xs">
            This card was sent on {new Date(order.createdAt).toLocaleDateString()}
          </p>
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

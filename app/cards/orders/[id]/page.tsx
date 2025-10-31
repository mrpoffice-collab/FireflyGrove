'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

interface OrderDetails {
  id: string
  deliveryType: string
  status: string
  paymentStatus: string
  totalAmount: number
  customMessage: string
  selectedPhotos: string | null
  senderName: string | null
  recipientEmail: string | null
  recipientName: string | null
  recipientAddress: string | null
  createdAt: string
  sentAt: string | null
  deliveredAt: string | null
  template: {
    name: string
    description: string
    category: {
      name: string
      icon: string
    }
  }
  delivery: {
    status: string
    viewCode: string | null
    viewUrl: string | null
    emailSent: boolean
    emailSentAt: string | null
    openedAt: string | null
    viewCount: number
    lobMailId: string | null
    trackingUrl: string | null
    expectedDelivery: string | null
  } | null
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && orderId) {
      fetchOrderDetails()
    }
  }, [status, orderId, router])

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/cards/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        router.push('/cards/orders')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      router.push('/cards/orders')
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const photos = order.selectedPhotos ? JSON.parse(order.selectedPhotos) : []
  const recipientAddress = order.recipientAddress ? JSON.parse(order.recipientAddress) : null

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/cards/orders"
            className="inline-flex items-center gap-2 text-text-muted hover:text-firefly-glow transition-soft mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>

          {/* Header */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{order.template.category.icon}</div>
                <div>
                  <h1 className="text-2xl font-light text-firefly-glow mb-2">
                    {order.template.name}
                  </h1>
                  <p className="text-text-muted text-sm">
                    {order.template.category.name} • {order.deliveryType === 'digital' ? '📧 Digital' : '📮 Printed & Mailed'}
                  </p>
                </div>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                  order.status === 'completed'
                    ? 'bg-green-500/20 text-success-text'
                    : order.status === 'processing'
                    ? 'bg-blue-500/20 text-info-text'
                    : order.status === 'failed'
                    ? 'bg-red-500/20 text-error-text'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border-subtle text-sm">
              <div>
                <span className="text-text-muted">Order ID</span>
                <p className="text-text-soft font-mono mt-1">{order.id.slice(0, 12)}...</p>
              </div>
              <div>
                <span className="text-text-muted">Created</span>
                <p className="text-text-soft mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-text-muted">Total Paid</span>
                <p className="text-firefly-glow font-medium text-lg mt-1">${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Card Preview */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-6">
            <h2 className="text-lg text-text-soft font-medium mb-4">Card Content</h2>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {photos.map((url: string, index: number) => (
                  <div key={index} className="aspect-square rounded overflow-hidden">
                    <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="bg-bg-elevated rounded-lg p-4 mb-4">
              <p className="text-text-soft text-sm leading-relaxed whitespace-pre-wrap">
                {order.customMessage}
              </p>
            </div>

            {order.senderName && (
              <p className="text-text-muted text-sm text-right">
                From: <span className="text-text-soft">{order.senderName}</span>
              </p>
            )}
          </div>

          {/* Delivery Info */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-6">
            <h2 className="text-lg text-text-soft font-medium mb-4">Delivery Information</h2>

            {order.deliveryType === 'digital' ? (
              <div className="space-y-4">
                <div>
                  <span className="text-text-muted text-sm">Recipient Email</span>
                  <p className="text-text-soft">{order.recipientEmail}</p>
                </div>

                {order.delivery && (
                  <>
                    {order.delivery.emailSent && (
                      <div>
                        <span className="text-text-muted text-sm">Email Sent</span>
                        <p className="text-text-soft">
                          {order.delivery.emailSentAt
                            ? new Date(order.delivery.emailSentAt).toLocaleString()
                            : 'Yes'}
                        </p>
                      </div>
                    )}

                    {order.delivery.openedAt && (
                      <div>
                        <span className="text-text-muted text-sm">First Opened</span>
                        <p className="text-text-soft">
                          {new Date(order.delivery.openedAt).toLocaleString()}
                        </p>
                        <p className="text-text-muted text-xs mt-1">
                          Viewed {order.delivery.viewCount} time{order.delivery.viewCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {order.delivery.viewUrl && (
                      <div>
                        <span className="text-text-muted text-sm">Card Link</span>
                        <a
                          href={order.delivery.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-firefly-glow hover:underline text-sm block mt-1"
                        >
                          {order.delivery.viewUrl}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-text-muted text-sm">Recipient</span>
                  <p className="text-text-soft">{order.recipientName}</p>
                  {recipientAddress && (
                    <div className="text-text-muted text-sm mt-1">
                      <p>{recipientAddress.line1}</p>
                      {recipientAddress.line2 && <p>{recipientAddress.line2}</p>}
                      <p>
                        {recipientAddress.city}, {recipientAddress.state} {recipientAddress.zip}
                      </p>
                    </div>
                  )}
                </div>

                {order.delivery && order.delivery.expectedDelivery && (
                  <div>
                    <span className="text-text-muted text-sm">Expected Delivery</span>
                    <p className="text-text-soft">
                      {new Date(order.delivery.expectedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {order.delivery && order.delivery.trackingUrl && (
                  <div>
                    <span className="text-text-muted text-sm">Tracking</span>
                    <a
                      href={order.delivery.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-firefly-glow hover:underline text-sm block mt-1"
                    >
                      Track Package →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/cards/create"
              className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft text-center"
            >
              Create Another Card
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

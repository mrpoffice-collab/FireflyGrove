'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

interface Order {
  id: string
  deliveryType: string
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  sentAt: string | null
  deliveredAt: string | null
  template: {
    name: string
    category: {
      name: string
      icon: string
    }
  }
  delivery: {
    status: string
    viewCount: number
    openedAt: string | null
    trackingUrl: string | null
    expectedDelivery: string | null
  } | null
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'digital' | 'physical'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/cards/orders')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true
    return order.deliveryType === filter
  })

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light text-firefly-glow mb-2">
                Order History
              </h1>
              <p className="text-text-muted">
                View and manage your greeting card orders
              </p>
            </div>
            <Link
              href="/cards/create"
              className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
            >
              Create New Card
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-soft ${
                filter === 'all'
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-dark border border-border-subtle text-text-muted hover:border-firefly-dim'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter('digital')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-soft ${
                filter === 'digital'
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-dark border border-border-subtle text-text-muted hover:border-firefly-dim'
              }`}
            >
              📧 Digital ({orders.filter((o) => o.deliveryType === 'digital').length})
            </button>
            <button
              onClick={() => setFilter('physical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-soft ${
                filter === 'physical'
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-dark border border-border-subtle text-text-muted hover:border-firefly-dim'
              }`}
            >
              📮 Physical ({orders.filter((o) => o.deliveryType === 'physical').length})
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-12 text-center">
              <div className="text-5xl mb-4">💌</div>
              <h2 className="text-xl text-text-soft mb-2">No orders yet</h2>
              <p className="text-text-muted mb-6">
                Create your first greeting card to get started
              </p>
              <Link
                href="/cards/create"
                className="inline-block px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Create Card
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/cards/orders/${order.id}`}
                  className="block bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/50 transition-soft"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Side - Order Info */}
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{order.template.category.icon}</div>
                      <div>
                        <h3 className="text-lg text-text-soft font-medium mb-1">
                          {order.template.name}
                        </h3>
                        <p className="text-text-muted text-sm mb-2">
                          {order.template.category.name} • {order.deliveryType === 'digital' ? '📧 Digital' : '📮 Printed & Mailed'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <span>Order ID: {order.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Status & Actions */}
                    <div className="text-right">
                      <div className="mb-2">
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
                      <p className="text-firefly-glow font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </p>

                      {/* Delivery Info */}
                      {order.delivery && order.deliveryType === 'digital' && order.delivery.openedAt && (
                        <p className="text-text-muted text-xs mt-2">
                          Opened {order.delivery.viewCount} time{order.delivery.viewCount !== 1 ? 's' : ''}
                        </p>
                      )}
                      {order.delivery && order.deliveryType === 'physical' && order.delivery.expectedDelivery && (
                        <p className="text-text-muted text-xs mt-2">
                          Est. delivery: {new Date(order.delivery.expectedDelivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

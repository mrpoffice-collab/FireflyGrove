'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function CardSuccessContent() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      verifyPayment()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const verifyPayment = async () => {
    try {
      const res = await fetch(`/api/cards/verify-payment?session_id=${sessionId}`)
      const data = await res.json()

      if (data.order) {
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Failed to verify payment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Verifying payment...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-light text-firefly-glow mb-4">
            Payment Successful!
          </h1>
          <p className="text-text-muted text-lg">
            Your greeting card has been created and is being processed.
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-6">
            <h2 className="text-xl text-text-soft font-medium mb-4">Order Details</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="text-text-muted">Order ID</span>
                <span className="text-text-soft font-mono">{order.id.slice(0, 12)}...</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="text-text-muted">Delivery Type</span>
                <span className="text-text-soft">
                  {order.deliveryType === 'digital' ? '📧 Digital' : '📮 Printed & Mailed'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="text-text-muted">Status</span>
                <span className="text-firefly-glow capitalize">{order.status}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-text-soft font-medium">Total Paid</span>
                <span className="text-firefly-glow text-lg font-medium">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim/30 rounded-lg p-6 mb-8">
          <h3 className="text-lg text-text-soft font-medium mb-3">
            What's Next?
          </h3>

          {order?.deliveryType === 'digital' ? (
            <ul className="text-text-muted text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-firefly-glow mt-0.5">✓</span>
                <span>Your digital card will be sent to the recipient's email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-firefly-glow mt-0.5">✓</span>
                <span>They'll receive a beautiful email with a link to view the card</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-firefly-glow mt-0.5">✓</span>
                <span>You can track when they open it in your order history</span>
              </li>
            </ul>
          ) : (
            <ul className="text-text-muted text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-firefly-glow mt-0.5">✓</span>
                <span>Your card is being sent to our print partner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-firefly-glow mt-0.5">✓</span>
                <span>It will be professionally printed and mailed within 1-3 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-firefly-glow mt-0.5">✓</span>
                <span>USPS tracking will be available in your order history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-firefly-glow mt-0.5">✓</span>
                <span>Expected delivery: 3-5 business days</span>
              </li>
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/cards/orders"
            className="flex-1 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft text-center"
          >
            View Order History
          </Link>
          <Link
            href="/cards/create"
            className="flex-1 py-3 bg-bg-elevated border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft text-center"
          >
            Send Another Card
          </Link>
        </div>

        {/* Return Home */}
        <div className="text-center mt-8">
          <Link
            href="/grove"
            className="text-text-muted hover:text-firefly-glow transition-soft text-sm"
          >
            ← Return to My Grove
          </Link>
        </div>
      </div>
    </div>
  )
}

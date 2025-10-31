'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { PLANS, getPlanById, formatPrice } from '@/lib/plans'

interface Grove {
  id: string
  planType: string
  status: string
  treeLimit: number
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

interface TreeSubscription {
  id: string
  status: string
  renewalDate: string | null
  createdAt: string
  stripeSubscriptionId: string | null
  person: {
    id: string
    name: string
    isLegacy: boolean
  }
  grove: {
    id: string
    name: string
  }
  membershipId: string
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [grove, setGrove] = useState<Grove | null>(null)
  const [treeSubscriptions, setTreeSubscriptions] = useState<TreeSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [changingPlan, setChangingPlan] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGrove()
      fetchTreeSubscriptions()
    }
  }, [status])

  const fetchGrove = async () => {
    try {
      const res = await fetch('/api/grove')
      if (res.ok) {
        const data = await res.json()
        setGrove(data)
      }
    } catch (error) {
      console.error('Failed to fetch grove:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTreeSubscriptions = async () => {
    try {
      const res = await fetch('/api/tree-subscription/list')
      if (res.ok) {
        const data = await res.json()
        setTreeSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error('Failed to fetch tree subscriptions:', error)
    }
  }

  const handleManageSubscription = async () => {
    if (loadingPortal) return
    setLoadingPortal(true)

    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Failed to open portal:', error)
      alert('Failed to open billing portal')
    } finally {
      setLoadingPortal(false)
    }
  }

  const handleChangePlan = async (planId: string) => {
    if (changingPlan || planId === grove?.planType) return
    setChangingPlan(planId)

    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()

      if (res.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Failed to change plan:', error)
      alert('Failed to change plan')
    } finally {
      setChangingPlan(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!session || !grove) {
    return null
  }

  const currentPlan = getPlanById(grove.planType)
  const hasSubscription = grove.stripeSubscriptionId !== null

  return (
    <div className="min-h-screen">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Grove
          </button>

          <div className="mb-12">
            <h1 className="text-4xl font-light text-text-soft mb-2">
              Subscription & Billing
            </h1>
            <p className="text-text-muted">
              Manage your plan, payment method, and billing history
            </p>
          </div>

          {/* Current Plan Card */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-8 mb-12">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl text-text-soft mb-2">Current Plan</h2>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-light text-firefly-glow">
                    {currentPlan.name}
                  </span>
                  {grove.status === 'active' && (
                    <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-success-text border border-green-500/30">
                      Active
                    </span>
                  )}
                  {grove.status === 'past_due' && (
                    <span className="px-3 py-1 text-xs rounded-full bg-orange-500/20 text-warning-text border border-orange-500/30">
                      Past Due
                    </span>
                  )}
                  {grove.status === 'canceled' && (
                    <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-error-text border border-red-500/30">
                      Canceled
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-light text-text-soft">
                  {formatPrice(currentPlan.price)}
                </div>
                <div className="text-text-muted text-sm">per {currentPlan.interval}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-bg-darker rounded-lg p-4">
                <div className="text-text-muted text-sm mb-1">Tree Capacity</div>
                <div className="text-2xl text-text-soft">{currentPlan.treeLimit}</div>
              </div>
              <div className="bg-bg-darker rounded-lg p-4">
                <div className="text-text-muted text-sm mb-1">Status</div>
                <div className="text-2xl text-text-soft capitalize">{grove.status}</div>
              </div>
            </div>

            {hasSubscription && (
              <button
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                className="w-full py-3 bg-bg-darker hover:bg-border-subtle text-text-soft rounded transition-soft disabled:bg-gray-800 disabled:text-gray-600"
              >
                {loadingPortal ? 'Loading...' : 'Manage Payment Method & Billing'}
              </button>
            )}
          </div>

          {/* Available Plans */}
          <div className="mb-8">
            <h2 className="text-2xl font-light text-text-soft mb-6">
              {grove.planType === 'trial' ? 'Choose Your Plan' : 'Change Plan'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(PLANS).map((plan) => {
              const isCurrent = plan.id === grove.planType
              const isDisabled = plan.id === 'trial'

              return (
                <div
                  key={plan.id}
                  className={`bg-bg-dark border rounded-lg p-6 ${
                    plan.popular
                      ? 'border-firefly-dim/50 relative'
                      : 'border-border-subtle'
                  } ${isCurrent ? 'ring-2 ring-firefly-dim' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 text-xs rounded-full bg-firefly-dim text-bg-dark font-medium">
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl text-text-soft mb-2">{plan.name}</h3>
                    <p className="text-text-muted text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-light text-text-soft">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-text-muted text-sm">/{plan.interval}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-firefly-dim flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-text-muted text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {isCurrent ? (
                    <div className="w-full py-2 bg-firefly-dim/20 text-firefly-glow rounded text-center font-medium">
                      Current Plan
                    </div>
                  ) : isDisabled ? (
                    <div className="w-full py-2 bg-bg-darker text-text-muted rounded text-center">
                      Not Available
                    </div>
                  ) : (
                    <button
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={changingPlan !== null}
                      className="w-full py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500"
                    >
                      {changingPlan === plan.id ? 'Processing...' : 'Select Plan'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Individual Tree Subscriptions */}
          {treeSubscriptions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-light text-text-soft mb-6">
                Individual Tree Subscriptions
              </h2>
              <p className="text-text-muted text-sm mb-6">
                These trees have individual subscriptions ($4.99/year each) and remain active even if your Grove subscription expires.
              </p>

              <div className="space-y-4">
                {treeSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-bg-dark border border-border-subtle rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-text-soft font-medium">
                            {sub.person.name}
                          </h3>
                          {sub.status === 'active' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-success-text border border-green-500/30">
                              Active
                            </span>
                          )}
                          {sub.status === 'past_due' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-warning-text border border-orange-500/30">
                              Past Due
                            </span>
                          )}
                          {sub.status === 'canceled' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-error-text border border-red-500/30">
                              Canceled
                            </span>
                          )}
                          {sub.status === 'frozen' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-info-text border border-blue-500/30">
                              Frozen
                            </span>
                          )}
                          {sub.person.isLegacy && (
                            <span className="px-2 py-1 text-xs rounded-full bg-text-muted/20 text-text-muted">
                              Legacy
                            </span>
                          )}
                        </div>
                        <p className="text-text-muted text-sm mb-1">
                          In Grove: {sub.grove.name}
                        </p>
                        {sub.renewalDate && (
                          <p className="text-text-muted text-xs">
                            Next renewal: {new Date(sub.renewalDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-light text-text-soft mb-1">
                          $4.99
                        </div>
                        <div className="text-text-muted text-xs">per year</div>
                      </div>
                    </div>

                    {sub.stripeSubscriptionId && (
                      <button
                        onClick={handleManageSubscription}
                        disabled={loadingPortal}
                        className="mt-4 px-4 py-2 bg-bg-darker hover:bg-border-subtle text-text-soft rounded text-sm transition-soft disabled:bg-gray-800 disabled:text-gray-600"
                      >
                        {loadingPortal ? 'Loading...' : 'Manage Subscription'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 bg-bg-dark border border-border-subtle rounded-lg p-6">
            <h3 className="text-lg text-text-soft mb-3">Need Help?</h3>
            <p className="text-text-muted text-sm mb-4">
              Have questions about your subscription or billing? We're here to help.
            </p>
            <a
              href="mailto:support@fireflygrove.com"
              className="text-firefly-dim hover:text-firefly-glow transition-soft text-sm"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

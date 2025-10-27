'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

interface KPIData {
  northStar: {
    totalUsers: number
    goal: number
    progress: string
  }
  acquisition: {
    newUsersThisMonth: number
    newUsersThisWeek: number
    emailSubscribers: number
  }
  content: {
    publishedPosts: number
    totalViews: number
    totalSignups: number
    conversionRate: number
    topPosts: Array<{
      id: string
      title: string
      views: number
      signups: number
      publishedAt: string
    }>
  }
  engagement: {
    totalMemories: number
    totalBranches: number
    totalGroves: number
    videosGenerated: number
    soundArtsCreated: number
  }
}

export default function KPIsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  // Financial projection sliders
  const [targetUsers, setTargetUsers] = useState(100)
  const [monthlyGrowth, setMonthlyGrowth] = useState(10)
  const [subscriptionPrice, setSubscriptionPrice] = useState(10)
  const [productConversion, setProductConversion] = useState(10)
  const [avgProductSpend, setAvgProductSpend] = useState(20)
  const [fixedCosts, setFixedCosts] = useState(0)
  const [variableCostPerUser, setVariableCostPerUser] = useState(0.03)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchKPIs()
    }
  }, [status, router])

  const fetchKPIs = async () => {
    try {
      const res = await fetch('/api/marketing/kpis')
      if (res.ok) {
        const data = await res.json()
        setKpis(data)
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Loading KPIs...</div>
        </div>
      </div>
    )
  }

  if (!kpis) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Failed to load KPIs</div>
        </div>
      </div>
    )
  }

  const progress = parseInt(kpis.northStar.progress)
  const onTrack = kpis.acquisition.newUsersThisWeek >= 3 // Target: 3+ users/week

  // Financial calculations
  const currentUsers = kpis.northStar.totalUsers

  // Calculate monthly metrics
  const calculateMonthlyMetrics = (users: number) => {
    const monthlySubRevenue = (users * subscriptionPrice) / 12 // Annual subscription divided by 12
    const monthlyProductRevenue = users * (productConversion / 100) * (avgProductSpend / 12)
    const totalMonthlyRevenue = monthlySubRevenue + monthlyProductRevenue

    const totalMonthlyCosts = fixedCosts + (users * variableCostPerUser)
    const monthlyProfit = totalMonthlyRevenue - totalMonthlyCosts

    return {
      revenue: totalMonthlyRevenue,
      costs: totalMonthlyCosts,
      profit: monthlyProfit,
      margin: totalMonthlyRevenue > 0 ? (monthlyProfit / totalMonthlyRevenue * 100) : 0
    }
  }

  // Calculate 12-month projection
  const calculateProjection = () => {
    const projection = []
    let users = currentUsers

    for (let month = 0; month <= 12; month++) {
      const metrics = calculateMonthlyMetrics(users)
      projection.push({
        month,
        users: Math.round(users),
        ...metrics
      })
      users += monthlyGrowth
    }

    return projection
  }

  // Break-even calculation
  const calculateBreakEven = () => {
    // Fixed + (users × variable) = (users × sub/12) + (users × product)
    // Fixed = users × (sub/12 + product - variable)
    const revenuePerUser = (subscriptionPrice / 12) + ((productConversion / 100) * (avgProductSpend / 12))
    const netPerUser = revenuePerUser - variableCostPerUser

    if (netPerUser <= 0) return null // Can't break even with these numbers

    return Math.ceil(fixedCosts / netPerUser)
  }

  // Lifetime value
  const ltv = subscriptionPrice * 10 + (productConversion / 100) * avgProductSpend * 10

  const currentMetrics = calculateMonthlyMetrics(currentUsers)
  const targetMetrics = calculateMonthlyMetrics(targetUsers)
  const projection = calculateProjection()
  const breakEvenUsers = calculateBreakEven()

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header userName={session?.user?.name || ''} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketing-genius"
            className="text-firefly-glow hover:text-firefly-dim text-sm mb-2 inline-block"
          >
            ← Back to Marketing Intelligence
          </Link>
          <h1 className="text-4xl font-light text-text-soft mb-3">📊 Marketing KPIs</h1>
          <p className="text-text-muted text-lg">
            Strategic metrics and performance tracking
          </p>
        </div>

        {/* North Star Metric */}
        <div className="mb-8 bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border-2 border-firefly-dim rounded-xl p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-light text-text-soft mb-1">🎯 North Star Metric</h2>
              <p className="text-text-muted">Total Active Users</p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${onTrack ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {onTrack ? '✅ On Track' : '⚠️ Action Needed'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-6xl font-light text-firefly-glow mb-2">{kpis.northStar.totalUsers}</div>
              <div className="text-text-muted">Current Users</div>
            </div>
            <div>
              <div className="text-6xl font-light text-text-soft mb-2">{kpis.northStar.goal}</div>
              <div className="text-text-muted">Phase 1 Goal</div>
            </div>
            <div>
              <div className="text-6xl font-light text-firefly-dim mb-2">{kpis.northStar.progress}%</div>
              <div className="text-text-muted">Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-4 bg-bg-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-firefly-dim to-firefly-glow transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Weekly Target */}
          <div className="mt-6 p-4 bg-bg-dark rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">This Week:</span>
              <span className="text-text-soft font-medium">
                {kpis.acquisition.newUsersThisWeek} users
                <span className="text-text-muted text-sm ml-2">(Target: 3+/week)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Primary KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Acquisition */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
            <h3 className="text-xl font-medium text-text-soft mb-6 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Acquisition
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-3xl font-light text-green-400 mb-1">
                  {kpis.acquisition.newUsersThisMonth}
                </div>
                <div className="text-text-muted text-sm">New Users (30d)</div>
                <div className="text-text-muted text-xs mt-1">Target: 10+/month</div>
              </div>

              <div>
                <div className="text-2xl font-light text-text-soft mb-1">
                  {kpis.acquisition.newUsersThisWeek}
                </div>
                <div className="text-text-muted text-sm">New Users (7d)</div>
                <div className="text-text-muted text-xs mt-1">Target: 3+/week</div>
              </div>

              <div>
                <div className="text-2xl font-light text-text-soft mb-1">
                  {kpis.acquisition.emailSubscribers}
                </div>
                <div className="text-text-muted text-sm">Email Subscribers</div>
              </div>
            </div>
          </div>

          {/* Content Performance */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
            <h3 className="text-xl font-medium text-text-soft mb-6 flex items-center gap-2">
              <span className="text-2xl">✍️</span>
              Content
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-3xl font-light text-blue-400 mb-1">
                  {kpis.content.publishedPosts}
                </div>
                <div className="text-text-muted text-sm">Published Posts</div>
                <div className="text-text-muted text-xs mt-1">Target: 15+ posts</div>
              </div>

              <div>
                <div className="text-2xl font-light text-text-soft mb-1">
                  {kpis.content.totalViews.toLocaleString()}
                </div>
                <div className="text-text-muted text-sm">Total Blog Views</div>
              </div>

              <div>
                <div className="text-2xl font-light text-firefly-glow mb-1">
                  {kpis.content.conversionRate}%
                </div>
                <div className="text-text-muted text-sm">View → Signup Rate</div>
                <div className="text-text-muted text-xs mt-1">Target: 2-5%</div>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
            <h3 className="text-xl font-medium text-text-soft mb-6 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Engagement
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-3xl font-light text-purple-400 mb-1">
                  {kpis.engagement.totalMemories}
                </div>
                <div className="text-text-muted text-sm">Memories Created</div>
              </div>

              <div>
                <div className="text-2xl font-light text-text-soft mb-1">
                  {kpis.engagement.videosGenerated}
                </div>
                <div className="text-text-muted text-sm">Memorial Videos</div>
              </div>

              <div>
                <div className="text-2xl font-light text-text-soft mb-1">
                  {kpis.engagement.soundArtsCreated}
                </div>
                <div className="text-text-muted text-sm">Sound Wave Arts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="mb-8 bg-bg-elevated border border-border-subtle rounded-xl p-6">
          <h3 className="text-xl font-medium text-text-soft mb-6">🎯 Channel Performance</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-bg-dark rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-muted">SEO / Blog</span>
                <span className="text-green-400 text-sm">✅ Active</span>
              </div>
              <div className="text-2xl font-light text-text-soft mb-1">
                {kpis.content.totalViews.toLocaleString()}
              </div>
              <div className="text-text-muted text-xs">
                {kpis.content.totalSignups} signups ({kpis.content.conversionRate}% CVR)
              </div>
            </div>

            <div className="p-4 bg-bg-dark rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-muted">Pinterest</span>
                <span className="text-yellow-400 text-sm">⏳ Planned</span>
              </div>
              <div className="text-2xl font-light text-text-muted mb-1">-</div>
              <div className="text-text-muted text-xs">Not started</div>
            </div>

            <div className="p-4 bg-bg-dark rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-muted">Facebook</span>
                <span className="text-yellow-400 text-sm">⏳ Planned</span>
              </div>
              <div className="text-2xl font-light text-text-muted mb-1">-</div>
              <div className="text-text-muted text-xs">Not started</div>
            </div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
          <h3 className="text-xl font-medium text-text-soft mb-6">🏆 Top Performing Content</h3>

          {kpis.content.topPosts.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p>No published posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kpis.content.topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-bg-dark rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl font-light text-firefly-glow">#{index + 1}</div>
                    <div className="flex-1">
                      <div className="text-text-soft font-medium mb-1">{post.title}</div>
                      <div className="text-text-muted text-sm">
                        Published {new Date(post.publishedAt || '').toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-text-soft font-medium">{post.views.toLocaleString()}</div>
                      <div className="text-text-muted">views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-firefly-glow font-medium">{post.signups}</div>
                      <div className="text-text-muted">signups</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-medium">
                        {post.views > 0 ? ((post.signups / post.views) * 100).toFixed(1) : '0.0'}%
                      </div>
                      <div className="text-text-muted">CVR</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Projections */}
        <div className="mt-8 bg-gradient-to-r from-green-500/10 to-firefly-glow/10 border border-green-500/30 rounded-xl p-8">
          <h3 className="text-2xl font-light text-text-soft mb-2">💰 Financial Projections</h3>
          <p className="text-text-muted mb-8">Interactive "what-if" scenarios for profitability planning</p>

          {/* What-If Scenario */}
          <div className="bg-bg-dark rounded-lg p-6 mb-8">
            <h4 className="text-lg text-text-soft font-medium mb-4">What-If: At {targetUsers} Users</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-text-muted text-sm mb-1">Monthly Revenue</div>
                <div className="text-xl font-light text-green-400">{formatCurrency(targetMetrics.revenue)}</div>
              </div>
              <div>
                <div className="text-text-muted text-sm mb-1">Monthly Costs</div>
                <div className="text-xl font-light text-red-400">{formatCurrency(targetMetrics.costs)}</div>
              </div>
              <div>
                <div className="text-text-muted text-sm mb-1">Monthly Profit</div>
                <div className={`text-xl font-light ${targetMetrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(targetMetrics.profit)}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-sm mb-1">Annual Profit</div>
                <div className={`text-xl font-light ${targetMetrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(targetMetrics.profit * 12)}
                </div>
              </div>
            </div>
          </div>

          {/* Break-even */}
          {breakEvenUsers && (
            <div className="mb-8 p-4 bg-bg-dark rounded-lg border border-firefly-dim/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text-soft font-medium">Break-Even Point</div>
                  <div className="text-text-muted text-sm mt-1">
                    {currentUsers >= breakEvenUsers
                      ? `✅ You're profitable! (needed ${breakEvenUsers} users)`
                      : `Need ${breakEvenUsers - currentUsers} more users to break even`
                    }
                  </div>
                </div>
                <div className="text-3xl font-light text-firefly-glow">
                  {breakEvenUsers} users
                </div>
              </div>
            </div>
          )}

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-text-soft text-sm font-medium">Target Users</label>
                  <span className="text-firefly-glow font-medium">{targetUsers}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12000"
                  step="50"
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-firefly-glow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-text-soft text-sm font-medium">Monthly User Growth</label>
                  <span className="text-firefly-glow font-medium">+{monthlyGrowth} users/month</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={monthlyGrowth}
                  onChange={(e) => setMonthlyGrowth(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-firefly-glow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-text-soft text-sm font-medium">Annual Subscription</label>
                  <span className="text-firefly-glow font-medium">${subscriptionPrice}/year</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={subscriptionPrice}
                  onChange={(e) => setSubscriptionPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-firefly-glow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-text-soft text-sm font-medium">Product Conversion Rate</label>
                  <span className="text-firefly-glow font-medium">{productConversion}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={productConversion}
                  onChange={(e) => setProductConversion(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-firefly-glow"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-text-soft text-sm font-medium">Avg Product Spend/Year</label>
                  <span className="text-firefly-glow font-medium">${avgProductSpend}/year</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={avgProductSpend}
                  onChange={(e) => setAvgProductSpend(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-firefly-glow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-text-soft text-sm font-medium">Fixed Monthly Costs</label>
                  <span className="text-firefly-glow font-medium">${fixedCosts}/month</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-firefly-glow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-text-soft text-sm font-medium">Variable Cost per User/Month</label>
                  <span className="text-firefly-glow font-medium">${variableCostPerUser.toFixed(2)}/user</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={variableCostPerUser}
                  onChange={(e) => setVariableCostPerUser(parseFloat(e.target.value))}
                  className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-firefly-glow"
                />
              </div>

              <div className="p-4 bg-bg-dark rounded-lg border border-firefly-dim/30">
                <div className="text-text-muted text-sm mb-1">Customer Lifetime Value (10 years)</div>
                <div className="text-2xl font-light text-firefly-glow">
                  {formatCurrency(ltv)}
                </div>
              </div>
            </div>
          </div>

          {/* Current Actual */}
          <div className="bg-bg-dark rounded-lg p-6 mb-8">
            <h4 className="text-lg text-text-soft font-medium mb-4">Current Actual: {currentUsers} Users</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-text-muted text-sm mb-1">Monthly Revenue</div>
                <div className={`text-xl font-light ${currentMetrics.revenue >= fixedCosts ? 'text-green-400' : 'text-yellow-400'}`}>
                  {formatCurrency(currentMetrics.revenue)}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-sm mb-1">Monthly Costs</div>
                <div className="text-xl font-light text-red-400">
                  {formatCurrency(currentMetrics.costs)}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-sm mb-1">Monthly Profit</div>
                <div className={`text-xl font-light ${currentMetrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(currentMetrics.profit)}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-sm mb-1">Profit Margin</div>
                <div className={`text-xl font-light ${currentMetrics.margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {currentMetrics.margin.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* 12-Month Projection */}
          <div className="bg-bg-dark rounded-lg p-6">
            <h4 className="text-lg text-text-soft font-medium mb-4">12-Month Projection</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border-subtle">
                  <tr>
                    <th className="text-left text-text-muted font-medium pb-2">Month</th>
                    <th className="text-right text-text-muted font-medium pb-2">Users</th>
                    <th className="text-right text-text-muted font-medium pb-2">Revenue</th>
                    <th className="text-right text-text-muted font-medium pb-2">Costs</th>
                    <th className="text-right text-text-muted font-medium pb-2">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {projection.map((month) => (
                    <tr key={month.month} className="border-b border-border-subtle/50">
                      <td className="py-2 text-text-muted">
                        {month.month === 0 ? 'Now' : `Month ${month.month}`}
                      </td>
                      <td className="py-2 text-right text-text-soft">{month.users}</td>
                      <td className="py-2 text-right text-green-400">{formatCurrency(month.revenue)}</td>
                      <td className="py-2 text-right text-red-400">{formatCurrency(month.costs)}</td>
                      <td className={`py-2 text-right font-medium ${month.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(month.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Strategic Targets */}
        <div className="mt-8 bg-bg-elevated border border-border-subtle rounded-xl p-6">
          <h3 className="text-xl font-medium text-text-soft mb-6">🎯 Strategic Targets (Phase 1: 0-100 Users)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-firefly-glow mb-3">Monthly Targets</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <span className={kpis.acquisition.newUsersThisMonth >= 10 ? 'text-green-400' : 'text-yellow-400'}>
                    {kpis.acquisition.newUsersThisMonth >= 10 ? '✅' : '⏳'}
                  </span>
                  <span>10+ new users/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={kpis.content.publishedPosts >= 3 ? 'text-green-400' : 'text-yellow-400'}>
                    {kpis.content.publishedPosts >= 3 ? '✅' : '⏳'}
                  </span>
                  <span>2-3 blog posts/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Email sequence live</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Active on Pinterest, Facebook</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-firefly-glow mb-3">Success Indicators</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>• Blog posts converting at 2-5%</li>
                <li>• Organic search traffic growing</li>
                <li>• Users creating memories (not just signing up)</li>
                <li>• Feature adoption (videos, sound art)</li>
                <li>• Positive user feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

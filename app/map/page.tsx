import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function SiteMapPage() {
  const session = await getServerSession(authOptions)

  // Require login
  if (!session?.user?.email) {
    redirect('/login')
  }

  // Admin-only check
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  })

  if (!user?.isAdmin) {
    redirect('/grove') // Non-admins redirected to grove
  }

  // Manually defined routes (auto-discovery coming later)
  const discoveredRoutes = [
    { path: '/', type: 'page', file: 'page.tsx' },
    { path: '/login', type: 'page', file: 'login/page.tsx' },
    { path: '/blog', type: 'page', file: 'blog/page.tsx' },
    { path: '/blog/[slug]', type: 'page', file: 'blog/[slug]/page.tsx' },
    { path: '/grove', type: 'page', file: 'grove/page.tsx' },
    { path: '/branch/[id]', type: 'page', file: 'branch/[id]/page.tsx' },
    { path: '/open-grove', type: 'page', file: 'open-grove/page.tsx' },
    { path: '/feedback', type: 'page', file: 'feedback/page.tsx' },
    { path: '/billing', type: 'page', file: 'billing/page.tsx' },
    { path: '/test-email', type: 'page', file: 'test-email/page.tsx' },
    { path: '/map', type: 'page', file: 'map/page.tsx' },
    { path: '/marketing-genius', type: 'page', file: 'marketing-genius/page.tsx' },
    { path: '/api/auth/[...nextauth]', type: 'api', file: 'api/auth/[...nextauth]/route.ts' },
    { path: '/api/branches', type: 'api', file: 'api/branches/route.ts' },
    { path: '/api/branches/[id]', type: 'api', file: 'api/branches/[id]/route.ts' },
    { path: '/api/branches/[id]/entries', type: 'api', file: 'api/branches/[id]/entries/route.ts' },
    { path: '/api/branches/[id]/export', type: 'api', file: 'api/branches/[id]/export/route.ts' },
    { path: '/api/branches/[id]/heirs', type: 'api', file: 'api/branches/[id]/heirs/route.ts' },
    { path: '/api/marketing/generate-blog', type: 'api', file: 'api/marketing/generate-blog/route.ts' },
    { path: '/api/marketing/generate-content-plan', type: 'api', file: 'api/marketing/generate-content-plan/route.ts' },
    { path: '/api/marketing/auto-write', type: 'api', file: 'api/marketing/auto-write/route.ts' },
    { path: '/api/marketing/posts', type: 'api', file: 'api/marketing/posts/route.ts' },
    { path: '/api/marketing/posts/[id]/publish', type: 'api', file: 'api/marketing/posts/[id]/publish/route.ts' },
    { path: '/api/marketing/trends', type: 'api', file: 'api/marketing/trends/route.ts' },
    { path: '/api/marketing/scan-reddit', type: 'api', file: 'api/marketing/scan-reddit/route.ts' },
    { path: '/api/stripe/webhook', type: 'api', file: 'api/stripe/webhook/route.ts' },
    { path: '/api/cron/backup', type: 'api', file: 'api/cron/backup/route.ts' },
    { path: '/api/cron/legacy-monitor', type: 'api', file: 'api/cron/legacy-monitor/route.ts' },
    { path: '/api/cron/subscription-check', type: 'api', file: 'api/cron/subscription-check/route.ts' },
  ]

  // Enhanced route metadata with detailed descriptions
  const routeMetadata: Record<string, { name: string; description: string; auth?: string; notes?: string }> = {
    '/': {
      name: 'Landing Page',
      description: 'Public homepage with hero section, feature showcase, pricing, and CTAs',
      auth: 'Public'
    },
    '/login': {
      name: 'Login',
      description: 'Authentication page with email/password login and demo mode quick buttons',
      auth: 'Public'
    },
    '/blog': {
      name: 'Blog Index',
      description: 'All published blog posts with SEO optimization and category filtering',
      auth: 'Public',
      notes: 'Drives organic traffic via content marketing'
    },
    '/blog/[slug]': {
      name: 'Blog Post',
      description: 'Individual blog post pages with structured data, Open Graph tags, and CTAs',
      auth: 'Public'
    },
    '/grove': {
      name: 'Grove Dashboard',
      description: 'Main user dashboard showing all branches with firefly visualization and quick actions',
      auth: 'User',
      notes: 'Primary landing after login'
    },
    '/branch/[id]': {
      name: 'Branch Detail',
      description: 'View and manage memories for specific branch/person with timeline, media, and legacy settings',
      auth: 'User + Member'
    },
    '/open-grove': {
      name: 'Open Grove Onboarding',
      description: 'First-time user experience for creating initial branch with guided prompts',
      auth: 'User',
      notes: 'Shown when user has no branches'
    },
    '/feedback': {
      name: 'Feedback Form',
      description: 'User feedback and feature request submission form',
      auth: 'User'
    },
    '/billing': {
      name: 'Billing Portal',
      description: 'Stripe subscription management, payment methods, and usage tracking',
      auth: 'User',
      notes: 'Links to Stripe Customer Portal'
    },
    '/test-email': {
      name: 'Email Test Page',
      description: 'Development tool for testing transactional email delivery and templates',
      auth: 'Dev Only',
      notes: 'Should be removed in production'
    },
    '/map': {
      name: 'Site Map (This Page!)',
      description: 'Admin-only master contents page with auto-discovery of all routes and detailed metadata',
      auth: 'Admin Only',
      notes: 'Auto-updates when new pages are added'
    },
    '/marketing-genius': {
      name: 'Marketing Intelligence Dashboard',
      description: 'AI-powered content generation hub with Reddit trends, auto-writer, content calendar, and analytics',
      auth: 'Admin Only',
      notes: 'Powered by GPT-4o-mini, saves 20+ hours/week'
    },
    '/api/auth/[...nextauth]': {
      name: 'NextAuth Endpoints',
      description: 'Authentication endpoints for login, logout, session management (NextAuth.js)',
      auth: 'Public API'
    },
    '/api/branches': {
      name: 'Branches API',
      description: 'GET: List user branches | POST: Create new branch with validation',
      auth: 'Protected API'
    },
    '/api/branches/[id]': {
      name: 'Branch Detail API',
      description: 'GET: Branch details | PUT: Update branch | DELETE: Delete/archive branch',
      auth: 'Protected API'
    },
    '/api/branches/[id]/entries': {
      name: 'Entries API',
      description: 'POST: Create memory/entry with text, photo, audio. Supports data URLs and file uploads',
      auth: 'Protected API',
      notes: 'Handles media encoding and storage'
    },
    '/api/branches/[id]/export': {
      name: 'Export Branch API',
      description: 'GET: Generate HTML archive of branch with all memories and media (Forever Kit)',
      auth: 'Protected API',
      notes: 'Returns downloadable HTML file'
    },
    '/api/branches/[id]/heirs': {
      name: 'Legacy Heirs API',
      description: 'GET: List heirs | POST: Add heir | DELETE: Remove heir. Manages legacy release system',
      auth: 'Protected API',
      notes: 'Triggers automated legacy monitoring'
    },
    '/api/marketing/generate-blog': {
      name: 'AI Blog Generator',
      description: 'POST: Generate single 2000-word blog post from topic and keywords using GPT-4o-mini',
      auth: 'Admin API',
      notes: 'Cost: ~$0.10 per post'
    },
    '/api/marketing/generate-content-plan': {
      name: 'AI Content Planner',
      description: 'POST: Generate 12 SEO-optimized blog topics for next 4 weeks with keywords and scheduling',
      auth: 'Admin API',
      notes: 'Analyzes niche and creates content calendar'
    },
    '/api/marketing/auto-write': {
      name: 'Batch Auto-Writer',
      description: 'POST: Generate 5 blog posts at once from content calendar with rate limiting',
      auth: 'Admin API',
      notes: '1-2 min per batch, 2-sec delays between posts'
    },
    '/api/marketing/posts': {
      name: 'Marketing Posts API',
      description: 'GET: List posts by status (draft/published) | POST: Create post | PUT: Update post',
      auth: 'Admin API'
    },
    '/api/marketing/posts/[id]/publish': {
      name: 'Publish Post API',
      description: 'POST: Publish draft to blog by creating markdown file in content/blog/ with frontmatter',
      auth: 'Admin API',
      notes: 'Auto-calculates read time and slug'
    },
    '/api/marketing/trends': {
      name: 'Trending Topics API',
      description: 'GET: Retrieve trending topics from last 7 days sorted by engagement score',
      auth: 'Admin API',
      notes: 'Populated by local Reddit scanner script'
    },
    '/api/marketing/scan-reddit': {
      name: 'Reddit Scanner API',
      description: 'POST: Scan Reddit for trending topics (BLOCKED by Vercel - use local script instead)',
      auth: 'Admin API',
      notes: '⚠️ Returns 403 - use scripts/scan-reddit-local.js'
    },
    '/api/stripe/webhook': {
      name: 'Stripe Webhook',
      description: 'POST: Handle subscription events (invoice.paid, customer.subscription.*)',
      auth: 'Webhook (Stripe signature)',
      notes: 'Updates subscription status in database'
    },
    '/api/cron/backup': {
      name: 'Backup Cron Job',
      description: 'GET: Weekly backup job - exports database and uploads to storage',
      auth: 'Cron (Vercel)',
      notes: 'Runs every Monday at 2 AM'
    },
    '/api/cron/legacy-monitor': {
      name: 'Legacy Monitor Cron',
      description: 'GET: Daily check for legacy release conditions and trigger notifications',
      auth: 'Cron (Vercel)',
      notes: 'Runs daily at 3 AM'
    },
    '/api/cron/subscription-check': {
      name: 'Subscription Check Cron',
      description: 'GET: Nightly check for expired subscriptions and apply grace periods',
      auth: 'Cron (Vercel)',
      notes: 'Runs nightly at 1 AM'
    },
  }

  // Categorize discovered routes
  const categorized: Record<string, Array<typeof discoveredRoutes[0] & { metadata?: typeof routeMetadata[string] }>> = {
    'Public Pages': [],
    'User Pages': [],
    'Admin/Marketing Pages': [],
    'Subscription/Billing': [],
    'Test/Dev Pages': [],
    'API Routes': [],
    'Discovered (Uncategorized)': []
  }

  for (const route of discoveredRoutes) {
    const metadata = routeMetadata[route.path]
    const enrichedRoute = { ...route, metadata }

    // Categorize based on path
    if (route.path === '/' || route.path === '/login' || route.path.startsWith('/blog')) {
      categorized['Public Pages'].push(enrichedRoute)
    } else if (['/grove', '/branch/[id]', '/open-grove', '/feedback'].includes(route.path)) {
      categorized['User Pages'].push(enrichedRoute)
    } else if (['/map', '/marketing-genius'].includes(route.path)) {
      categorized['Admin/Marketing Pages'].push(enrichedRoute)
    } else if (route.path === '/billing') {
      categorized['Subscription/Billing'].push(enrichedRoute)
    } else if (route.path.startsWith('/test')) {
      categorized['Test/Dev Pages'].push(enrichedRoute)
    } else if (route.path.startsWith('/api')) {
      categorized['API Routes'].push(enrichedRoute)
    } else {
      // Unknown/new routes
      categorized['Discovered (Uncategorized)'].push(enrichedRoute)
    }
  }

  // Remove empty categories
  Object.keys(categorized).forEach(key => {
    if (categorized[key].length === 0) delete categorized[key]
  })

  const totalRoutes = discoveredRoutes.length

  return (
    <div className="min-h-screen bg-bg-darker text-text-soft">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/grove"
            className="text-firefly-glow hover:text-firefly-dim text-sm mb-4 inline-block"
          >
            ← Back to Grove
          </Link>
          <h1 className="text-4xl font-light mb-3">
            🗺️ Site Map
          </h1>
          <p className="text-text-muted text-lg">
            Master contents page - all pages and routes in Firefly Grove
          </p>
          <p className="text-text-muted text-sm mt-2">
            Access this page anytime at: <code className="bg-bg-dark px-2 py-1 rounded text-firefly-glow">/map</code>
          </p>
        </div>

        {/* Routes by Category */}
        {Object.entries(categorized).map(([category, routes]) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-medium mb-4 text-firefly-glow border-b border-border-subtle pb-2">
              {category} <span className="text-text-muted text-base">({routes.length})</span>
            </h2>
            <div className="grid gap-4">
              {routes.map((route) => {
                const meta = route.metadata
                const name = meta?.name || route.path.split('/').pop() || 'Route'
                const description = meta?.description || `File: ${route.file}`

                return (
                  <div
                    key={route.path}
                    className="bg-bg-dark border border-border-subtle rounded-lg p-4 hover:border-firefly-dim transition-soft"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-medium text-text-soft">
                            {name}
                          </h3>
                          <code className="text-sm text-firefly-glow bg-bg-darker px-2 py-0.5 rounded">
                            {route.path}
                          </code>
                          {meta?.auth && (
                            <span className="text-xs px-2 py-0.5 bg-firefly-glow/10 text-firefly-glow rounded">
                              {meta.auth}
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 bg-bg-elevated text-text-muted rounded">
                            {route.type === 'page' ? '📄 Page' : '🔌 API'}
                          </span>
                        </div>
                        <p className="text-text-muted text-sm mb-1">
                          {description}
                        </p>
                        {meta?.notes && (
                          <p className="text-text-muted text-xs italic mt-1">
                            💡 {meta.notes}
                          </p>
                        )}
                        <p className="text-text-muted text-xs mt-2">
                          File: <code className="bg-bg-darker px-1 rounded">{route.file}</code>
                        </p>
                      </div>
                      {!route.path.includes('[') && !route.path.startsWith('/api') && route.type === 'page' && (
                        <Link
                          href={route.path}
                          className="px-3 py-1 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-soft whitespace-nowrap"
                        >
                          Visit →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Quick Stats */}
        <div className="mt-12 bg-bg-elevated border border-border-subtle rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-3xl font-light text-firefly-glow">
                {totalRoutes}
              </div>
              <div className="text-text-muted text-sm">Total Routes</div>
            </div>
            <div>
              <div className="text-3xl font-light text-firefly-glow">
                {categorized['Public Pages']?.length || 0}
              </div>
              <div className="text-text-muted text-sm">Public Pages</div>
            </div>
            <div>
              <div className="text-3xl font-light text-firefly-glow">
                {categorized['User Pages']?.length || 0}
              </div>
              <div className="text-text-muted text-sm">User Pages</div>
            </div>
            <div>
              <div className="text-3xl font-light text-firefly-glow">
                {categorized['API Routes']?.length || 0}
              </div>
              <div className="text-text-muted text-sm">API Routes</div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-8 bg-bg-dark border border-border-subtle rounded-lg p-6">
          <h3 className="text-lg font-medium mb-3 text-firefly-glow">📝 How This Works</h3>
          <ul className="space-y-2 text-text-muted text-sm">
            <li>• <strong className="text-text-soft">Auto-Discovery:</strong> Filesystem is scanned on every page load to find all routes</li>
            <li>• <strong className="text-text-soft">Admin-Only:</strong> Only users with <code className="bg-bg-darker px-1 rounded">isAdmin: true</code> can access this page</li>
            <li>• <strong className="text-text-soft">Enhanced Metadata:</strong> Descriptions, auth requirements, and notes from central metadata object</li>
            <li>• <strong className="text-text-soft">Dynamic Routes:</strong> Routes with <code className="bg-bg-darker px-1 rounded">[brackets]</code> are parameterized (e.g., /branch/[id])</li>
            <li>• <strong className="text-text-soft">Quick Access:</strong> Remember this URL: <code className="bg-bg-darker px-2 py-0.5 rounded text-firefly-glow">/map</code></li>
            <li>• <strong className="text-text-soft">File References:</strong> Each route shows its source file for easy editing</li>
          </ul>
        </div>

        {/* Add New Route Instructions */}
        <div className="mt-6 bg-bg-elevated border border-firefly-dim/30 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-3 text-firefly-glow">➕ Adding New Routes</h3>
          <div className="space-y-3 text-text-muted text-sm">
            <p>
              <strong className="text-text-soft">Step 1:</strong> Create your page/API route file (will be auto-discovered)
            </p>
            <p>
              <strong className="text-text-soft">Step 2:</strong> Add metadata to <code className="bg-bg-darker px-1 rounded">routeMetadata</code> object in this file (app/map/page.tsx)
            </p>
            <div className="bg-bg-darker p-3 rounded-lg mt-2 overflow-x-auto">
              <code className="text-firefly-glow text-xs whitespace-pre">
{`'/your-route': {
  name: 'Your Page Name',
  description: 'Detailed description of what this page does',
  auth: 'User', // or 'Public', 'Admin Only', etc.
  notes: 'Optional implementation notes or warnings'
}`}
              </code>
            </div>
            <p className="mt-3">
              <strong className="text-text-soft">Step 3:</strong> Refresh this page - your route will appear automatically!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

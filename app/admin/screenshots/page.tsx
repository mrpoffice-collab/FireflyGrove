'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface PageConfig {
  name: string
  path: string
  description: string
  requiresAuth?: boolean
  category: 'Main' | 'Features' | 'Admin' | 'Settings' | 'Marketing'
}

const PAGES: PageConfig[] = [
  // Main Pages
  { name: 'Landing Page', path: '/', description: 'Public home page', category: 'Main' },
  { name: 'Login', path: '/login', description: 'User login', category: 'Main' },
  { name: 'Signup', path: '/signup', description: 'User registration', category: 'Main' },
  { name: 'Beta Landing', path: '/fb-post', description: 'Beta signup page', category: 'Main' },

  // Core Features
  { name: 'My Grove', path: '/grove', description: 'Main dashboard', requiresAuth: true, category: 'Features' },
  { name: 'Open Grove', path: '/open-grove', description: 'Public memorials', category: 'Features' },
  { name: 'My Nest', path: '/nest', description: 'Photo storage', requiresAuth: true, category: 'Features' },
  { name: 'Forever Kit', path: '/forever-kit', description: 'Legacy planning', requiresAuth: true, category: 'Features' },
  { name: 'Spark Collections', path: '/spark-collections', description: 'Prompt management', requiresAuth: true, category: 'Settings' },
  { name: 'Import Memories', path: '/settings/imports', description: 'Import tool', requiresAuth: true, category: 'Settings' },
  { name: 'Billing', path: '/billing', description: 'Plan management', requiresAuth: true, category: 'Settings' },

  // Grove Exchange
  { name: 'Grove Exchange', path: '/grove-exchange', description: 'Products marketplace', category: 'Marketing' },
  { name: 'Sound Art', path: '/soundart', description: 'Sound wave art', category: 'Marketing' },
  { name: 'Greeting Cards', path: '/cards', description: 'Custom cards', category: 'Marketing' },

  // Admin Pages
  { name: 'Analytics', path: '/admin/analytics', description: 'Admin analytics', requiresAuth: true, category: 'Admin' },
  { name: 'Beta Invites', path: '/admin/beta-invites', description: 'Invite management', requiresAuth: true, category: 'Admin' },
  { name: 'Marketing Intelligence', path: '/marketing-genius', description: 'Marketing tools', requiresAuth: true, category: 'Admin' },
  { name: 'Pinterest Integration', path: '/admin/pinterest', description: 'Pinterest tools', requiresAuth: true, category: 'Admin' },
]

export default function ScreenshotsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const isAdmin = (session?.user as any)?.isAdmin

  if (!isAdmin) {
    router.push('/grove')
    return null
  }

  const categories = ['All', 'Main', 'Features', 'Admin', 'Settings', 'Marketing']

  const filteredPages = selectedCategory === 'All'
    ? PAGES
    : PAGES.filter(p => p.category === selectedCategory)

  const togglePage = (path: string) => {
    setSelectedPages(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const selectAll = () => {
    setSelectedPages(filteredPages.map(p => p.path))
  }

  const clearAll = () => {
    setSelectedPages([])
  }

  const openPagesInTabs = () => {
    if (selectedPages.length === 0) {
      alert('Please select at least one page')
      return
    }

    // Open each page in a new tab
    selectedPages.forEach((path, index) => {
      setTimeout(() => {
        const baseUrl = window.location.origin
        window.open(`${baseUrl}${path}`, `_blank_${index}`)
      }, index * 100) // Stagger opening to avoid browser blocking
    })

    alert(`Opening ${selectedPages.length} pages in new tabs.\n\nTo take screenshots:\n1. Each page will open in a new tab\n2. Use browser dev tools (F12)\n3. Toggle device toolbar (Ctrl+Shift+M)\n4. Use "Capture screenshot" option\n\nOr use a browser extension like "Full Page Screen Capture"`)
  }

  const generateInstructions = () => {
    return `
# Automated Screenshot Instructions

## Option 1: Browser DevTools (Manual but Free)
1. Open page in Chrome/Edge
2. Press F12 (DevTools)
3. Press Ctrl+Shift+M (Device toolbar)
4. Select device (e.g., "Responsive" or "iPhone 14 Pro")
5. Click "⋮" menu → "Capture screenshot"
6. Screenshot saves to Downloads

## Option 2: Browser Extension (Recommended)
Install "Full Page Screen Capture" or "GoFullPage":
1. Visit Chrome Web Store
2. Install extension
3. Click extension icon on any page
4. Auto-captures entire page
5. Downloads as PNG

## Option 3: Playwright (Fully Automated)
\`\`\`bash
# Install
npm install -D @playwright/test

# Create script (scripts/screenshot-pages.ts)
import { chromium } from '@playwright/test';

const pages = ${JSON.stringify(selectedPages, null, 2)};

for (const path of pages) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000' + path);
  await page.screenshot({
    path: 'screenshots/' + path.replace(/\\//g, '_') + '.png',
    fullPage: true
  });
  await browser.close();
}
\`\`\`

## Option 4: Puppeteer (Automated)
\`\`\`bash
npm install puppeteer
npx tsx scripts/screenshot-pages.ts
\`\`\`

Selected Pages (${selectedPages.length}):
${selectedPages.map(p => `- ${typeof window !== 'undefined' ? window.location.origin : 'https://fireflygrove.app'}${p}`).join('\n')}
    `.trim()
  }

  const copyInstructions = () => {
    navigator.clipboard.writeText(generateInstructions())
    alert('Instructions copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header
        userName={session?.user?.name || ''}
        isAdmin={isAdmin}
        isBetaTester={(session?.user as any)?.isBetaTester || false}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-firefly-glow mb-2">
            📸 Page Screenshot Generator
          </h1>
          <p className="text-text-muted">
            Select pages to capture screenshots for documentation, marketing, or testing
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow border border-firefly-dim/40 rounded text-sm transition-soft"
              >
                Select All ({filteredPages.length})
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-bg-dark hover:bg-border-subtle text-text-muted border border-border-subtle rounded text-sm transition-soft"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openPagesInTabs}
                disabled={selectedPages.length === 0}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-soft disabled:bg-gray-700 disabled:text-gray-500"
              >
                📱 Open in Tabs ({selectedPages.length})
              </button>
              <button
                onClick={copyInstructions}
                disabled={selectedPages.length === 0}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-soft disabled:bg-gray-700 disabled:text-gray-500"
              >
                📋 Copy Instructions
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded text-sm whitespace-nowrap transition-soft ${
                selectedCategory === cat
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-elevated text-text-muted hover:bg-border-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Page Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page) => {
            const isSelected = selectedPages.includes(page.path)

            return (
              <button
                key={page.path}
                onClick={() => togglePage(page.path)}
                className={`text-left p-4 rounded-lg border-2 transition-soft ${
                  isSelected
                    ? 'bg-firefly-dim/10 border-firefly-dim text-text-soft'
                    : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-firefly-dim/40'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{page.name}</h3>
                    <p className="text-xs opacity-70 mb-2">{page.description}</p>
                    <code className="text-xs bg-bg-dark px-2 py-1 rounded">
                      {page.path}
                    </code>
                  </div>
                  <div className={`ml-2 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? 'bg-firefly-dim border-firefly-dim'
                      : 'border-border-subtle'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-bg-dark" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                {page.requiresAuth && (
                  <span className="inline-block text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                    🔒 Auth Required
                  </span>
                )}
                <span className={`inline-block ml-2 text-xs px-2 py-0.5 rounded ${
                  page.category === 'Admin' ? 'bg-purple-500/20 text-purple-300' :
                  page.category === 'Features' ? 'bg-blue-500/20 text-blue-300' :
                  page.category === 'Settings' ? 'bg-green-500/20 text-green-300' :
                  page.category === 'Marketing' ? 'bg-pink-500/20 text-pink-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {page.category}
                </span>
              </button>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-bg-elevated border border-border-subtle rounded-lg p-6">
          <h2 className="text-xl text-text-soft mb-4">💡 How to Capture Screenshots</h2>

          <div className="space-y-4 text-text-muted text-sm">
            <div>
              <h3 className="text-text-soft font-medium mb-2">Quick Method (Recommended)</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Select pages above and click "Open in Tabs"</li>
                <li>Install browser extension: "Full Page Screen Capture" or "GoFullPage"</li>
                <li>Click extension on each tab to capture</li>
                <li>Screenshots auto-download to your Downloads folder</li>
              </ol>
            </div>

            <div>
              <h3 className="text-text-soft font-medium mb-2">Manual Method (Built-in)</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open DevTools (F12)</li>
                <li>Toggle device toolbar (Ctrl+Shift+M)</li>
                <li>Click "⋮" menu → "Capture screenshot"</li>
              </ol>
            </div>

            <div>
              <h3 className="text-text-soft font-medium mb-2">Fully Automated (Advanced)</h3>
              <p className="mb-2">Click "Copy Instructions" to get code for Playwright/Puppeteer automation</p>
              <code className="block bg-bg-dark p-3 rounded text-xs">
                npm install -D @playwright/test
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

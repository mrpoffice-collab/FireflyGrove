import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Footer from '@/components/Footer'
import StructuredData from '@/components/StructuredData'
// import CommunityGoalBanner from '@/components/CommunityGoalBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://firefly-grove.vercel.app'),
  title: {
    default: 'Firefly Grove - Preserve Your Family Legacy Forever',
    template: '%s | Firefly Grove'
  },
  description: 'Create a beautiful digital legacy for your family. Preserve memories, photos, videos, and sound art. Build memorial tributes and share your family story across generations.',
  keywords: ['family legacy', 'digital memories', 'memory preservation', 'family tree', 'memorial videos', 'sound wave art', 'genealogy', 'family history', 'digital legacy', 'memory keeper'],
  authors: [{ name: 'Firefly Grove' }],
  creator: 'Firefly Grove',
  publisher: 'Firefly Grove',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Firefly Grove'
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://firefly-grove.vercel.app',
    title: 'Firefly Grove - Preserve Your Family Legacy Forever',
    description: 'Create a beautiful digital legacy for your family. Preserve memories, photos, videos, and sound art. Build memorial tributes and share your family story across generations.',
    siteName: 'Firefly Grove',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Firefly Grove - Where memories take root and keep growing',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Firefly Grove - Preserve Your Family Legacy Forever',
    description: 'Create a beautiful digital legacy for your family. Preserve memories, photos, videos, and sound art.',
    images: ['/og-image.png'],
    creator: '@fireflygrove',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these later when you set up Google Search Console
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className}`} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Background image layer */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/background.png?v=2)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        {/* Dark overlay layer 1 - primary tint */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 14, 20, 0.90)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        {/* Dark overlay layer 2 - subtle warm tint */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 8, 16, 0.05)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh', flex: 1 }}>
          <Providers>
            {/* <CommunityGoalBanner /> */}
            <div style={{ flex: 1 }}>{children}</div>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Footer from '@/components/Footer'
// import CommunityGoalBanner from '@/components/CommunityGoalBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Firefly Grove',
  description: 'A private memory journal for preserving the stories that shaped your life',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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

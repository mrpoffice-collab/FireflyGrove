import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Footer from '@/components/Footer'

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
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* Background image layer */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />
        {/* Dark overlay */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'rgba(10, 14, 20, 0.30)',
            zIndex: 1,
          }}
        />
        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Providers>
            <div className="flex-1">{children}</div>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  )
}

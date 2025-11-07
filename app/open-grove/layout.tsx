import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open Grove - Where Memories Shine Eternal | Firefly Grove',
  description: 'Where memories shine eternal. Every story honored. Every light a life well-lived. Visit the Open Grove to celebrate lives and preserve legacies.',
  openGraph: {
    title: 'Open Grove - Where Memories Shine Eternal',
    description: 'Where memories shine eternal. Every story honored. Every light a life well-lived.',
    url: 'https://fireflygrove.app/open-grove',
    siteName: 'Firefly Grove',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Grove - Where Memories Shine Eternal',
    description: 'Where memories shine eternal. Every story honored. Every light a life well-lived.',
  },
}

export default function OpenGroveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

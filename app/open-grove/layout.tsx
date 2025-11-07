import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open Grove - Firefly Grove',
  description: 'A public garden where every story glows. Visit the Open Grove to explore and search memorials, where memories shine eternal.',
  openGraph: {
    title: 'Open Grove - Firefly Grove',
    description: 'A public garden where every story glows. Visit the Open Grove to explore and search memorials.',
    url: 'https://fireflygrove.app/open-grove',
    siteName: 'Firefly Grove',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Grove - Firefly Grove',
    description: 'A public garden where every story glows. Visit the Open Grove to explore and search memorials.',
  },
}

export default function OpenGroveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

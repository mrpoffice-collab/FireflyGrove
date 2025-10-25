import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Heart in a Grove of Light | Firefly Grove',
  description: 'A place where memories take root and light never fades. Plant a tree for someone you love and watch their story glow.',
  openGraph: {
    title: 'My Heart in a Grove of Light',
    description: 'This might be one of the most meaningful things I\'ve ever made. A place where memories take root and light never fades.',
    url: 'https://fireflygrove.app/fb-post',
    siteName: 'Firefly Grove',
    images: [
      {
        url: 'https://fireflygrove.app/fb-post-screenshot.png',
        width: 1200,
        height: 1500,
        alt: 'My Heart in a Grove of Light - Firefly Grove',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Heart in a Grove of Light',
    description: 'A place where memories take root and light never fades.',
    images: ['https://fireflygrove.app/fb-post-screenshot.png'],
  },
}

export default function FBPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

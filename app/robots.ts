import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/grove/*', '/admin/*'],
      },
      {
        // Explicitly allow Facebook's crawler
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
    ],
    sitemap: 'https://fireflygrove.app/sitemap.xml',
  }
}

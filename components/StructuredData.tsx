export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Firefly Grove",
    "url": "https://firefly-grove.vercel.app",
    "description": "Create a beautiful digital legacy for your family. Preserve memories, photos, videos, and sound art. Build memorial tributes and share your family story across generations.",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0",
      "highPrice": "99",
      "offerCount": "4"
    },
    "featureList": [
      "Family memory preservation",
      "Photo and video storage",
      "Sound wave art creation",
      "Memorial video generation",
      "Branch-based organization",
      "Legacy transfer to heirs"
    ],
    "screenshot": "https://firefly-grove.vercel.app/og-image.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    }
  }

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Firefly Grove",
    "url": "https://firefly-grove.vercel.app",
    "logo": "https://firefly-grove.vercel.app/icon.svg",
    "description": "Digital legacy and memory preservation platform for families",
    "sameAs": [
      "https://twitter.com/fireflygrove",
      // Add more social media URLs when available
    ]
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://firefly-grove.vercel.app"
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  )
}

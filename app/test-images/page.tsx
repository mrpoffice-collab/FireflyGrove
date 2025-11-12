'use client'

import { useEffect, useState } from 'react'

export default function TestImagesPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/test-burst-images')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load test images:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-soft">Loading test images...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light text-firefly-glow mb-6">
          Image Loading Test
        </h1>

        <div className="space-y-8">
          {entries.map((entry, i) => {
            const isBase64 = entry.mediaUrl?.startsWith('data:')
            const imageType = !entry.mediaUrl
              ? 'No image'
              : isBase64
              ? 'BASE64'
              : 'URL'

            return (
              <div
                key={entry.id}
                className="bg-bg-elevated border border-firefly-dim/30 rounded-lg p-4"
              >
                <div className="mb-2">
                  <span className="text-text-soft text-sm">
                    #{i + 1} - Type: {imageType}
                  </span>
                </div>

                <p className="text-text-primary mb-4">
                  {entry.text.substring(0, 100)}...
                </p>

                {entry.mediaUrl && (
                  <div className="relative">
                    <img
                      src={entry.mediaUrl}
                      alt="Test"
                      className="w-full max-w-md rounded border border-firefly-dim/30"
                      onLoad={() => console.log(`✅ Image ${i + 1} loaded (${imageType})`)}
                      onError={(e) => {
                        console.error(`❌ Image ${i + 1} failed (${imageType})`, e)
                      }}
                    />
                    <div className="mt-2 text-xs text-text-muted">
                      {isBase64
                        ? `Base64 size: ${(entry.mediaUrl.length / 1024).toFixed(1)} KB`
                        : `URL: ${entry.mediaUrl.substring(0, 80)}...`}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

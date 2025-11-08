import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Memorial - Firefly Grove'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params

  // Fetch branch data from API instead of using Prisma directly
  let personName = 'Memorial'
  let memoryCount = 0
  let years = ''
  let description = 'Help us honor this life by sharing your stories, photos, and memories.'

  try {
    const apiUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/og/branch/${branchId}`
      : `http://localhost:3000/api/og/branch/${branchId}`

    console.log('[OG Image] Fetching from:', apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'FireflyGrove-OGImage/1.0',
      },
    })

    if (response.ok) {
      const data = await response.json()
      personName = data.person?.name || data.title || 'Memorial'
      memoryCount = data.memoryCount || 0
      description = data.description || description

      if (data.person?.birthDate && data.person?.deathDate) {
        const birthYear = new Date(data.person.birthDate).getFullYear()
        const deathYear = new Date(data.person.deathDate).getFullYear()
        years = `${birthYear} - ${deathYear}`
      }
    } else {
      console.error('[OG Image] API returned:', response.status)
    }
  } catch (error) {
    console.error('[OG Image] Error fetching branch data:', error)
    // Continue with fallback values
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #1a1410 0%, #2d1f15 50%, #1a1410 100%)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: 'relative',
        }}
      >
        {/* Ambient glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(255,200,87,0.25) 0%, rgba(255,191,0,0.1) 40%, transparent 70%)',
            filter: 'blur(80px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '70%',
            left: '30%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,215,120,0.15) 0%, transparent 60%)',
            filter: 'blur(50px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '70%',
            left: '70%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,215,120,0.15) 0%, transparent 60%)',
            filter: 'blur(50px)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {/* Candle Icon */}
          <div
            style={{
              fontSize: '100px',
              marginBottom: '40px',
              filter: 'drop-shadow(0 0 40px rgba(255,200,87,0.8)) drop-shadow(0 0 80px rgba(255,191,0,0.4))',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            🕯️
          </div>

          {/* Person's Name */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 300,
              color: '#ffd89b',
              marginBottom: '20px',
              letterSpacing: '2px',
              textShadow: '0 0 30px rgba(255,200,87,0.5)',
              lineHeight: 1.2,
              maxWidth: '1000px',
              display: 'flex',
            }}
          >
            {personName}
          </div>

          {/* Years */}
          {years && (
            <div
              style={{
                fontSize: '28px',
                color: '#c4a574',
                marginBottom: '30px',
                letterSpacing: '1px',
                display: 'flex',
              }}
            >
              {years}
            </div>
          )}

          {/* Call to Action */}
          <div
            style={{
              fontSize: '32px',
              color: '#e8c896',
              marginBottom: '20px',
              fontStyle: 'italic',
              maxWidth: '900px',
              lineHeight: 1.3,
              textShadow: '0 0 20px rgba(255,200,87,0.3)',
              display: 'flex',
            }}
          >
            Share your memories
          </div>

          {/* Memory Count */}
          <div
            style={{
              fontSize: '24px',
              color: '#a08968',
              marginBottom: '30px',
              display: 'flex',
            }}
          >
            {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} preserved
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '22px',
              color: '#8b7355',
              maxWidth: '850px',
              lineHeight: 1.5,
              display: 'flex',
            }}
          >
            {description}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '50px',
              fontSize: '20px',
              color: '#6b5b47',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              letterSpacing: '1px',
            }}
          >
            <span style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,87,0.6))', display: 'flex' }}>✨</span>
            <span>Firefly Grove</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

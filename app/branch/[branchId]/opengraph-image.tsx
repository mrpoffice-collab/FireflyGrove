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

  try {
    // Fetch branch data from API route instead of Prisma (edge runtime doesn't support Prisma)
    // Always use production URL to avoid edge runtime fetch issues
    const response = await fetch(`https://fireflygrove.app/api/branches/${branchId}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      // Return error image with status code for debugging
      return new ImageResponse(
        (
          <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1410',
            color: '#ffd89b',
            fontSize: '32px',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <div>Branch not found</div>
            <div style={{ fontSize: '20px', color: '#c4a574' }}>Error {response.status}</div>
          </div>
        ),
        { ...size }
      )
    }

    const branch = await response.json()

    // Use person.memoryCount instead of entries.length (which may be paginated)
    const personName = branch.person?.name || branch.title
    const memoryCount = branch.person?.memoryCount || branch.pagination?.total || 0
    const years = branch.person?.birthDate && branch.person?.deathDate
      ? `${new Date(branch.person.birthDate).getFullYear()} - ${new Date(branch.person.deathDate).getFullYear()}`
      : ''

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
              }}
            >
              {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} preserved
            </div>

            {/* Description or default */}
            <div
              style={{
                fontSize: '22px',
                color: '#8b7355',
                maxWidth: '850px',
                lineHeight: 1.5,
              }}
            >
              {branch.description || 'Help us honor this life by sharing your stories, photos, and memories.'}
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
              <span style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,87,0.6))' }}>✨</span>
              <span>Firefly Grove</span>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('Error generating memorial OG image:', error)
    // Fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1410',
            color: '#ffd89b',
            fontSize: '48px',
          }}
        >
          Memorial - Firefly Grove
        </div>
      ),
      { ...size }
    )
  }
}

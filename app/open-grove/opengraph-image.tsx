import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Open Grove - A public garden where every story glows'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0a0a 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Ambient glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255,191,0,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
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
              fontSize: '120px',
              marginBottom: '40px',
              filter: 'drop-shadow(0 0 30px rgba(255,191,0,0.6))',
            }}
          >
            🕯️
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 300,
              color: '#f5e6d3',
              marginBottom: '30px',
              letterSpacing: '2px',
            }}
          >
            Open Grove
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: '#c4a574',
              marginBottom: '20px',
              fontStyle: 'italic',
              maxWidth: '900px',
            }}
          >
            A public garden where every story glows
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '24px',
              color: '#8b7355',
              maxWidth: '800px',
              lineHeight: 1.5,
            }}
          >
            Each candle a memory, each memory a life that still shines
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '60px',
              fontSize: '20px',
              color: '#6b5b47',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>✨</span>
            <span>firefly grove</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Open Grove - Where memories shine eternal'
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
          background: 'linear-gradient(to bottom, #1a1410 0%, #2d1f15 50%, #1a1410 100%)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: 'relative',
        }}
      >
        {/* Multiple ambient glow effects - softer, warmer */}
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

        {/* Subtle star field */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(2px 2px at 20% 30%, rgba(255,215,120,0.3), transparent), radial-gradient(2px 2px at 60% 70%, rgba(255,215,120,0.3), transparent), radial-gradient(1px 1px at 50% 50%, rgba(255,215,120,0.2), transparent), radial-gradient(1px 1px at 80% 10%, rgba(255,215,120,0.3), transparent), radial-gradient(2px 2px at 90% 60%, rgba(255,215,120,0.2), transparent), radial-gradient(1px 1px at 33% 80%, rgba(255,215,120,0.3), transparent)',
            backgroundSize: '200% 200%',
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
          {/* Candle Icon with stronger glow */}
          <div
            style={{
              fontSize: '140px',
              marginBottom: '50px',
              filter: 'drop-shadow(0 0 40px rgba(255,200,87,0.8)) drop-shadow(0 0 80px rgba(255,191,0,0.4))',
              lineHeight: 1,
            }}
          >
            🕯️
          </div>

          {/* Title with warmth */}
          <div
            style={{
              fontSize: '80px',
              fontWeight: 300,
              color: '#ffd89b',
              marginBottom: '35px',
              letterSpacing: '4px',
              textShadow: '0 0 30px rgba(255,200,87,0.5)',
              lineHeight: 1,
            }}
          >
            Open Grove
          </div>

          {/* Subtitle - more hopeful */}
          <div
            style={{
              fontSize: '36px',
              color: '#e8c896',
              marginBottom: '25px',
              fontStyle: 'italic',
              maxWidth: '900px',
              lineHeight: 1.3,
              textShadow: '0 0 20px rgba(255,200,87,0.3)',
            }}
          >
            Where memories shine eternal
          </div>

          {/* Description - uplifting */}
          <div
            style={{
              fontSize: '26px',
              color: '#c4a574',
              maxWidth: '850px',
              lineHeight: 1.5,
            }}
          >
            Every story honored. Every light a life well-lived.
          </div>

          {/* Footer with firefly */}
          <div
            style={{
              marginTop: '70px',
              fontSize: '22px',
              color: '#a08968',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
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
}

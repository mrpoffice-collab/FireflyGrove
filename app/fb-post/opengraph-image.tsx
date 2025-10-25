import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Firefly Grove - Where memories take root'
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
          background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative firefly dots */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#ffd966',
            opacity: 0.6,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '15%',
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            background: '#ffd966',
            opacity: 0.5,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '20%',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#ffd966',
            opacity: 0.7,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '25%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#ffd966',
            opacity: 0.4,
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px',
          }}
        >
          {/* Emoji */}
          <div
            style={{
              fontSize: '120px',
              marginBottom: '40px',
              display: 'flex',
            }}
          >
            🌿
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: '300',
              color: '#ffd966',
              marginBottom: '30px',
              lineHeight: 1.2,
              display: 'flex',
              textAlign: 'center',
            }}
          >
            My Heart in a Grove of Light
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: '#e0e0e0',
              marginBottom: '40px',
              lineHeight: 1.4,
              maxWidth: '900px',
              display: 'flex',
              textAlign: 'center',
            }}
          >
            A place where memories take root and light never fades
          </div>

          {/* Site name */}
          <div
            style={{
              fontSize: '28px',
              color: '#888',
              display: 'flex',
            }}
          >
            fireflygrove.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

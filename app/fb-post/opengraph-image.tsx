import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'My Heart in a Grove of Light - Firefly Grove'
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
          background: 'linear-gradient(180deg, #0a0e14 0%, #1a1f2e 100%)',
          position: 'relative',
          padding: '60px 80px',
        }}
      >
        {/* Firefly dots */}
        <div style={{ position: 'absolute', top: '8%', left: '10%', width: '12px', height: '12px', borderRadius: '50%', background: '#ffd966', opacity: 0.6, display: 'flex' }} />
        <div style={{ position: 'absolute', top: '20%', right: '15%', width: '10px', height: '10px', borderRadius: '50%', background: '#ffd966', opacity: 0.5, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '25%', left: '12%', width: '14px', height: '14px', borderRadius: '50%', background: '#ffd966', opacity: 0.7, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '18%', width: '8px', height: '8px', borderRadius: '50%', background: '#ffd966', opacity: 0.4, display: 'flex' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: '10px', height: '10px', borderRadius: '50%', background: '#ffd966', opacity: 0.5, display: 'flex' }} />
        <div style={{ position: 'absolute', top: '60%', right: '22%', width: '12px', height: '12px', borderRadius: '50%', background: '#ffd966', opacity: 0.6, display: 'flex' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '1000px',
          }}
        >
          {/* Leaf emoji */}
          <div style={{ fontSize: '80px', marginBottom: '30px', display: 'flex' }}>
            🌿
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '62px',
              fontWeight: '300',
              color: '#d4a574',
              marginBottom: '30px',
              lineHeight: 1.1,
              display: 'flex',
              textAlign: 'center',
            }}
          >
            My Heart in a Grove of Light
          </div>

          {/* Main description */}
          <div
            style={{
              fontSize: '26px',
              color: '#e0e0e0',
              marginBottom: '25px',
              lineHeight: 1.4,
              display: 'flex',
              textAlign: 'center',
            }}
          >
            This might be one of the most meaningful things I've ever made
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '30px',
              color: '#d4a574',
              marginBottom: '20px',
              display: 'flex',
              fontWeight: '300',
            }}
          >
            It's called Firefly Grove
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '22px',
              color: '#cccccc',
              marginBottom: '30px',
              lineHeight: 1.4,
              display: 'flex',
              textAlign: 'center',
            }}
          >
            A place where memories take root and light never fades
          </div>

          {/* Site URL */}
          <div
            style={{
              fontSize: '20px',
              color: '#888',
              display: 'flex',
            }}
          >
            fireflygrove.app/fb-post
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

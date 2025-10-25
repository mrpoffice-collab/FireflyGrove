import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Firefly Grove - Where memories take root'
export const size = {
  width: 1200,
  height: 1500, // Taller to fit all content
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
          background: '#0a0e14',
          position: 'relative',
          padding: '60px 80px',
        }}
      >
        {/* Decorative firefly dots */}
        <div style={{ position: 'absolute', top: '5%', left: '8%', width: '8px', height: '8px', borderRadius: '50%', background: '#ffd966', opacity: 0.6, display: 'flex' }} />
        <div style={{ position: 'absolute', top: '15%', right: '12%', width: '6px', height: '6px', borderRadius: '50%', background: '#ffd966', opacity: 0.5, display: 'flex' }} />
        <div style={{ position: 'absolute', top: '35%', left: '15%', width: '7px', height: '7px', borderRadius: '50%', background: '#ffd966', opacity: 0.7, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '40%', right: '10%', width: '5px', height: '5px', borderRadius: '50%', background: '#ffd966', opacity: 0.4, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '18%', width: '6px', height: '6px', borderRadius: '50%', background: '#ffd966', opacity: 0.5, display: 'flex' }} />

        {/* Leaf emoji */}
        <div style={{ fontSize: '60px', marginBottom: '20px', display: 'flex' }}>🌿</div>

        {/* Title */}
        <div style={{ fontSize: '52px', fontWeight: '300', color: '#d4a574', marginBottom: '25px', textAlign: 'center', display: 'flex' }}>
          My Heart in a Grove of Light
        </div>

        {/* First paragraph */}
        <div style={{ fontSize: '18px', color: '#e0e0e0', marginBottom: '18px', textAlign: 'center', maxWidth: '900px', display: 'flex', lineHeight: 1.5 }}>
          This might be one of the most meaningful things I've ever made — right up there with being a mom, a nana, and a foster mom.
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '24px', color: '#d4a574', marginBottom: '18px', display: 'flex', fontWeight: '300' }}>
          It's called Firefly Grove
        </div>

        {/* Description */}
        <div style={{ fontSize: '18px', color: '#e0e0e0', marginBottom: '15px', textAlign: 'center', maxWidth: '900px', display: 'flex', lineHeight: 1.5 }}>
          A place where memories take root and light never fades.
        </div>

        <div style={{ fontSize: '18px', color: '#e0e0e0', marginBottom: '20px', textAlign: 'center', maxWidth: '900px', display: 'flex', lineHeight: 1.5 }}>
          You plant a tree for someone you love — past or present — and each memory you add becomes a tiny firefly that glows in their light.
        </div>

        {/* Features line */}
        <div style={{ fontSize: '18px', color: '#d4a574', marginBottom: '20px', display: 'flex', gap: '15px' }}>
          <span>✦</span>
          <span>Gentle</span>
          <span>•</span>
          <span>Private</span>
          <span>•</span>
          <span>Alive</span>
          <span>✦</span>
        </div>

        {/* Caretakers paragraph */}
        <div style={{ fontSize: '18px', color: '#e0e0e0', marginBottom: '18px', textAlign: 'center', maxWidth: '900px', display: 'flex', lineHeight: 1.5 }}>
          We have a small group of early caretakers testing it right now, and I would love to open that circle just a little wider — especially to the people who know me best.
        </div>

        {/* Smaller text paragraphs */}
        <div style={{ fontSize: '16px', color: '#999', marginBottom: '12px', textAlign: 'center', maxWidth: '900px', display: 'flex', lineHeight: 1.5 }}>
          Take your time. There's soft music, a slideshow, and a story to walk through.
        </div>

        <div style={{ fontSize: '16px', color: '#999', marginBottom: '25px', textAlign: 'center', maxWidth: '900px', display: 'flex', lineHeight: 1.5 }}>
          And if it stirs something in you... maybe plant a tree of your own.
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <div style={{ padding: '12px 32px', background: '#d4a574', color: '#0a0e14', borderRadius: '8px', fontSize: '16px', fontWeight: '500', display: 'flex' }}>
            Enter Firefly Grove
          </div>
          <div style={{ padding: '12px 32px', background: 'transparent', color: '#d4a574', border: '2px solid #d4a574', borderRadius: '8px', fontSize: '16px', fontWeight: '500', display: 'flex' }}>
            Become a Beta Tester
          </div>
        </div>

        {/* Closing line */}
        <div style={{ fontSize: '22px', color: '#d4a574', marginBottom: '8px', textAlign: 'center', display: 'flex', lineHeight: 1.4, fontWeight: '300' }}>
          Because every story deserves a light
        </div>
        <div style={{ fontSize: '22px', color: '#d4a574', marginBottom: '20px', textAlign: 'center', display: 'flex', lineHeight: 1.4, fontWeight: '300' }}>
          — even if it shines twice 💫
        </div>

        {/* Site URL */}
        <div style={{ fontSize: '16px', color: '#666', display: 'flex' }}>
          fireflygrove.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

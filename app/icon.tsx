import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0e14',
          borderRadius: '18%',
        }}
      >
        {/* Outer glow effects */}
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,217,102,0.1) 0%, rgba(255,217,102,0) 70%)',
          }}
        />

        {/* Tree and fireflies SVG */}
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          {/* Golden circle border */}
          <circle cx="256" cy="256" r="140" fill="none" stroke="#d4a645" stroke-width="6"/>

          {/* Tree trunk and branches */}
          <path d="M 256 380 Q 240 350 230 320 L 256 250 L 282 320 Q 272 350 256 380 Z" fill="#d4a645"/>

          {/* Main branches */}
          <path d="M 256 250 L 200 200 L 220 205" fill="none" stroke="#d4a645" stroke-width="8" stroke-linecap="round"/>
          <path d="M 256 250 L 312 200 L 292 205" fill="none" stroke="#d4a645" stroke-width="8" stroke-linecap="round"/>
          <path d="M 256 280 L 210 240 L 225 245" fill="none" stroke="#d4a645" stroke-width="7" stroke-linecap="round"/>
          <path d="M 256 280 L 302 240 L 287 245" fill="none" stroke="#d4a645" stroke-width="7" stroke-linecap="round"/>
          <path d="M 256 310 L 220 280 L 235 285" fill="none" stroke="#d4a645" stroke-width="6" stroke-linecap="round"/>
          <path d="M 256 310 L 292 280 L 277 285" fill="none" stroke="#d4a645" stroke-width="6" stroke-linecap="round"/>

          {/* Fireflies - glowing dots around the tree */}
          <circle cx="200" cy="180" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="230" cy="160" r="4" fill="#ffd966" opacity="0.8"/>
          <circle cx="260" cy="150" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="290" cy="155" r="4" fill="#ffd966" opacity="0.85"/>
          <circle cx="315" cy="175" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="180" cy="210" r="4" fill="#ffd966" opacity="0.8"/>
          <circle cx="210" cy="195" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="285" cy="185" r="4" fill="#ffd966" opacity="0.85"/>
          <circle cx="320" cy="200" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="190" cy="240" r="4" fill="#ffd966" opacity="0.8"/>
          <circle cx="245" cy="170" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="305" cy="220" r="4" fill="#ffd966" opacity="0.85"/>
          <circle cx="175" cy="195" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="275" cy="165" r="4" fill="#ffd966" opacity="0.8"/>
          <circle cx="330" cy="185" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="215" cy="175" r="4" fill="#ffd966" opacity="0.85"/>
          <circle cx="295" cy="170" r="5" fill="#ffd966" opacity="0.9"/>

          {/* Glow effects on fireflies */}
          <circle cx="260" cy="150" r="8" fill="#ffd966" opacity="0.3"/>
          <circle cx="245" cy="170" r="7" fill="#ffd966" opacity="0.25"/>
          <circle cx="275" cy="165" r="7" fill="#ffd966" opacity="0.25"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

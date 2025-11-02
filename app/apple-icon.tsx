import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
        }}
      >
        <svg width="180" height="180" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          {/* Outer glow effect */}
          <circle cx="256" cy="256" r="200" fill="#ffd966" opacity="0.1"/>
          <circle cx="256" cy="256" r="160" fill="#ffd966" opacity="0.15"/>

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
          <circle cx="185" cy="225" r="4" fill="#ffd966" opacity="0.8"/>
          <circle cx="325" cy="210" r="5" fill="#ffd966" opacity="0.9"/>
          <circle cx="235" cy="185" r="4" fill="#ffd966" opacity="0.85"/>

          {/* Additional scattered fireflies */}
          <circle cx="170" cy="270" r="4" fill="#ffd966" opacity="0.7"/>
          <circle cx="340" cy="265" r="4" fill="#ffd966" opacity="0.7"/>
          <circle cx="195" cy="255" r="5" fill="#ffd966" opacity="0.8"/>
          <circle cx="315" cy="250" r="5" fill="#ffd966" opacity="0.8"/>
          <circle cx="225" cy="145" r="4" fill="#ffd966" opacity="0.75"/>
          <circle cx="280" cy="140" r="4" fill="#ffd966" opacity="0.75"/>
          <circle cx="250" cy="135" r="5" fill="#ffd966" opacity="0.85"/>

          {/* Glow effects on fireflies */}
          <circle cx="260" cy="150" r="8" fill="#ffd966" opacity="0.3"/>
          <circle cx="245" cy="170" r="7" fill="#ffd966" opacity="0.25"/>
          <circle cx="275" cy="165" r="7" fill="#ffd966" opacity="0.25"/>
          <circle cx="250" cy="135" r="8" fill="#ffd966" opacity="0.3"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

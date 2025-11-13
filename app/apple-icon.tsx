import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
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
          borderRadius: '20%',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,217,102,0.2) 0%, rgba(255,217,102,0) 70%)',
          }}
        />

        {/* Tree trunk */}
        <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
          {/* Tree trunk and branches */}
          <path d="M 90 140 Q 85 125 82 110 L 90 75 L 98 110 Q 95 125 90 140 Z" fill="#d4a645"/>

          {/* Main branches */}
          <line x1="90" y1="75" x2="60" y2="55" stroke="#d4a645" stroke-width="4" stroke-linecap="round"/>
          <line x1="90" y1="75" x2="120" y2="55" stroke="#d4a645" stroke-width="4" stroke-linecap="round"/>
          <line x1="90" y1="90" x2="65" y2="70" stroke="#d4a645" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="90" y1="90" x2="115" y2="70" stroke="#d4a645" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="90" y1="105" x2="70" y2="90" stroke="#d4a645" stroke-width="3" stroke-linecap="round"/>
          <line x1="90" y1="105" x2="110" y2="90" stroke="#d4a645" stroke-width="3" stroke-linecap="round"/>

          {/* Fireflies */}
          <circle cx="60" cy="50" r="3" fill="#ffd966" opacity="0.9"/>
          <circle cx="75" cy="45" r="2.5" fill="#ffd966" opacity="0.8"/>
          <circle cx="90" cy="40" r="3" fill="#ffd966" opacity="0.9"/>
          <circle cx="105" cy="43" r="2.5" fill="#ffd966" opacity="0.85"/>
          <circle cx="120" cy="48" r="3" fill="#ffd966" opacity="0.9"/>
          <circle cx="55" cy="65" r="2.5" fill="#ffd966" opacity="0.8"/>
          <circle cx="70" cy="55" r="3" fill="#ffd966" opacity="0.9"/>
          <circle cx="95" cy="52" r="2.5" fill="#ffd966" opacity="0.85"/>
          <circle cx="115" cy="60" r="3" fill="#ffd966" opacity="0.9"/>
          <circle cx="58" cy="75" r="2.5" fill="#ffd966" opacity="0.8"/>
          <circle cx="85" cy="48" r="3" fill="#ffd966" opacity="0.9"/>
          <circle cx="110" cy="68" r="2.5" fill="#ffd966" opacity="0.85"/>

          {/* Glow effects */}
          <circle cx="90" cy="40" r="5" fill="#ffd966" opacity="0.3"/>
          <circle cx="85" cy="48" r="4" fill="#ffd966" opacity="0.25"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

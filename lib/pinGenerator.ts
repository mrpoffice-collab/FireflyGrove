/**
 * Pinterest Pin Image Generator
 * Creates beautiful Pinterest-optimized images from Firefly Grove content
 */

export interface PinTemplate {
  width: number
  height: number
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
}

export interface MemoryPinData {
  memoryText: string
  authorName: string
  branchTitle: string
  memoryDate?: string
  photoUrl?: string
}

// Pinterest-optimized templates
export const PIN_TEMPLATES = {
  // Standard 2:3 ratio (1000x1500) - Best for Pinterest
  memorial: {
    width: 1000,
    height: 1500,
    backgroundColor: '#1a1a1a',
    textColor: '#f5f5f5',
    accentColor: '#FFD700',
    fontFamily: 'Georgia, serif',
  },
  quote: {
    width: 1000,
    height: 1500,
    backgroundColor: '#2d2d2d',
    textColor: '#ffffff',
    accentColor: '#ffd966',
    fontFamily: 'Arial, sans-serif',
  },
  photo: {
    width: 1000,
    height: 1500,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#FFD700',
    fontFamily: 'Helvetica, sans-serif',
  },
}

/**
 * Generate HTML for a Pinterest pin image
 * This will be converted to an image using a headless browser or canvas
 */
export function generatePinHTML(data: MemoryPinData, template: PinTemplate = PIN_TEMPLATES.memorial): string {
  const { memoryText, authorName, branchTitle, memoryDate, photoUrl } = data

  // Truncate text if too long (Pinterest best practice: keep text readable)
  const maxLength = 200
  const displayText = memoryText.length > maxLength
    ? memoryText.substring(0, maxLength) + '...'
    : memoryText

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${template.width}px;
      height: ${template.height}px;
      background: ${template.backgroundColor};
      font-family: ${template.fontFamily};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .header {
      padding: 60px 60px 40px;
      text-align: center;
    }
    .firefly-logo {
      font-size: 48px;
      color: ${template.accentColor};
      margin-bottom: 20px;
    }
    .brand {
      font-size: 32px;
      color: ${template.accentColor};
      font-weight: 300;
      letter-spacing: 2px;
    }
    .content {
      flex: 1;
      padding: 40px 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }
    .photo-container {
      width: 100%;
      height: 500px;
      margin-bottom: 40px;
      overflow: hidden;
      border-radius: 8px;
      display: ${photoUrl ? 'block' : 'none'};
    }
    .photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .quote-mark {
      font-size: 120px;
      color: ${template.accentColor};
      opacity: 0.2;
      position: absolute;
      top: -20px;
      left: 40px;
      line-height: 1;
    }
    .memory-text {
      font-size: ${photoUrl ? '28px' : '36px'};
      color: ${template.textColor};
      line-height: 1.6;
      font-style: italic;
      margin-bottom: 40px;
      position: relative;
      z-index: 1;
    }
    .footer {
      padding: 40px 60px 60px;
      border-top: 2px solid ${template.accentColor};
    }
    .branch-title {
      font-size: 24px;
      color: ${template.accentColor};
      margin-bottom: 12px;
      font-weight: 500;
    }
    .author {
      font-size: 20px;
      color: ${template.textColor};
      opacity: 0.8;
      margin-bottom: 8px;
    }
    .date {
      font-size: 18px;
      color: ${template.textColor};
      opacity: 0.6;
    }
    .firefly-accent {
      position: absolute;
      width: 12px;
      height: 12px;
      background: ${template.accentColor};
      border-radius: 50%;
      opacity: 0.6;
    }
    .firefly-1 { top: 200px; right: 100px; }
    .firefly-2 { top: 400px; left: 120px; opacity: 0.4; }
    .firefly-3 { bottom: 300px; right: 150px; opacity: 0.5; }
  </style>
</head>
<body>
  <div class="firefly-accent firefly-1"></div>
  <div class="firefly-accent firefly-2"></div>
  <div class="firefly-accent firefly-3"></div>

  <div class="header">
    <div class="firefly-logo">✦</div>
    <div class="brand">Firefly Grove</div>
  </div>

  <div class="content">
    <div class="quote-mark">"</div>
    ${photoUrl ? `
    <div class="photo-container">
      <img src="${photoUrl}" alt="Memory photo" class="photo" />
    </div>
    ` : ''}
    <div class="memory-text">${displayText}</div>
  </div>

  <div class="footer">
    <div class="branch-title">${branchTitle}</div>
    <div class="author">— ${authorName}</div>
    ${memoryDate ? `<div class="date">${memoryDate}</div>` : ''}
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate SVG for a simple pin image (no external dependencies)
 */
export function generatePinSVG(data: MemoryPinData, template: PinTemplate = PIN_TEMPLATES.memorial): string {
  const { memoryText, authorName, branchTitle } = data

  const maxLength = 180
  const displayText = memoryText.length > maxLength
    ? memoryText.substring(0, maxLength) + '...'
    : memoryText

  // Split text into lines for better readability
  const words = displayText.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach(word => {
    if ((currentLine + word).length > 30) {
      lines.push(currentLine.trim())
      currentLine = word + ' '
    } else {
      currentLine += word + ' '
    }
  })
  if (currentLine) lines.push(currentLine.trim())

  return `
<svg width="${template.width}" height="${template.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${template.width}" height="${template.height}" fill="${template.backgroundColor}"/>

  <!-- Firefly accents -->
  <circle cx="850" cy="200" r="6" fill="${template.accentColor}" opacity="0.6"/>
  <circle cx="120" cy="600" r="8" fill="${template.accentColor}" opacity="0.4"/>
  <circle cx="900" cy="1100" r="7" fill="${template.accentColor}" opacity="0.5"/>

  <!-- Header -->
  <text x="500" y="120" font-family="${template.fontFamily}" font-size="48" fill="${template.accentColor}" text-anchor="middle">✦</text>
  <text x="500" y="180" font-family="${template.fontFamily}" font-size="32" fill="${template.accentColor}" text-anchor="middle" letter-spacing="2">Firefly Grove</text>

  <!-- Quote mark -->
  <text x="80" y="320" font-family="${template.fontFamily}" font-size="120" fill="${template.accentColor}" opacity="0.2">"</text>

  <!-- Memory text -->
  ${lines.map((line, i) => `
  <text x="500" y="${400 + (i * 48)}" font-family="${template.fontFamily}" font-size="32" fill="${template.textColor}" text-anchor="middle" font-style="italic">${escapeXml(line)}</text>
  `).join('')}

  <!-- Footer line -->
  <line x1="80" y1="${1200}" x2="920" y2="${1200}" stroke="${template.accentColor}" stroke-width="2"/>

  <!-- Branch title -->
  <text x="500" y="${1260}" font-family="${template.fontFamily}" font-size="28" fill="${template.accentColor}" text-anchor="middle" font-weight="500">${escapeXml(branchTitle)}</text>

  <!-- Author -->
  <text x="500" y="${1310}" font-family="${template.fontFamily}" font-size="24" fill="${template.textColor}" text-anchor="middle" opacity="0.8">— ${escapeXml(authorName)}</text>
</svg>
  `.trim()
}

/**
 * Helper to escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generate a data URL for a pin image (SVG)
 */
export function generatePinDataUrl(data: MemoryPinData, template?: PinTemplate): string {
  const svg = generatePinSVG(data, template)
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * Get recommended Pinterest pin dimensions
 */
export const PINTEREST_DIMENSIONS = {
  // Standard 2:3 ratio
  standard: { width: 1000, height: 1500 },

  // Square (for certain contexts)
  square: { width: 1000, height: 1000 },

  // Tall (max height Pinterest allows)
  tall: { width: 1000, height: 2100 },

  // Minimum recommended
  minimum: { width: 600, height: 900 },
}

/**
 * Validate image dimensions for Pinterest
 */
export function isValidPinterestDimensions(width: number, height: number): boolean {
  // Pinterest requirements:
  // - Minimum: 600x900
  // - Recommended: 1000x1500
  // - Aspect ratio: 2:3 is ideal

  if (width < 600 || height < 900) {
    return false
  }

  // Check if aspect ratio is close to 2:3
  const aspectRatio = width / height
  const idealRatio = 2 / 3
  const tolerance = 0.1

  return Math.abs(aspectRatio - idealRatio) <= tolerance
}

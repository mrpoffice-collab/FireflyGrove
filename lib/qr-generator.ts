import QRCode from 'qrcode'

/**
 * Generate QR code as PNG buffer for audio playback URLs
 * Used in Memory Book PDFs to link to audio memories
 */
export async function generateAudioQRCode(audioUrl: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(audioUrl, {
      errorCorrectionLevel: 'H', // High error correction for print
      type: 'png',
      width: 200, // 200px = ~0.67" @ 300 DPI
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  } catch (error) {
    console.error('QR code generation failed:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code as data URL for web preview
 */
export async function generateAudioQRCodeDataURL(audioUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(audioUrl, {
      errorCorrectionLevel: 'H',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  } catch (error) {
    console.error('QR code generation failed:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Create permanent audio playback URL for QR codes
 * This URL should never expire (unlike signed Blob URLs)
 */
export function createPermanentAudioUrl(entryId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://fireflygrove.app'
  return `${baseUrl}/api/audio-playback/${entryId}`
}

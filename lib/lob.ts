// Lob.com API client for physical card printing and mailing
// API Documentation: https://docs.lob.com

interface LobAddress {
  name: string
  address_line1: string
  address_line2?: string
  address_city: string
  address_state: string
  address_zip: string
  address_country: string
}

interface LobPostcardRequest {
  description: string
  to: LobAddress
  from: LobAddress
  front: string // HTML or URL
  back: string // HTML or URL
  size: '4x6' | '6x9' | '6x11'
  metadata?: Record<string, string>
}

interface LobPostcardResponse {
  id: string
  description: string
  to: LobAddress
  from: LobAddress
  url: string
  tracking_events: Array<{
    id: string
    type: string
    name: string
    location: string
    time: string
  }>
  expected_delivery_date: string
  send_date: string
}

class LobClient {
  private apiKey: string
  private baseURL: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseURL = 'https://api.lob.com/v1'
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(this.apiKey + ':').toString('base64')
  }

  async createPostcard(request: LobPostcardRequest): Promise<LobPostcardResponse> {
    const response = await fetch(`${this.baseURL}/postcards`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Lob API error: ${JSON.stringify(error)}`)
    }

    return response.json()
  }

  async getPostcard(postcardId: string): Promise<LobPostcardResponse> {
    const response = await fetch(`${this.baseURL}/postcards/${postcardId}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Lob API error: ${JSON.stringify(error)}`)
    }

    return response.json()
  }

  async verifyAddress(address: Partial<LobAddress>): Promise<LobAddress> {
    const response = await fetch(`${this.baseURL}/us_verifications`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        primary_line: address.address_line1,
        secondary_line: address.address_line2,
        city: address.address_city,
        state: address.address_state,
        zip_code: address.address_zip,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Address verification failed: ${JSON.stringify(error)}`)
    }

    const verified = await response.json()
    return {
      name: address.name || '',
      address_line1: verified.primary_line,
      address_line2: verified.secondary_line,
      address_city: verified.components.city,
      address_state: verified.components.state,
      address_zip: verified.components.zip_code,
      address_country: 'US',
    }
  }
}

// Export singleton instance
export const lobClient = new LobClient(process.env.LOB_API_KEY || '')

// Helper function to convert card order to Lob format
export function generateCardHTML(params: {
  templateHTML: string
  templateCSS: string
  customMessage: string
  selectedPhotos: string[]
  senderName: string
  categoryIcon: string
}): { front: string; back: string } {
  const { templateHTML, templateCSS, customMessage, selectedPhotos, senderName, categoryIcon } = params

  // Front of card - template design with photos and message
  const front = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${templateCSS}
    body {
      margin: 0;
      padding: 0;
      width: 6in;
      height: 4in;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .card-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1A2332 0%, #0F1419 100%);
      padding: 40px;
      box-sizing: border-box;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    .message {
      color: #E8EDF2;
      text-align: center;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
      max-width: 80%;
    }
    .photos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 10px;
      width: 100%;
      max-width: 400px;
      margin-bottom: 20px;
    }
    .photo {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
    }
    .sender {
      color: #9BA8B8;
      font-size: 14px;
      margin-top: auto;
    }
    .sender-name {
      color: #FFD966;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card-container">
    <div class="icon">${categoryIcon}</div>

    ${selectedPhotos.length > 0 ? `
      <div class="photos">
        ${selectedPhotos.slice(0, 3).map(url => `<img src="${url}" class="photo" alt="Memory" />`).join('')}
      </div>
    ` : ''}

    <div class="message">${customMessage.replace(/\n/g, '<br>')}</div>

    ${senderName ? `
      <div class="sender">
        With love, <span class="sender-name">${senderName}</span>
      </div>
    ` : ''}
  </div>
</body>
</html>
  `

  // Back of card - Firefly Grove branding
  const back = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 6in;
      height: 4in;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0F1419 0%, #1A2332 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .back-container {
      text-align: center;
      padding: 40px;
    }
    .logo {
      font-size: 64px;
      margin-bottom: 20px;
    }
    .brand-name {
      color: #FFD966;
      font-size: 32px;
      font-weight: 300;
      margin-bottom: 10px;
    }
    .tagline {
      color: #9BA8B8;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="back-container">
    <div class="logo">✦</div>
    <div class="brand-name">Firefly Grove</div>
    <div class="tagline">Where memories take root and keep growing</div>
  </div>
</body>
</html>
  `

  return { front, back }
}

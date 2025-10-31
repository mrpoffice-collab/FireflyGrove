'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CardPreview from './CardPreview'
import CardMessageEditor from './CardMessageEditor'
import GrovePhotoPicker from './GrovePhotoPicker'

interface Sentiment {
  id: string
  coverMessage: string
  insideMessage: string
  tags: string | null
}

interface CardDesignerProps {
  sentiment: Sentiment
  categoryId?: string
}

export default function CardDesigner({ sentiment, categoryId }: CardDesignerProps) {
  const router = useRouter()
  const [customMessage, setCustomMessage] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [senderName, setSenderName] = useState('')
  const [signature, setSignature] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientAddress, setRecipientAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [isGroveOwner, setIsGroveOwner] = useState<boolean | null>(null)

  // Default values since we no longer use templates
  const deliveryType: 'digital' | 'physical' = 'digital' // Only digital cards for now
  const maxPhotos = 3 // Allow up to 3 photos per card
  const price = 0 // Cards are free for grove owners

  // Check if user is a grove owner on mount
  useEffect(() => {
    const checkGroveOwner = async () => {
      try {
        const res = await fetch('/api/user/grove-status')
        const data = await res.json()
        setIsGroveOwner(data.isGroveOwner)
      } catch (error) {
        console.error('Failed to check grove status:', error)
        setIsGroveOwner(false)
      }
    }

    checkGroveOwner()
  }, [])

  const handlePhotoSelect = (photoUrls: string[]) => {
    setSelectedPhotos(photoUrls)
    setShowPhotoPicker(false)
  }

  const handleCheckout = async () => {
    if (!customMessage.trim()) {
      alert('Please add a message to your card')
      return
    }

    if (deliveryType === 'digital' && !recipientEmail) {
      alert('Please enter recipient email')
      return
    }

    // Physical cards not yet supported
    // if (deliveryType === 'physical' && (!recipientName || !recipientAddress.line1)) {
    //   alert('Please enter recipient name and address')
    //   return
    // }

    setProcessing(true)

    try {
      // Create checkout session
      const res = await fetch('/api/cards/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentimentId: sentiment.id,
          categoryId: categoryId || null,
          deliveryType,
          customMessage,
          selectedPhotos,
          senderName,
          signature,
          recipientEmail: recipientEmail, // Always digital for now
          recipientName: null, // Physical cards not yet supported
          recipientAddress: null, // Physical cards not yet supported
        }),
      })

      const data = await res.json()

      if (data.error) {
        alert(data.error)
        setProcessing(false)
        return
      }

      // For complimentary cards, redirect directly to success page
      if (data.success && data.orderId) {
        router.push(`/cards/success?order_id=${data.orderId}`)
      } else if (data.checkoutUrl) {
        // Legacy path: redirect to Stripe checkout (if pricing is added back)
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to process checkout. Please try again.')
      setProcessing(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Column - Customization */}
      <div className="space-y-6">
        <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
          <h2 className="text-2xl text-text-soft font-light mb-6">
            Customize Your Card
          </h2>

          {/* Selected Card Preview */}
          <div className="mb-6 bg-bg-elevated border border-firefly-dim/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💌</span>
              <span className="text-xs text-firefly-glow uppercase tracking-wide font-medium">
                Your Selected Card
              </span>
            </div>
            <p className="text-text-soft text-sm italic mb-2 border-l-2 border-firefly-dim/30 pl-3">
              {sentiment.coverMessage}
            </p>
            <p className="text-text-muted text-xs whitespace-pre-line border-l-2 border-firefly-dim/30 pl-3">
              {sentiment.insideMessage}
            </p>
          </div>

          {/* Sender Name */}
          <div className="mb-6">
            <label className="block text-text-soft text-sm font-medium mb-2">
              Your Name (Sender)
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g., John & Jane Smith"
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
            />
          </div>

          {/* Custom Message */}
          <CardMessageEditor
            message={customMessage}
            onChange={setCustomMessage}
            maxLength={500}
          />

          {/* Signature */}
          <div className="mb-6">
            <label className="block text-text-soft text-sm font-medium mb-2">
              Signature (Optional)
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="e.g., With love, The Smith Family"
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 italic placeholder:text-placeholder"
              style={{ fontFamily: '"Brush Script MT", cursive' }}
            />
            <p className="text-text-muted text-xs mt-1">
              This will appear at the bottom of your card in a signature style
            </p>
          </div>

          {/* Photo Picker */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-text-soft text-sm font-medium">
                Photos & Soundwaves from Grove (Optional)
              </label>
              <span className="text-text-muted text-xs">
                {selectedPhotos.length} / {maxPhotos} selected
              </span>
            </div>

            {selectedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {selectedPhotos.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded overflow-hidden">
                    <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowPhotoPicker(true)}
              disabled={selectedPhotos.length >= maxPhotos}
              className="w-full py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft hover:border-firefly-dim transition-soft disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {selectedPhotos.length === 0 ? 'Add Photos or Soundwaves' : 'Change Selection'}
            </button>
          </div>

          {/* Recipient Information */}
          <div className="pt-6 border-t border-border-subtle">
            <h3 className="text-lg text-text-soft font-medium mb-4">
              {deliveryType === 'digital' ? 'Recipient Email' : 'Recipient Address'}
            </h3>

            {deliveryType === 'digital' ? (
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
                />
                <input
                  type="text"
                  value={recipientAddress.line1}
                  onChange={(e) => setRecipientAddress({ ...recipientAddress, line1: e.target.value })}
                  placeholder="Street Address"
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
                />
                <input
                  type="text"
                  value={recipientAddress.line2}
                  onChange={(e) => setRecipientAddress({ ...recipientAddress, line2: e.target.value })}
                  placeholder="Apt, Suite, etc. (optional)"
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={recipientAddress.city}
                    onChange={(e) => setRecipientAddress({ ...recipientAddress, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
                  />
                  <input
                    type="text"
                    value={recipientAddress.state}
                    onChange={(e) => setRecipientAddress({ ...recipientAddress, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
                  />
                </div>
                <input
                  type="text"
                  value={recipientAddress.zip}
                  onChange={(e) => setRecipientAddress({ ...recipientAddress, zip: e.target.value })}
                  placeholder="ZIP Code"
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-border-subtle rounded text-white focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
                />
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <div className="pt-6 border-t border-border-subtle mt-6">
            {isGroveOwner === null ? (
              <div className="text-center text-text-muted py-4">Loading pricing...</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-soft">Price</span>
                  <span className="text-2xl text-firefly-glow font-medium">
                    {isGroveOwner ? 'Complimentary' : `$${price.toFixed(2)}`}
                  </span>
                </div>

                {isGroveOwner && (
                  <div className="mb-4 px-4 py-3 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg">
                    <p className="text-text-soft text-sm flex items-center gap-2">
                      <span className="text-firefly-glow">✦</span>
                      <span><strong>Grove Owner Benefit:</strong> This card is complimentary</span>
                    </p>
                  </div>
                )}

                {!isGroveOwner && (
                  <div className="mb-4 px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg">
                    <p className="text-text-muted text-sm">
                      💡 <strong>Tip:</strong> Grove owners get complimentary cards. Create your first memory to unlock this benefit!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500"
                >
                  {processing ? 'Processing...' : (isGroveOwner ? 'Send Card' : 'Proceed to Payment')}
                </button>

                <p className="text-text-muted text-xs text-center mt-3">
                  {isGroveOwner
                    ? 'Thank you for being part of Firefly Grove'
                    : 'Secure checkout powered by Stripe'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Preview */}
      <div className="lg:sticky lg:top-4 h-fit">
        <CardPreview
          template={null}
          customMessage={customMessage}
          selectedPhotos={selectedPhotos}
          senderName={senderName}
          signature={signature}
          deliveryType={deliveryType}
          selectedSentiment={sentiment}
        />
      </div>

      {/* Grove Photo Picker Modal */}
      {showPhotoPicker && (
        <GrovePhotoPicker
          maxPhotos={maxPhotos}
          selectedPhotos={selectedPhotos}
          onSelect={handlePhotoSelect}
          onClose={() => setShowPhotoPicker(false)}
        />
      )}
    </div>
  )
}

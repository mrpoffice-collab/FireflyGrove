'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CardPreview from './CardPreview'
import CardMessageEditor from './CardMessageEditor'
import GrovePhotoPicker from './GrovePhotoPicker'

interface CardDesignerProps {
  template: any
}

export default function CardDesigner({ template }: CardDesignerProps) {
  const router = useRouter()
  const [customMessage, setCustomMessage] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [senderName, setSenderName] = useState('')
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

  const deliveryType = template.deliveryType || 'digital'
  const price = deliveryType === 'digital' ? template.digitalPrice : template.physicalPrice

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

    if (deliveryType === 'physical' && (!recipientName || !recipientAddress.line1)) {
      alert('Please enter recipient name and address')
      return
    }

    setProcessing(true)

    try {
      // Create checkout session
      const res = await fetch('/api/cards/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          deliveryType,
          customMessage,
          selectedPhotos,
          senderName,
          recipientEmail: deliveryType === 'digital' ? recipientEmail : null,
          recipientName: deliveryType === 'physical' ? recipientName : null,
          recipientAddress: deliveryType === 'physical' ? recipientAddress : null,
        }),
      })

      const data = await res.json()

      if (data.error) {
        alert(data.error)
        setProcessing(false)
        return
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
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
              className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim"
            />
          </div>

          {/* Custom Message */}
          <CardMessageEditor
            message={customMessage}
            onChange={setCustomMessage}
            maxLength={500}
          />

          {/* Photo Picker */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-text-soft text-sm font-medium">
                Photos from Grove (Optional)
              </label>
              <span className="text-text-muted text-xs">
                {selectedPhotos.length} / {template.maxPhotos} selected
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
              disabled={selectedPhotos.length >= template.maxPhotos}
              className="w-full py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft hover:border-firefly-dim transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedPhotos.length === 0 ? 'Add Photos from Grove' : 'Change Photos'}
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
                className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim"
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim"
                />
                <input
                  type="text"
                  value={recipientAddress.line1}
                  onChange={(e) => setRecipientAddress({ ...recipientAddress, line1: e.target.value })}
                  placeholder="Street Address"
                  className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim"
                />
                <input
                  type="text"
                  value={recipientAddress.line2}
                  onChange={(e) => setRecipientAddress({ ...recipientAddress, line2: e.target.value })}
                  placeholder="Apt, Suite, etc. (optional)"
                  className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={recipientAddress.city}
                    onChange={(e) => setRecipientAddress({ ...recipientAddress, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim"
                  />
                  <input
                    type="text"
                    value={recipientAddress.state}
                    onChange={(e) => setRecipientAddress({ ...recipientAddress, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim"
                  />
                </div>
                <input
                  type="text"
                  value={recipientAddress.zip}
                  onChange={(e) => setRecipientAddress({ ...recipientAddress, zip: e.target.value })}
                  placeholder="ZIP Code"
                  className="w-full px-4 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft focus:outline-none focus:border-firefly-dim"
                />
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <div className="pt-6 border-t border-border-subtle mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-soft">Total</span>
              <span className="text-2xl text-firefly-glow font-medium">
                ${price.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Proceed to Payment`}
            </button>

            <p className="text-text-muted text-xs text-center mt-3">
              Secure payment via Stripe
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Preview */}
      <div className="lg:sticky lg:top-4 h-fit">
        <CardPreview
          template={template}
          customMessage={customMessage}
          selectedPhotos={selectedPhotos}
          senderName={senderName}
          deliveryType={deliveryType}
        />
      </div>

      {/* Grove Photo Picker Modal */}
      {showPhotoPicker && (
        <GrovePhotoPicker
          maxPhotos={template.maxPhotos}
          selectedPhotos={selectedPhotos}
          onSelect={handlePhotoSelect}
          onClose={() => setShowPhotoPicker(false)}
        />
      )}
    </div>
  )
}

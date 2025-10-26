'use client'

interface CardPreviewProps {
  template: any
  customMessage: string
  selectedPhotos: string[]
  senderName: string
  signature?: string
  deliveryType: 'digital' | 'physical'
}

export default function CardPreview({
  template,
  customMessage,
  selectedPhotos,
  senderName,
  signature,
  deliveryType,
}: CardPreviewProps) {
  return (
    <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-text-soft font-medium">Live Preview</h3>
        <span className="text-xs text-text-muted">
          {deliveryType === 'digital' ? '📧 Digital' : '📮 Physical'}
        </span>
      </div>

      {/* Card Preview Container */}
      <div className="bg-bg-elevated rounded-lg overflow-hidden border border-border-subtle">
        {/* Card Mockup */}
        <div className="aspect-[5/7] relative bg-gradient-to-br from-bg-dark to-bg-darker p-6 flex flex-col overflow-y-auto">
          {/* Template Header */}
          <div className="text-center mb-4">
            <h4 className="text-2xl font-light text-firefly-glow mb-2">
              {template.name}
            </h4>
          </div>

          {/* Photos Section */}
          {selectedPhotos.length > 0 && (
            <div className={`grid gap-2 mb-4 ${
              selectedPhotos.length === 1 ? 'grid-cols-1' :
              selectedPhotos.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {selectedPhotos.slice(0, 3).map((url, index) => (
                <div
                  key={index}
                  className={`rounded overflow-hidden ${
                    selectedPhotos.length === 1 ? 'aspect-video' :
                    selectedPhotos.length === 3 && index === 0 ? 'col-span-2 aspect-video' :
                    'aspect-square'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Prewritten Message from Template */}
          {template.prewrittenMessage && (
            <div className="mb-4 px-2">
              <div className="bg-firefly-dim/5 border border-firefly-dim/20 rounded-lg p-4">
                <p className="text-text-soft text-sm leading-relaxed text-center italic">
                  {template.prewrittenMessage}
                </p>
              </div>
            </div>
          )}

          {/* Personal Message */}
          <div className="flex-1 flex items-center justify-center mb-4 px-2">
            <div className="text-center">
              {customMessage ? (
                <p className="text-text-soft text-sm leading-relaxed whitespace-pre-wrap">
                  {customMessage}
                </p>
              ) : (
                <p className="text-text-muted text-sm italic">
                  Your personal message will appear here...
                </p>
              )}
            </div>
          </div>

          {/* Signature Section */}
          {(signature || senderName) && (
            <div className="text-center mt-auto mb-4 px-2">
              {signature ? (
                <p
                  className="text-text-soft text-base italic"
                  style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                >
                  {signature}
                </p>
              ) : senderName && (
                <>
                  <p className="text-text-muted text-xs mb-1">
                    With love,
                  </p>
                  <p className="text-text-soft text-sm font-medium">
                    {senderName}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Firefly Grove Branding */}
          <div className="text-center pt-3 border-t border-border-subtle">
            <p className="text-text-muted text-xs flex items-center justify-center gap-1">
              <span className="text-firefly-glow">✦</span>
              Sent with Firefly Grove
            </p>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-4 text-text-muted text-xs text-center">
        {deliveryType === 'digital' ? (
          <p>Recipient will receive an email with a link to view this card</p>
        ) : (
          <p>Card will be professionally printed and mailed with tracking</p>
        )}
      </div>
    </div>
  )
}

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

      {/* Card Preview Container - Front and Inside */}
      <div className="space-y-4">
        {/* FRONT of Card */}
        <div className="bg-bg-elevated rounded-lg overflow-hidden border border-border-subtle">
          <div className="bg-gradient-to-br from-bg-dark to-bg-darker p-6">
            <p className="text-xs text-text-muted mb-2 text-center">FRONT</p>
            <div className="aspect-[5/7] flex items-center justify-center p-8">
              {/* Photos on Front */}
              {selectedPhotos.length > 0 && (
                <div className={`grid gap-2 mb-4 w-full ${
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

              {/* Cover Message */}
              {template.coverMessage ? (
                <p className="text-text-soft text-lg leading-relaxed text-center italic">
                  {template.coverMessage}
                </p>
              ) : (
                <p className="text-text-muted text-sm italic text-center">
                  Cover message will appear here
                </p>
              )}
            </div>
          </div>
        </div>

        {/* INSIDE of Card */}
        <div className="bg-bg-elevated rounded-lg overflow-hidden border border-border-subtle">
          <div className="bg-gradient-to-br from-bg-dark to-bg-darker p-6">
            <p className="text-xs text-text-muted mb-2 text-center">INSIDE</p>
            <div className="aspect-[5/7] flex flex-col justify-center p-8 space-y-6">
              {/* Inside Message from Firefly Grove */}
              {template.insideMessage && (
                <div className="bg-firefly-dim/5 border border-firefly-dim/20 rounded-lg p-4">
                  <p className="text-text-soft text-sm leading-relaxed text-center">
                    {template.insideMessage}
                  </p>
                </div>
              )}

              {/* Personal Message */}
              <div className="text-center">
                {customMessage ? (
                  <p className="text-text-soft text-sm leading-relaxed whitespace-pre-wrap">
                    {customMessage}
                  </p>
                ) : (
                  <p className="text-text-muted text-xs italic">
                    Your personal message...
                  </p>
                )}
              </div>

              {/* Signature */}
              {(signature || senderName) && (
                <div className="text-center mt-auto">
                  {signature ? (
                    <p
                      className="text-text-soft text-base italic"
                      style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                    >
                      {signature}
                    </p>
                  ) : senderName && (
                    <p className="text-text-soft text-sm">
                      {senderName}
                    </p>
                  )}
                </div>
              )}

              {/* Firefly Grove Branding */}
              <div className="text-center pt-3 border-t border-border-subtle">
                <p className="text-text-muted text-xs flex items-center justify-center gap-1">
                  <span className="text-firefly-glow">✦</span>
                  Firefly Grove
                </p>
              </div>
            </div>
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

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
            <div className="aspect-[5/7] flex flex-col items-center justify-center p-8 space-y-6">
              {/* Photos on Front - Elegant Layout */}
              {selectedPhotos.length > 0 && (
                <div className="w-full flex items-center justify-center mb-4">
                  {selectedPhotos.length === 1 ? (
                    // Single photo - Large polaroid style
                    <div className="relative">
                      <div className="bg-white p-3 shadow-lg transform hover:scale-105 transition-transform">
                        <div className="aspect-[4/5] w-56 overflow-hidden">
                          <img
                            src={selectedPhotos[0]}
                            alt="Memory"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ) : selectedPhotos.length === 2 ? (
                    // Two photos - Overlapping polaroids
                    <div className="relative w-full max-w-sm h-48">
                      <div className="absolute left-8 top-0 bg-white p-2 shadow-lg transform -rotate-3">
                        <div className="aspect-[3/2] w-40 overflow-hidden">
                          <img src={selectedPhotos[0]} alt="Memory 1" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="absolute right-8 top-4 bg-white p-2 shadow-lg transform rotate-3">
                        <div className="aspect-[3/2] w-40 overflow-hidden">
                          <img src={selectedPhotos[1]} alt="Memory 2" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Three photos - Artistic collage
                    <div className="relative w-full max-w-md h-52">
                      <div className="absolute left-4 top-0 bg-white p-2 shadow-md transform -rotate-2">
                        <div className="aspect-[4/5] w-28 overflow-hidden">
                          <img src={selectedPhotos[0]} alt="Memory 1" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-8 bg-white p-2 shadow-lg z-10">
                        <div className="aspect-[3/2] w-36 overflow-hidden">
                          <img src={selectedPhotos[1]} alt="Memory 2" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="absolute right-4 top-2 bg-white p-2 shadow-md transform rotate-2">
                        <div className="aspect-[4/5] w-28 overflow-hidden">
                          <img src={selectedPhotos[2]} alt="Memory 3" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cover Message - Elegant and Prominent */}
              {template.coverMessage ? (
                <div className="flex-1 flex items-center justify-center px-4">
                  <p className="text-text-soft text-2xl leading-loose text-center italic font-light max-w-md">
                    {template.coverMessage}
                  </p>
                </div>
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
            <div className="aspect-[5/7] flex flex-col justify-between p-10 py-12">
              {/* Inside Message from Firefly Grove - Elegant Typography */}
              {template.insideMessage && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="max-w-md">
                    <p className="text-text-soft text-xl leading-loose text-center font-light whitespace-pre-line">
                      {template.insideMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Personal Message - Larger and Prominent */}
              <div className="text-center my-8">
                {customMessage ? (
                  <p className="text-text-soft text-base leading-relaxed whitespace-pre-wrap max-w-md mx-auto">
                    {customMessage}
                  </p>
                ) : (
                  <p className="text-text-muted text-xs italic">
                    Your personal message...
                  </p>
                )}
              </div>

              {/* Signature - Elegant */}
              {(signature || senderName) && (
                <div className="text-center mt-auto mb-6">
                  {signature ? (
                    <p
                      className="text-text-soft text-2xl italic"
                      style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                    >
                      {signature}
                    </p>
                  ) : senderName && (
                    <>
                      <p className="text-text-muted text-xs mb-2">With love,</p>
                      <p className="text-text-soft text-base font-medium">
                        {senderName}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Firefly Grove Branding */}
              <div className="text-center pt-4 border-t border-border-subtle/50">
                <p className="text-text-muted text-xs flex items-center justify-center gap-1">
                  <span className="text-firefly-glow text-sm">✦</span>
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

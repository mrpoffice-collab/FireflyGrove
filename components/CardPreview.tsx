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
              {/* Photos on Front - Firefly Grove Style */}
              {selectedPhotos.length > 0 && (
                <div className="w-full flex items-center justify-center mb-6">
                  {selectedPhotos.length === 1 ? (
                    // Single photo - Large with firefly glow
                    <div className="relative">
                      <div className="absolute inset-0 bg-firefly-glow/20 blur-xl rounded-lg"></div>
                      <div className="relative bg-white p-4 shadow-2xl transform hover:scale-105 transition-transform rounded-sm">
                        <div className="aspect-[4/5] w-72 overflow-hidden">
                          <img
                            src={selectedPhotos[0]}
                            alt="Memory"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ) : selectedPhotos.length === 2 ? (
                    // Two photos - Larger overlapping collage
                    <div className="relative w-full h-64">
                      <div className="absolute left-12 top-4 bg-white p-3 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform">
                        <div className="aspect-[3/2] w-52 overflow-hidden">
                          <img src={selectedPhotos[0]} alt="Memory 1" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="absolute right-12 top-12 bg-white p-3 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform z-10">
                        <div className="aspect-[3/2] w-52 overflow-hidden">
                          <img src={selectedPhotos[1]} alt="Memory 2" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      {/* Firefly accent */}
                      <div className="absolute top-0 right-1/4 w-2 h-2 bg-firefly-glow rounded-full blur-sm animate-pulse"></div>
                    </div>
                  ) : (
                    // Three photos - Random artistic collage with more space
                    <div className="relative w-full h-72">
                      <div className="absolute left-8 top-2 bg-white p-3 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform">
                        <div className="aspect-[4/5] w-36 overflow-hidden">
                          <img src={selectedPhotos[0]} alt="Memory 1" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-16 bg-white p-3 shadow-2xl z-10 transform hover:scale-105 transition-transform">
                        <div className="aspect-[3/2] w-48 overflow-hidden">
                          <img src={selectedPhotos[1]} alt="Memory 2" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="absolute right-8 top-6 bg-white p-3 shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
                        <div className="aspect-[4/5] w-36 overflow-hidden">
                          <img src={selectedPhotos[2]} alt="Memory 3" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      {/* Firefly accents */}
                      <div className="absolute top-4 left-1/3 w-2 h-2 bg-firefly-glow rounded-full blur-sm animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-firefly-glow rounded-full blur-sm animate-pulse" style={{animationDelay: '1.5s'}}></div>
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
                  <div className="max-w-md relative">
                    {/* Firefly decorative accents */}
                    <div className="absolute -left-8 top-1/2 w-1.5 h-1.5 bg-firefly-glow rounded-full blur-sm animate-pulse"></div>
                    <div className="absolute -right-8 top-1/3 w-1.5 h-1.5 bg-firefly-glow rounded-full blur-sm animate-pulse" style={{animationDelay: '1s'}}></div>
                    <p className="text-text-soft text-xl leading-loose text-center font-light whitespace-pre-line">
                      {template.insideMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Personal Message - Handwriting Style */}
              <div className="text-center my-8">
                {customMessage ? (
                  <p
                    className="text-text-soft text-2xl leading-relaxed whitespace-pre-wrap max-w-md mx-auto"
                    style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                  >
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
                      className="text-text-soft text-3xl italic"
                      style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
                    >
                      {signature}
                    </p>
                  ) : senderName && (
                    <>
                      <p className="text-text-muted text-xs mb-2">With love,</p>
                      <p className="text-text-soft text-lg font-medium">
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

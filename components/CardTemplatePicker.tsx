'use client'

import { useEffect, useState } from 'react'

interface Template {
  id: string
  name: string
  description: string
  previewImage: string
  digitalPrice: number
  physicalPrice: number
  maxPhotos: number
  deliveryType?: 'digital' | 'physical'
}

interface CardTemplatePickerProps {
  categoryId: string
  onSelectTemplate: (template: Template) => void
}

export default function CardTemplatePicker({ categoryId, onSelectTemplate }: CardTemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [deliveryType, setDeliveryType] = useState<'digital' | 'physical'>('digital')

  useEffect(() => {
    fetchTemplates()
  }, [categoryId])

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/cards/templates?categoryId=${categoryId}`)
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted">Loading templates...</div>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎨</div>
        <h2 className="text-2xl text-text-soft mb-2">Templates Coming Soon</h2>
        <p className="text-text-muted">
          We're designing beautiful templates for this category.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-firefly-glow mb-4">
          Choose a Template
        </h2>
        <p className="text-text-muted">
          Select the design that best expresses your message
        </p>
      </div>

      {/* Delivery Type Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-bg-dark border border-border-subtle rounded-lg p-1">
          <button
            onClick={() => setDeliveryType('digital')}
            className={`px-6 py-2 rounded transition-soft ${
              deliveryType === 'digital'
                ? 'bg-firefly-dim text-bg-dark'
                : 'text-text-muted hover:text-text-soft'
            }`}
          >
            📧 Digital
          </button>
          <button
            disabled
            title="Physical cards coming soon with transparent pricing"
            className="px-6 py-2 rounded transition-soft text-text-muted opacity-50 cursor-not-allowed"
          >
            📮 Printed & Mailed (Coming Soon)
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate({ ...template, deliveryType })}
            className="bg-bg-dark border border-border-subtle rounded-lg overflow-hidden hover:border-firefly-dim/50 transition-soft text-left group"
          >
            {/* Preview Image */}
            <div className="aspect-[5/7] bg-bg-elevated flex items-center justify-center border-b border-border-subtle">
              {template.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-text-muted text-6xl">💌</div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="text-lg text-text-soft font-medium mb-2 group-hover:text-firefly-glow transition-soft">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-text-muted text-sm mb-3">
                  {template.description}
                </p>
              )}

              {/* Pricing */}
              <div className="flex items-center justify-between">
                <span className="text-firefly-glow font-medium">
                  ${deliveryType === 'digital' ? template.digitalPrice.toFixed(2) : template.physicalPrice.toFixed(2)}
                </span>
                <span className="text-text-muted text-xs">
                  {template.maxPhotos} photo{template.maxPhotos !== 1 ? 's' : ''} max
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-bg-dark border border-border-subtle rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <div className="flex items-start gap-2 mb-2">
              <span className="text-firefly-glow">📧</span>
              <div>
                <div className="text-text-soft font-medium mb-1">Digital Delivery</div>
                <ul className="text-text-muted space-y-1">
                  <li>• Instant email delivery</li>
                  <li>• Shareable link</li>
                  <li>• Track when opened</li>
                  <li>• Starting at $0.99</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-start gap-2">
              <span className="text-firefly-glow">📮</span>
              <div>
                <div className="text-text-soft font-medium mb-1">Printed & Mailed</div>
                <ul className="text-text-muted space-y-1">
                  <li>• Professional printing</li>
                  <li>• Mailed to recipient</li>
                  <li>• USPS tracking included</li>
                  <li>• Starting at $4.99</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

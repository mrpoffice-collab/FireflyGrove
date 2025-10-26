'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import CardCategoryPicker from '@/components/CardCategoryPicker'
import CardTemplatePicker from '@/components/CardTemplatePicker'
import CardDesigner from '@/components/CardDesigner'

type Step = 'category' | 'template' | 'design'

export default function CreateCardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentStep('template')
  }

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    setCurrentStep('design')
  }

  const handleBack = () => {
    if (currentStep === 'design') {
      setCurrentStep('template')
    } else if (currentStep === 'template') {
      setCurrentStep('category')
      setSelectedCategory(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg-darker">
      <Header userName={session?.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'category' ? 'text-firefly-glow' : 'text-text-muted'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'category' ? 'border-firefly-glow bg-firefly-glow/20' : 'border-border-subtle'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Category</span>
            </div>

            <div className="w-12 h-0.5 bg-border-subtle" />

            <div className={`flex items-center gap-2 ${currentStep === 'template' ? 'text-firefly-glow' : 'text-text-muted'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'template' ? 'border-firefly-glow bg-firefly-glow/20' : 'border-border-subtle'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Template</span>
            </div>

            <div className="w-12 h-0.5 bg-border-subtle" />

            <div className={`flex items-center gap-2 ${currentStep === 'design' ? 'text-firefly-glow' : 'text-text-muted'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'design' ? 'border-firefly-glow bg-firefly-glow/20' : 'border-border-subtle'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Customize</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          {currentStep !== 'category' && (
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-text-muted hover:text-firefly-glow transition-soft"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          {/* Step Content */}
          {currentStep === 'category' && (
            <CardCategoryPicker onSelectCategory={handleCategorySelect} />
          )}

          {currentStep === 'template' && selectedCategory && (
            <CardTemplatePicker
              categoryId={selectedCategory}
              onSelectTemplate={handleTemplateSelect}
            />
          )}

          {currentStep === 'design' && selectedTemplate && (
            <CardDesigner template={selectedTemplate} />
          )}
        </div>
      </div>
    </div>
  )
}

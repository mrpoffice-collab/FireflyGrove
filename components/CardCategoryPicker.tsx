'use client'

import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  icon: string
  description: string
  displayOrder: number
}

interface CardCategoryPickerProps {
  onSelectCategory: (categoryId: string) => void
}

export default function CardCategoryPicker({ onSelectCategory }: CardCategoryPickerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/cards/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted">Loading categories...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">💌</div>
        <h1 className="text-4xl font-light text-firefly-glow mb-4">
          Create a Greeting Card
        </h1>
        <p className="text-text-muted text-lg">
          Choose the light you want to share
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="bg-bg-dark border border-border-subtle rounded-lg p-6 hover:border-firefly-dim/50 transition-soft text-center group"
          >
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="text-lg text-text-soft font-medium mb-2">
              {category.name}
            </h3>
            <p className="text-text-muted text-sm">
              {category.description}
            </p>
          </button>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim/30 rounded-lg p-6 text-center">
        <p className="text-text-muted text-sm">
          ✨ All cards can be sent digitally or printed at home
        </p>
        <p className="text-text-muted text-sm mt-1">
          💝 Add photos or soundwave art from your grove and customize with your personal message
        </p>
      </div>
    </div>
  )
}

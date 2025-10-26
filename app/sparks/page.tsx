'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface Spark {
  id: string
  text: string
  category: string | null
  isGlobal: boolean
  isActive: boolean
  usageCount: number
  createdAt: string
  user?: {
    id: string
    name: string
  }
}

const CATEGORIES = [
  'All',
  'Childhood',
  'Family',
  'Relationships',
  'Career',
  'Hobbies',
  'Travel',
  'Achievements',
  'Challenges',
  'Wisdom',
  'Other',
]

export default function SparksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sparks, setSparks] = useState<Spark[]>([])
  const [filteredSparks, setFilteredSparks] = useState<Spark[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSparkText, setNewSparkText] = useState('')
  const [newSparkCategory, setNewSparkCategory] = useState('')
  const [editingSparkId, setEditingSparkId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch sparks
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSparks()
    }
  }, [status])

  // Filter sparks by category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredSparks(sparks)
    } else {
      setFilteredSparks(sparks.filter((s) => s.category === selectedCategory))
    }
  }, [selectedCategory, sparks])

  const fetchSparks = async () => {
    try {
      const response = await fetch('/api/sparks')
      if (response.ok) {
        const data = await response.json()
        setSparks(data)
      }
    } catch (error) {
      console.error('Error fetching sparks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSpark = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSparkText.trim()) return

    try {
      const response = await fetch('/api/sparks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newSparkText,
          category: newSparkCategory || null,
        }),
      })

      if (response.ok) {
        const newSpark = await response.json()
        setSparks([newSpark, ...sparks])
        setNewSparkText('')
        setNewSparkCategory('')
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating spark:', error)
    }
  }

  const handleUpdateSpark = async (sparkId: string, text: string) => {
    try {
      const response = await fetch(`/api/sparks/${sparkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const updatedSpark = await response.json()
        setSparks(sparks.map((s) => (s.id === sparkId ? updatedSpark : s)))
        setEditingSparkId(null)
        setEditText('')
      }
    } catch (error) {
      console.error('Error updating spark:', error)
    }
  }

  const handleDeleteSpark = async (sparkId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      const response = await fetch(`/api/sparks/${sparkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSparks(sparks.filter((s) => s.id !== sparkId))
      }
    } catch (error) {
      console.error('Error deleting spark:', error)
    }
  }

  const handleToggleActive = async (sparkId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/sparks/${sparkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      })

      if (response.ok) {
        const updatedSpark = await response.json()
        setSparks(sparks.map((s) => (s.id === sparkId ? updatedSpark : s)))
      }
    } catch (error) {
      console.error('Error toggling spark:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Only accept text files
    if (!file.name.endsWith('.txt')) {
      alert('Please upload a .txt file')
      return
    }

    setUploadingFile(true)

    try {
      const text = await file.text()
      // Split by newlines and filter out empty lines
      const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      if (lines.length === 0) {
        alert('No prompts found in file')
        setUploadingFile(false)
        return
      }

      // Create all sparks
      let successCount = 0
      for (const line of lines) {
        try {
          const response = await fetch('/api/sparks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: line,
              category: null,
            }),
          })

          if (response.ok) {
            successCount++
          }
        } catch (error) {
          console.error('Error creating spark:', error)
        }
      }

      // Refresh the list
      await fetchSparks()
      alert(`Successfully uploaded ${successCount} of ${lines.length} prompts!`)

      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Error reading file. Please try again.')
    } finally {
      setUploadingFile(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-text-soft mb-3">Memory Sparks</h1>
          <p className="text-text-muted text-lg">
            Custom prompts to inspire meaningful memories. Create your own or use community favorites.
          </p>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          {!showCreateForm ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                + Create New Spark
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`px-6 py-3 bg-bg-elevated border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft cursor-pointer inline-block ${
                    uploadingFile ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingFile ? '📤 Uploading...' : '📁 Upload from File'}
                </label>
              </div>

              <div className="text-xs text-text-muted ml-2 flex items-center gap-2">
                Upload a .txt file with one prompt per line •
                <a
                  href="/sparks-template.txt"
                  download="my-sparks-template.txt"
                  className="text-firefly-glow hover:text-firefly-bright underline"
                >
                  Download template
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
              <h3 className="text-xl font-medium text-text-soft mb-4">Create New Spark</h3>
              <form onSubmit={handleCreateSpark} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Prompt Text
                  </label>
                  <textarea
                    value={newSparkText}
                    onChange={(e) => setNewSparkText(e.target.value)}
                    placeholder="e.g., What was your first memory with this person?"
                    className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft placeholder-text-muted focus:outline-none focus:border-firefly-dim resize-none"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Category (optional)
                  </label>
                  <select
                    value={newSparkCategory}
                    onChange={(e) => setNewSparkCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim"
                  >
                    <option value="">No category</option>
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
                  >
                    Create Spark
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewSparkText('')
                      setNewSparkCategory('')
                    }}
                    className="px-6 py-2 bg-bg-dark border border-border-subtle hover:border-border-default text-text-muted rounded-lg transition-soft"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-soft ${
                selectedCategory === cat
                  ? 'bg-firefly-dim text-bg-dark'
                  : 'bg-bg-elevated border border-border-subtle text-text-muted hover:border-firefly-dim'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sparks List */}
        <div className="space-y-4">
          {filteredSparks.length === 0 ? (
            <div className="text-center py-12 bg-bg-elevated border border-border-subtle rounded-xl">
              <p className="text-text-muted">
                {selectedCategory === 'All'
                  ? 'No sparks yet. Create your first one above!'
                  : `No sparks in the "${selectedCategory}" category.`}
              </p>
            </div>
          ) : (
            filteredSparks.map((spark) => {
              const isOwner = spark.user?.id === (session?.user as any)?.id
              const isEditing = editingSparkId === spark.id

              return (
                <div
                  key={spark.id}
                  className={`bg-bg-elevated border rounded-xl p-6 transition-soft ${
                    spark.isActive ? 'border-border-subtle' : 'border-border-subtle opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {isEditing ? (
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim resize-none"
                          rows={2}
                        />
                      ) : (
                        <p className="text-lg text-text-soft mb-3">{spark.text}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        {spark.category && (
                          <span className="px-2 py-1 bg-firefly-dim/10 text-firefly-glow rounded">
                            {spark.category}
                          </span>
                        )}
                        {spark.isGlobal && (
                          <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded">
                            Global
                          </span>
                        )}
                        <span>Used {spark.usageCount} times</span>
                        {!isOwner && spark.user && (
                          <span>by {spark.user.name}</span>
                        )}
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdateSpark(spark.id, editText)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-soft"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingSparkId(null)
                                setEditText('')
                              }}
                              className="px-3 py-1 bg-bg-dark border border-border-subtle hover:border-border-default text-text-muted rounded text-sm transition-soft"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingSparkId(spark.id)
                                setEditText(spark.text)
                              }}
                              className="px-3 py-1 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-muted rounded text-sm transition-soft"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(spark.id, spark.isActive)}
                              className={`px-3 py-1 rounded text-sm transition-soft ${
                                spark.isActive
                                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                              }`}
                            >
                              {spark.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteSpark(spark.id)}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-soft"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

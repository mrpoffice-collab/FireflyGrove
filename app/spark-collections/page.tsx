'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface Collection {
  id: string
  name: string
  description: string | null
  icon: string | null
  promptCount: number
  isFeatured: boolean
  isGlobal: boolean
  isSharedWithGrove: boolean
  createdAt: string
  isActive: boolean
}

export default function SparkCollectionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userCollections, setUserCollections] = useState<Collection[]>([])
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadName, setUploadName] = useState('')
  const [uploadIcon, setUploadIcon] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchCollections()
    }
  }, [status, router])

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/spark-collections')
      if (res.ok) {
        const data = await res.json()
        setUserCollections(data.userCollections || [])
        setFeaturedCollections(data.featuredCollections || [])
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadFile || !uploadName.trim()) {
      alert('Please select a file and enter a collection name')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('name', uploadName.trim())
      if (uploadIcon) formData.append('icon', uploadIcon)
      if (uploadDescription) formData.append('description', uploadDescription.trim())

      const res = await fetch('/api/spark-collections/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        setShowUploadModal(false)
        setUploadFile(null)
        setUploadName('')
        setUploadIcon('')
        setUploadDescription('')
        fetchCollections()
      } else {
        const error = await res.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleToggle = async (collectionId: string) => {
    try {
      const res = await fetch(`/api/spark-collections/${collectionId}/toggle`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchCollections()
      }
    } catch (error) {
      console.error('Error toggling collection:', error)
    }
  }

  const handleToggleSharing = async (collectionId: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/spark-collections/${collectionId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSharedWithGrove: !currentState }),
      })

      if (res.ok) {
        fetchCollections()
      }
    } catch (error) {
      console.error('Error toggling sharing:', error)
    }
  }

  const handleDelete = async (collectionId: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete "${collectionName}"? This will remove all ${userCollections.find(c => c.id === collectionId)?.promptCount || 0} prompts in this collection.`)) {
      return
    }

    try {
      const res = await fetch(`/api/spark-collections/${collectionId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCollections()
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
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
          <h1 className="text-4xl font-light text-text-soft mb-3">My Spark Collections</h1>
          <p className="text-text-muted text-lg">
            Organize your prompts into themed collections. Upload files or create collections manually.
          </p>
        </div>

        {/* Upload Button */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
          >
            + Upload New Collection
          </button>

          <a
            href="/sparks-template.txt"
            download="my-sparks-template.txt"
            className="px-6 py-3 bg-bg-elevated border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg font-medium transition-soft"
          >
            📁 Download Template
          </a>
        </div>

        {/* User Collections */}
        <div className="mb-12">
          <h2 className="text-2xl font-light text-text-soft mb-4">My Collections</h2>

          {userCollections.length === 0 ? (
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-12 text-center">
              <p className="text-text-muted mb-4">
                You haven't created any collections yet.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Upload Your First Collection
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {userCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-firefly-dim/30 transition-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {collection.icon && (
                          <span className="text-3xl">{collection.icon}</span>
                        )}
                        <h3 className="text-xl text-text-soft font-medium">{collection.name}</h3>
                      </div>
                      {collection.description && (
                        <p className="text-text-muted text-sm mb-3">{collection.description}</p>
                      )}
                      <p className="text-text-muted text-sm">
                        {collection.promptCount} {collection.promptCount === 1 ? 'prompt' : 'prompts'} •
                        Created {new Date(collection.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Active Toggle Switch */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleToggle(collection.id)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            collection.isActive ? 'bg-firefly-glow' : 'bg-bg-dark'
                          }`}
                          title={collection.isActive ? 'Active' : 'Inactive'}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              collection.isActive ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-xs text-text-muted">Active</span>
                      </div>

                      {/* Share with Grove Toggle */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleToggleSharing(collection.id, collection.isSharedWithGrove)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            collection.isSharedWithGrove ? 'bg-blue-500' : 'bg-bg-dark'
                          }`}
                          title={collection.isSharedWithGrove ? 'Shared with Grove' : 'Not shared'}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              collection.isSharedWithGrove ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-xs text-text-muted">Share</span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(collection.id, collection.name)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-error-text rounded text-sm transition-soft"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Collections */}
        {featuredCollections.length > 0 && (
          <div>
            <h2 className="text-2xl font-light text-text-soft mb-4">Featured Collections</h2>
            <p className="text-text-muted text-sm mb-4">
              Created by Firefly Grove. Toggle to add these prompts to your grove.
            </p>

            <div className="grid gap-4">
              {featuredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-firefly-dim/30 transition-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {collection.icon && (
                          <span className="text-3xl">{collection.icon}</span>
                        )}
                        <h3 className="text-xl text-text-soft font-medium">{collection.name}</h3>
                        {collection.isFeatured && (
                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      {collection.description && (
                        <p className="text-text-muted text-sm mb-3">{collection.description}</p>
                      )}
                      <p className="text-text-muted text-sm">
                        {collection.promptCount} {collection.promptCount === 1 ? 'prompt' : 'prompts'} •
                        By Firefly Grove
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(collection.id)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        collection.isActive ? 'bg-firefly-glow' : 'bg-bg-dark'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          collection.isActive ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-bg-dark border border-border-subtle rounded-xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-light text-text-soft mb-6">Upload Spark Collection</h2>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Select File (.txt)
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-soft file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-firefly-dim file:text-bg-dark hover:file:bg-firefly-glow transition-soft"
                  required
                />
                <p className="text-text-muted text-xs mt-2">
                  One prompt per line. Empty lines will be ignored.
                </p>
              </div>

              {/* Collection Name */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g., Family Memories, Bible Verses, Recovery Journey"
                  className="w-full px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
                  required
                />
              </div>

              {/* Icon (Emoji) */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Icon (Optional)
                </label>
                <input
                  type="text"
                  value={uploadIcon}
                  onChange={(e) => setUploadIcon(e.target.value)}
                  placeholder="e.g., 📖, 💙, 🎄"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="What is this collection about?"
                  className="w-full px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50 placeholder:text-placeholder resize-none"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Collection'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadName('')
                    setUploadIcon('')
                    setUploadDescription('')
                  }}
                  className="px-6 py-3 bg-bg-elevated border border-border-subtle hover:border-border-default text-text-muted rounded-lg transition-soft"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

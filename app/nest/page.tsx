'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { motion } from 'framer-motion'

interface NestItem {
  id: string
  photoUrl: string
  thumbnailUrl: string | null
  filename: string
  caption: string | null
  uploadedAt: string
  takenAt: string | null
}

interface UploadProgress {
  filename: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export default function NestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [nestItems, setNestItems] = useState<NestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([])
  const [uploadStats, setUploadStats] = useState({ total: 0, completed: 0, failed: 0 })
  const [showBranchSelector, setShowBranchSelector] = useState(false)
  const [selectedNestItem, setSelectedNestItem] = useState<NestItem | null>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchNestItems()
    }
  }, [status, router])

  const fetchNestItems = async () => {
    try {
      const res = await fetch('/api/nest')
      if (res.ok) {
        const data = await res.json()
        setNestItems(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch nest items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    )

    if (files.length > 0) {
      await uploadFiles(files)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      await uploadFiles(files)
    }
  }

  const uploadFiles = async (files: File[]) => {
    // Validate total count
    const MAX_FILES = 50
    if (files.length > MAX_FILES) {
      alert(`Please select up to ${MAX_FILES} photos at a time`)
      return
    }

    // Validate total size (200MB limit)
    const MAX_TOTAL_SIZE = 200 * 1024 * 1024
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      alert(`Total size exceeds 200MB limit. Please select fewer photos.`)
      return
    }

    setUploading(true)
    setUploadStats({ total: files.length, completed: 0, failed: 0 })

    // Initialize upload queue
    const queue: UploadProgress[] = files.map((file) => ({
      filename: file.name,
      status: 'pending',
      progress: 0,
    }))
    setUploadQueue(queue)

    // Upload files concurrently (3 at a time)
    const CONCURRENT_UPLOADS = 3
    const results: boolean[] = []

    for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
      const batch = files.slice(i, i + CONCURRENT_UPLOADS)
      const batchResults = await Promise.all(
        batch.map((file, batchIndex) => uploadSingleFile(file, i + batchIndex))
      )
      results.push(...batchResults)
    }

    // Update stats
    const successCount = results.filter((r) => r).length
    const failCount = results.filter((r) => !r).length
    setUploadStats({ total: files.length, completed: successCount, failed: failCount })

    // Refresh the nest
    await fetchNestItems()

    // Clear queue after a delay
    setTimeout(() => {
      setUploadQueue([])
      setUploading(false)
    }, 2000)
  }

  const uploadSingleFile = async (file: File, index: number): Promise<boolean> => {
    try {
      // Update status to uploading
      setUploadQueue((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, status: 'uploading', progress: 0 } : item
        )
      )

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/nest/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        // Success
        setUploadQueue((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, status: 'success', progress: 100 } : item
          )
        )
        return true
      } else {
        // Error
        const error = await res.text()
        setUploadQueue((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, status: 'error', progress: 0, error } : item
          )
        )
        return false
      }
    } catch (error) {
      // Network error
      setUploadQueue((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, status: 'error', progress: 0, error: 'Network error' }
            : item
        )
      )
      return false
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Remove this photo from the nest?')) return

    try {
      const res = await fetch(`/api/nest/${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setNestItems(nestItems.filter((item) => item.id !== itemId))
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleStartDrag = (e: any, item: NestItem) => {
    // Cast to DragEvent for proper typing
    const dragEvent = e as React.DragEvent
    dragEvent.dataTransfer.effectAllowed = 'move'
    dragEvent.dataTransfer.setData('nestItem', JSON.stringify(item))
  }

  const handleHatch = async (item: NestItem) => {
    setSelectedNestItem(item)
    setShowBranchSelector(true)

    // Fetch user's branches
    if (branches.length === 0) {
      setLoadingBranches(true)
      try {
        const res = await fetch('/api/branches')
        if (res.ok) {
          const data = await res.json()
          // API returns array directly, not wrapped in {branches: ...}
          const branchesData = Array.isArray(data) ? data : []
          // Sort alphabetically by branch title
          const sortedBranches = branchesData.sort((a: any, b: any) =>
            a.title.localeCompare(b.title)
          )
          setBranches(sortedBranches)
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error)
      } finally {
        setLoadingBranches(false)
      }
    }
  }

  const handleCreateNewBranch = () => {
    // Close branch selector and navigate to grove with nest photo data
    setShowBranchSelector(false)

    if (selectedNestItem) {
      // Store nest photo data in URL to carry through branch creation
      const nestPhotoData = encodeURIComponent(JSON.stringify({
        url: selectedNestItem.photoUrl,
        nestItemId: selectedNestItem.id
      }))
      router.push(`/grove?pendingNestPhoto=${nestPhotoData}`)
    } else {
      router.push('/grove')
    }
  }

  const handleBranchSelect = (branchId: string) => {
    if (!selectedNestItem) return

    // Navigate to branch with pre-populated photo
    router.push(`/branch/${branchId}?nestPhoto=${encodeURIComponent(JSON.stringify({
      url: selectedNestItem.photoUrl,
      nestItemId: selectedNestItem.id
    }))}`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading your nest...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-light text-text-soft mb-2">
                🪺 The Nest
              </h1>
              <p className="text-text-muted">
                Your memories have been waiting softly in The Nest.<br />
                When you're ready, give them a branch to glow from.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl text-firefly-dim mb-1">{nestItems.length}</div>
              <div className="text-xs text-text-muted">
                ready to be hatched
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="max-w-6xl mx-auto mb-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              dragActive
                ? 'border-firefly-glow bg-firefly-glow/5'
                : 'border-border-subtle hover:border-firefly-dim/50'
            }`}
          >
            <div className="text-4xl mb-2">📸</div>
            <h3 className="text-lg text-text-soft mb-2">
              Drop your photos here
            </h3>
            <p className="text-text-muted text-sm mb-4">
              Select all your photos at once • Up to 50 photos (200MB total)
            </p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />
              <span className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft cursor-pointer inline-block">
                {uploading ? 'Uploading...' : 'Choose Photos'}
              </span>
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && uploadQueue.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-text-soft">
                  Uploading Photos...
                </h3>
                <div className="text-sm text-text-muted">
                  {uploadStats.completed} / {uploadStats.total} completed
                  {uploadStats.failed > 0 && ` • ${uploadStats.failed} failed`}
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="w-full bg-bg-darker rounded-full h-2 mb-4">
                <div
                  className="bg-firefly-dim h-2 rounded-full transition-all"
                  style={{
                    width: `${(uploadStats.completed / uploadStats.total) * 100}%`,
                  }}
                />
              </div>

              {/* Individual File Progress */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {uploadQueue.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-sm p-2 rounded bg-bg-darker/50"
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {item.status === 'pending' && (
                        <div className="w-4 h-4 rounded-full border-2 border-text-muted animate-pulse" />
                      )}
                      {item.status === 'uploading' && (
                        <div className="w-4 h-4 rounded-full border-2 border-firefly-dim border-t-transparent animate-spin" />
                      )}
                      {item.status === 'success' && (
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Filename */}
                    <div className="flex-1 truncate text-text-soft">
                      {item.filename}
                    </div>

                    {/* Status Text */}
                    <div className="text-xs text-text-muted">
                      {item.status === 'pending' && 'Waiting...'}
                      {item.status === 'uploading' && 'Uploading...'}
                      {item.status === 'success' && 'Done'}
                      {item.status === 'error' && (
                        <span className="text-red-400">
                          {item.error || 'Failed'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nest Items Grid */}
        {nestItems.length === 0 ? (
          <div className="max-w-6xl mx-auto text-center py-16">
            <div className="text-6xl mb-4">🌙</div>
            <h3 className="text-xl text-text-soft mb-2">Your nest is empty</h3>
            <p className="text-text-muted">
              Upload photos to gather them here before creating memories
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 text-sm text-text-muted">
              💡 Tip: Hover over any photo to reveal "🐣 Hatch from Nest" and select a branch or make a new branch
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {nestItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  draggable
                  onDragStart={(e) => handleStartDrag(e, item)}
                  className="relative group cursor-move"
                >
                  {/* Firefly Glow Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(255, 217, 102, 0.3)',
                        '0 0 30px rgba(255, 217, 102, 0.5)',
                        '0 0 20px rgba(255, 217, 102, 0.3)',
                      ],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Photo */}
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-firefly-dim/30 bg-bg-dark">
                    <img
                      src={item.thumbnailUrl || item.photoUrl}
                      alt={item.caption || item.filename}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 pointer-events-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleHatch(item)
                        }}
                        className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded text-sm font-medium transition-colors pointer-events-auto"
                      >
                        🐣 Hatch from Nest
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        className="px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded text-xs transition-colors pointer-events-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Filename */}
                  <div className="mt-2 text-xs text-text-muted truncate">
                    {item.filename}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-6xl mx-auto mt-12 bg-bg-dark border border-border-subtle rounded-lg p-6">
          <h3 className="text-lg text-text-soft mb-3">How The Nest Works</h3>
          <div className="space-y-2 text-sm text-text-muted">
            <p>🪺 <strong>Upload:</strong> Select up to 50 photos at once (200MB total)</p>
            <p>⚡ <strong>Smart Upload:</strong> Photos upload 3 at a time with progress tracking</p>
            <p>🐣 <strong>Hatch:</strong> Hover over a photo and click "🐣 Hatch from Nest" to select a branch</p>
            <p>💭 <strong>Write:</strong> The photo pre-populates the memory form - just add your story</p>
            <p>🗑️ <strong>Remove:</strong> Hover over a photo to reveal the Remove button</p>
            <p>🖱️ <strong>Pro Tip:</strong> You can also drag photos directly onto branches (desktop)</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle text-xs text-text-muted">
            <strong>Limits:</strong> 10MB per photo • 50 photos per upload • 200MB total per session
          </div>
        </div>
      </div>

      {/* Branch Selector Modal */}
      {showBranchSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-text-soft">Select a Branch</h2>
              <button
                onClick={() => {
                  setShowBranchSelector(false)
                  setSelectedNestItem(null)
                }}
                className="text-text-muted hover:text-text-soft transition-soft"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-text-muted text-sm mb-4">
              Choose which branch to create this memory on
            </p>

            {loadingBranches ? (
              <div className="text-center py-8 text-text-muted">
                Loading your branches...
              </div>
            ) : branches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted mb-4">You don't have any branches yet</p>
                <button
                  onClick={handleCreateNewBranch}
                  className="px-4 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft"
                >
                  Create New Branch
                </button>
              </div>
            ) : (
              <>
                {/* Create New Branch Button */}
                <button
                  onClick={handleCreateNewBranch}
                  className="w-full mb-4 px-4 py-3 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow rounded-lg border-2 border-firefly-dim hover:border-firefly-glow transition-soft font-medium flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span>
                  <span>Create New Branch</span>
                </button>

                {/* Branches List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {branches.map((branch: any) => {
                    // Get tree or person name for display
                    const treeName = branch.person?.name || branch.tree?.name || 'Unknown Tree'

                    return (
                      <button
                        key={branch.id}
                        onClick={() => handleBranchSelect(branch.id)}
                        className="w-full text-left px-4 py-3 bg-bg-darker hover:bg-border-subtle rounded-lg border border-border-subtle hover:border-firefly-dim transition-soft"
                      >
                        <div className="font-medium text-text-soft mb-1">
                          {branch.title} <span className="text-text-muted font-normal">({treeName})</span>
                        </div>
                        {branch.description && (
                          <div className="text-sm text-text-muted truncate">
                            {branch.description}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

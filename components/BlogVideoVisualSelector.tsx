'use client'

import React, { useState, useEffect } from 'react'
import { BlogVideoSection } from '@/lib/blogVideoParser'
import { generateSearchQuery } from '@/lib/pexels'

interface PexelsPhoto {
  id: number
  src: {
    original: string
    large: string
    medium: string
    small: string
    tiny: string
  }
  photographer: string
  photographer_url: string
  alt: string
  avg_color: string
}

interface PexelsVideo {
  id: number
  video_files: Array<{
    id: number
    quality: string
    link: string
    width: number
    height: number
  }>
  video_pictures: Array<{
    picture: string
  }>
  user: {
    name: string
    url: string
  }
}

export interface SectionMedia {
  type: 'image' | 'video' | 'upload' | 'none'
  source: 'pexels' | 'upload' | 'blog-featured'
  url: string
  thumbnailUrl?: string
  pexelsId?: number
  photographer?: string
  photographerUrl?: string
  style: 'full' | 'background-blur' | 'split-left' | 'split-right' | 'ken-burns'
  videoQuality?: string
}

interface BlogVideoVisualSelectorProps {
  sections: BlogVideoSection[]
  onMediaSelected: (sectionId: string, media: SectionMedia | null) => void
  initialSelections?: { [sectionId: string]: SectionMedia }
}

export default function BlogVideoVisualSelector({
  sections,
  onMediaSelected,
  initialSelections = {},
}: BlogVideoVisualSelectorProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'photos' | 'videos'>('photos')
  const [searchResults, setSearchResults] = useState<(PexelsPhoto | PexelsVideo)[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<{ [sectionId: string]: SectionMedia }>(initialSelections)
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; filename: string }>>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>('')

  const currentSection = sections[currentSectionIndex]

  // Auto-search when section changes
  useEffect(() => {
    if (currentSection && !selectedMedia[currentSection.id]) {
      const query = generateSearchQuery(currentSection.heading || currentSection.text)
      setSearchQuery(query)
      performSearch(query, searchType)
    }
  }, [currentSectionIndex])

  const performSearch = async (query: string, type: 'photos' | 'videos') => {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    try {
      const endpoint = type === 'photos' ? '/api/pexels/search-photos' : '/api/pexels/search-videos'
      const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}&per_page=12`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Search failed: ${response.status}`)
      }

      const data = await response.json()
      setSearchResults(data.results[type] || [])
    } catch (error) {
      console.error('Error searching Pexels:', error)
      setError(error instanceof Error ? error.message : 'Failed to search. Please try again.')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    performSearch(searchQuery, searchType)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/blog-video/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadedImages(prev => [...prev, { url: data.url, filename: data.filename }])

      // Auto-select the uploaded image for current section
      selectUploadedImage(data.url, data.filename)
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const selectUploadedImage = (url: string, filename: string, style: string = 'full') => {
    const media: SectionMedia = {
      type: 'upload',
      source: 'upload',
      url: url,
      thumbnailUrl: url,
      style: style as any,
    }

    const newSelections = {
      ...selectedMedia,
      [currentSection.id]: media,
    }
    setSelectedMedia(newSelections)
    onMediaSelected(currentSection.id, media)
  }

  const selectPhoto = (photo: PexelsPhoto, style: string = 'full') => {
    const media: SectionMedia = {
      type: 'image',
      source: 'pexels',
      url: photo.src.large,
      thumbnailUrl: photo.src.medium,
      pexelsId: photo.id,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      style: style as any,
    }

    const newSelections = {
      ...selectedMedia,
      [currentSection.id]: media,
    }
    setSelectedMedia(newSelections)
    onMediaSelected(currentSection.id, media)
  }

  const selectVideo = (video: PexelsVideo, style: string = 'full') => {
    // Find best quality HD video file
    const hdFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0]

    const media: SectionMedia = {
      type: 'video',
      source: 'pexels',
      url: hdFile.link,
      thumbnailUrl: video.video_pictures[0]?.picture,
      pexelsId: video.id,
      photographer: video.user.name,
      photographerUrl: video.user.url,
      style: style as any,
      videoQuality: hdFile.quality,
    }

    const newSelections = {
      ...selectedMedia,
      [currentSection.id]: media,
    }
    setSelectedMedia(newSelections)
    onMediaSelected(currentSection.id, media)
  }

  const clearSelection = () => {
    const newSelections = { ...selectedMedia }
    delete newSelections[currentSection.id]
    setSelectedMedia(newSelections)
    onMediaSelected(currentSection.id, null)
  }

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const selectedCount = Object.keys(selectedMedia).length
  const currentMedia = selectedMedia[currentSection.id]

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-text-muted">
          Section {currentSectionIndex + 1} of {sections.length}
        </div>
        <div className="text-text-soft">
          {selectedCount} sections have visuals
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-bg-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-firefly-dim transition-all duration-300"
          style={{ width: `${(selectedCount / sections.length) * 100}%` }}
        />
      </div>

      {/* Current Section Info */}
      <div className="p-6 bg-bg-dark border border-border-subtle rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 bg-firefly-dim/20 text-firefly-glow rounded text-xs font-medium">
                {currentSection.type}
              </span>
              <span className="text-xs text-text-muted">
                {currentSection.duration}s
              </span>
            </div>

            {currentSection.heading && (
              <h3 className="text-lg font-medium text-text-soft mb-2">
                {currentSection.heading}
              </h3>
            )}

            <p className="text-sm text-text-muted line-clamp-2">
              {currentSection.text}
            </p>
          </div>

          {currentMedia && (
            <button
              onClick={clearSelection}
              className="ml-4 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-error-text rounded text-sm transition-soft"
            >
              Clear
            </button>
          )}
        </div>

        {/* Current Selection Preview */}
        {currentMedia && (
          <div className="mt-4 p-4 bg-bg-elevated rounded-lg border border-firefly-dim/30">
            <div className="text-xs text-firefly-glow mb-2">✓ Visual Selected</div>
            <div className="flex gap-3 items-start">
              <img
                src={currentMedia.thumbnailUrl || currentMedia.url}
                alt="Selected"
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1 text-xs">
                <div className="text-text-soft mb-1">
                  {currentMedia.type === 'video' ? '🎥 Video' : '🖼️ Photo'}
                  {' • '}
                  Style: {currentMedia.style}
                </div>
                {currentMedia.photographer && (
                  <div className="text-text-muted">
                    by {currentMedia.photographer}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-error-text text-sm">
          <div className="font-medium mb-1">Search Error</div>
          {error}
          <button
            onClick={() => setError('')}
            className="ml-3 px-2 py-1 bg-red-500/30 hover:bg-red-500/40 rounded text-xs transition-soft"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Interface */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSearchType('photos')}
            className={`px-4 py-2 rounded-lg font-medium transition-soft ${
              searchType === 'photos'
                ? 'bg-firefly-dim text-bg-dark'
                : 'bg-bg-dark text-text-muted hover:text-text-soft'
            }`}
          >
            📷 Photos
          </button>
          <button
            onClick={() => setSearchType('videos')}
            className={`px-4 py-2 rounded-lg font-medium transition-soft ${
              searchType === 'videos'
                ? 'bg-firefly-dim text-bg-dark'
                : 'bg-bg-dark text-text-muted hover:text-text-soft'
            }`}
          >
            🎥 Videos
          </button>
          <div className="flex-1" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-success-text rounded-lg font-medium transition-soft disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search ${searchType}...`}
            className="flex-1 px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-glow focus:ring-2 focus:ring-firefly-glow/50"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:bg-gray-700 disabled:text-gray-500"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {searchQuery && (
          <div className="text-xs text-text-muted">
            Auto-suggested based on: "{currentSection.heading || currentSection.text}"
          </div>
        )}
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-text-muted">Your Uploaded Images:</div>
          <div className="grid grid-cols-3 gap-4">
            {uploadedImages.map((upload, index) => (
              <div
                key={index}
                onClick={() => selectUploadedImage(upload.url, upload.filename)}
                className="group cursor-pointer relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-green-400 transition-soft"
              >
                <img
                  src={upload.url}
                  alt={upload.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs truncate">
                    {upload.filename}
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/80 text-white text-xs rounded">
                  Custom
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">
          Searching Pexels...
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {searchResults.map((result) => {
            if (searchType === 'photos') {
              const photo = result as PexelsPhoto
              return (
                <div
                  key={photo.id}
                  onClick={() => selectPhoto(photo)}
                  className="group cursor-pointer relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-firefly-dim transition-soft"
                >
                  <img
                    src={photo.src.medium}
                    alt={photo.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                      by {photo.photographer}
                    </div>
                  </div>
                </div>
              )
            } else {
              const video = result as PexelsVideo
              return (
                <div
                  key={video.id}
                  onClick={() => selectVideo(video)}
                  className="group cursor-pointer relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-firefly-dim transition-soft"
                >
                  <img
                    src={video.video_pictures[0]?.picture}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white text-xs">
                    ▶
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                      by {video.user.name}
                    </div>
                  </div>
                </div>
              )
            }
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted">
          No results found. Try a different search term.
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-6 border-t border-border-subtle">
        <button
          onClick={goToPreviousSection}
          disabled={currentSectionIndex === 0}
          className="px-4 py-2 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg transition-soft disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <button
          onClick={goToNextSection}
          disabled={currentSectionIndex === sections.length - 1}
          className="px-4 py-2 bg-bg-dark border border-border-subtle hover:border-firefly-dim text-text-soft rounded-lg transition-soft disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>

        <div className="flex-1" />

        <div className="text-sm text-text-muted flex items-center">
          {selectedCount === sections.length ? (
            <span className="text-firefly-glow">✓ All sections have visuals</span>
          ) : (
            <span>{sections.length - selectedCount} sections still need visuals</span>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

interface GrovePhotoPickerProps {
  maxPhotos: number
  selectedPhotos: string[]
  onSelect: (photoUrls: string[]) => void
  onClose: () => void
}

export default function GrovePhotoPicker({
  maxPhotos,
  selectedPhotos,
  onSelect,
  onClose,
}: GrovePhotoPickerProps) {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>(selectedPhotos)

  useEffect(() => {
    fetchGrovePhotos()
  }, [])

  const fetchGrovePhotos = async () => {
    try {
      const res = await fetch('/api/cards/grove-photos')
      const data = await res.json()
      setPhotos(data)
    } catch (error) {
      console.error('Failed to fetch grove photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePhoto = (url: string) => {
    if (selected.includes(url)) {
      setSelected(selected.filter((u) => u !== url))
    } else if (selected.length < maxPhotos) {
      setSelected([...selected, url])
    }
  }

  const handleConfirm = () => {
    onSelect(selected)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-xl text-text-soft font-medium">
              Select Photos & Soundwaves
            </h3>
            <p className="text-text-muted text-sm mt-1">
              Choose up to {maxPhotos} image{maxPhotos !== 1 ? 's' : ''} from your grove ({selected.length} selected)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-soft transition-soft"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-text-muted">Loading photos...</div>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📷</div>
              <p className="text-text-muted">No photos or audio memories found in your grove yet.</p>
              <p className="text-text-muted text-sm mt-2">
                Add memories with photos or audio to use them in cards.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo) => (
                <button
                  key={photo.url}
                  onClick={() => togglePhoto(photo.url)}
                  disabled={!selected.includes(photo.url) && selected.length >= maxPhotos}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selected.includes(photo.url)
                      ? 'border-firefly-glow shadow-lg scale-95'
                      : 'border-transparent hover:border-firefly-dim/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <img
                    src={photo.url}
                    alt={photo.branchName}
                    className="w-full h-full object-cover"
                  />

                  {/* Type Badge */}
                  {photo.type === 'soundwave' && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-firefly-glow/90 text-bg-dark text-xs font-medium rounded flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v18M8 6v12M16 6v12M4 9v6M20 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Audio
                    </div>
                  )}

                  {selected.includes(photo.url) && (
                    <div className="absolute inset-0 bg-firefly-glow/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-firefly-glow text-bg-dark rounded-full flex items-center justify-center font-bold">
                        {selected.indexOf(photo.url) + 1}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-subtle flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-bg-elevated border border-border-subtle rounded text-text-soft hover:border-firefly-dim transition-soft"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="px-6 py-2 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft disabled:opacity-50"
          >
            Use {selected.length} Image{selected.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

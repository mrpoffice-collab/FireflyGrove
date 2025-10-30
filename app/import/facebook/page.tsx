'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

export default function FacebookImportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      const adminStatus = (session.user as any).isAdmin
      setIsAdmin(adminStatus)
    }
  }, [session])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file type
    const validTypes = ['application/zip', 'application/x-zip-compressed', 'application/json']
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(zip|json)$/i)) {
      setMessage({
        type: 'error',
        text: 'Please upload a ZIP or JSON file from Facebook data export',
      })
      return
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (selectedFile.size > maxSize) {
      setMessage({
        type: 'error',
        text: 'File is too large. Maximum size is 500MB.',
      })
      return
    }

    setFile(selectedFile)
    setMessage(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setMessage({ type: 'info', text: 'Uploading and analyzing your Facebook data...' })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/import/facebook', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      const successMessage = data.message || `Successfully imported ${data.photosCount || 0} photos!`
      const details = []

      if (data.photosCount) {
        details.push(`${data.photosCount} photos imported`)
      }
      if (data.skipped > 0) {
        details.push(`${data.skipped} skipped`)
      }
      if (data.totalFound && data.totalFound > data.photosCount + (data.skipped || 0)) {
        details.push(`${data.totalFound - data.photosCount - (data.skipped || 0)} not processed (limit reached)`)
      }

      setMessage({
        type: 'success',
        text: `${successMessage}\n\n${details.join(' • ')}\n\nRedirecting to your Nest...`,
      })

      // Redirect to nest after 3 seconds
      setTimeout(() => {
        router.push('/nest')
      }, 3000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to upload file',
      })
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header
        userName={session.user?.name || ''}
        isAdmin={isAdmin}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/settings/imports')}
              className="text-firefly-glow hover:text-firefly-bright mb-4 flex items-center gap-2"
            >
              ← Back to Imports
            </button>
            <h1 className="text-4xl font-light text-text-soft mb-2">
              Import <span className="text-firefly-glow">Facebook</span> Memories
            </h1>
            <p className="text-text-muted">
              Upload your Facebook data export to bring your memories into Firefly Grove
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : message.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-6">
            <h2 className="text-xl text-text-soft font-medium mb-4">
              How to download your Facebook data
            </h2>

            {/* Quick Link */}
            <div className="mb-4 p-4 bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg">
              <div className="text-sm text-text-muted mb-2">⚡ Quick Link:</div>
              <a
                href="https://www.facebook.com/dyi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-firefly-glow hover:text-firefly-bright underline font-medium"
              >
                facebook.com/dyi
              </a>
              <div className="text-xs text-text-muted mt-1">
                (Opens Facebook's "Download Your Information" page)
              </div>
            </div>

            <ol className="space-y-3 text-text-muted">
              <li className="flex gap-3">
                <span className="text-firefly-glow font-medium">1.</span>
                <span>
                  Click the link above or go to Facebook Settings → <strong>Your Facebook Information</strong> → <strong>"Download Your Information"</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-firefly-glow font-medium">2.</span>
                <span>
                  Select format: <strong className="text-firefly-glow">JSON</strong> (not HTML)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-firefly-glow font-medium">3.</span>
                <span>
                  Deselect all, then select only: <strong>Photos, Posts, Comments</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-firefly-glow font-medium">4.</span>
                <span>
                  Click <strong>"Create File"</strong> and wait for Facebook to prepare your data (this can take a few minutes to hours depending on how much you have)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-firefly-glow font-medium">5.</span>
                <span>
                  You'll get a notification when it's ready - download the ZIP file
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-firefly-glow font-medium">6.</span>
                <span>
                  Upload the ZIP file here and we'll bring your memories to life!
                </span>
              </li>
            </ol>
          </div>

          {/* Upload Area */}
          <div className="bg-bg-dark border border-border-subtle rounded-lg p-8">
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <input
                type="file"
                id="facebook-file"
                accept=".zip,.json,application/zip,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!file ? (
                <>
                  <label
                    htmlFor="facebook-file"
                    className="cursor-pointer px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft inline-block mb-2"
                  >
                    Choose File
                  </label>
                  <p className="text-sm text-text-muted">
                    Upload your Facebook data export (ZIP or JSON, max 500MB)
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 text-text-soft">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{file.name}</span>
                    <span className="text-text-muted">
                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Uploading...' : 'Start Import'}
                    </button>
                    <label
                      htmlFor="facebook-file"
                      className="cursor-pointer px-6 py-3 bg-bg-elevated hover:bg-border-subtle text-text-muted rounded transition-soft inline-block"
                    >
                      Choose Different File
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* What Happens Next */}
          <div className="mt-8 bg-bg-dark border border-firefly-dim/30 rounded-lg p-6">
            <h3 className="text-lg text-firefly-glow mb-3">What happens after upload?</h3>
            <ul className="space-y-2 text-text-muted text-sm">
              <li className="flex gap-2">
                <span className="text-firefly-glow">1.</span>
                <span>We analyze your photos and extract memories with dates and captions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-firefly-glow">2.</span>
                <span>AI categorizes photos (family moments vs landscapes/memes)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-firefly-glow">3.</span>
                <span>Memories appear in your <strong>Nest</strong> for review</span>
              </li>
              <li className="flex gap-2">
                <span className="text-firefly-glow">4.</span>
                <span>You choose which branch each memory belongs to</span>
              </li>
              <li className="flex gap-2">
                <span className="text-firefly-glow">5.</span>
                <span>Click "Hatch" to add them to your Grove!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

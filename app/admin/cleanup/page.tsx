'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

export default function AdminCleanupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      const admin = (session.user as any)?.isAdmin
      if (!admin) {
        router.push('/grove')
      } else {
        setIsAdmin(admin)
      }
    }
  }, [status, session, router])

  const handleCleanup = async () => {
    if (!confirm('Delete all test memorial branches owned by system user?')) {
      return
    }

    setCleaning(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/cleanup-test-memorials', {
        method: 'DELETE',
      })

      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error('Cleanup error:', error)
      setResult({ error: 'Failed to cleanup test memorials' })
    } finally {
      setCleaning(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || ''} isAdmin={isAdmin} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-light text-text-soft mb-8">
            Admin <span className="text-firefly-glow">Cleanup</span>
          </h1>

          <div className="bg-bg-dark border border-border-subtle rounded-lg p-6">
            <h2 className="text-xl text-text-soft mb-4">Test Memorial Branches</h2>
            <p className="text-text-muted mb-6">
              Clean up test memorial branches (Aunt Martha, etc.) that were created
              during Open Grove testing. This will delete all branches owned by the
              system user with type "memorial".
            </p>

            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-soft disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {cleaning ? 'Cleaning...' : 'Delete Test Memorials'}
            </button>

            {result && (
              <div className={`mt-6 p-4 rounded-lg border ${
                result.error
                  ? 'bg-red-500/10 border-red-500/30 text-error-text'
                  : 'bg-green-500/10 border-green-500/30 text-success-text'
              }`}>
                {result.error ? (
                  <div>
                    <div className="font-medium mb-2">Error</div>
                    <div className="text-sm">{result.error}</div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium mb-2">{result.message}</div>
                    {result.deleted && result.deleted.length > 0 && (
                      <div className="text-sm mt-2">
                        <div className="mb-1">Deleted branches:</div>
                        <ul className="list-disc list-inside">
                          {result.deleted.map((title: string, i: number) => (
                            <li key={i}>{title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.orphanedPersonsDeleted > 0 && (
                      <div className="text-sm mt-2">
                        Also deleted {result.orphanedPersonsDeleted} orphaned person records
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push('/grove')}
              className="text-text-muted hover:text-text-soft transition-soft"
            >
              ← Back to Grove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

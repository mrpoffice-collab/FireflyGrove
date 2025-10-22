'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import MemoryCard from '@/components/MemoryCard'
import MemoryModal from '@/components/MemoryModal'

interface Entry {
  id: string
  text: string
  visibility: string
  mediaUrl: string | null
  audioUrl: string | null
  createdAt: string
  author: {
    name: string
  }
}

interface Branch {
  id: string
  title: string
  description: string | null
  owner: {
    id: string
    name: string
  }
  entries: Entry[]
}

export default function BranchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const branchId = params.branchId as string

  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewMemory, setShowNewMemory] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && branchId) {
      fetchBranch()
    }
  }, [status, branchId])

  const fetchBranch = async () => {
    try {
      const res = await fetch(`/api/branches/${branchId}`)
      if (res.ok) {
        const data = await res.json()
        setBranch(data)
      } else {
        router.push('/grove')
      }
    } catch (error) {
      console.error('Failed to fetch branch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMemory = async (data: {
    text: string
    visibility: string
    legacyFlag: boolean
    mediaUrl?: string
    audioUrl?: string
  }) => {
    try {
      const res = await fetch(`/api/branches/${branchId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        await fetchBranch()
        setShowNewMemory(false)
      }
    } catch (error) {
      console.error('Failed to create memory:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-darker flex items-center justify-center">
        <div className="text-text-muted">Loading branch...</div>
      </div>
    )
  }

  if (!session || !branch) {
    return null
  }

  const prompts = [
    "Describe a small thing that made you laugh today.",
    "What's a smell that brings you back?",
    "Tell me about a time you felt truly seen.",
    "What did they teach you without meaning to?",
    "Capture a quiet moment you don't want to forget.",
  ]

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

  return (
    <div className="min-h-screen bg-bg-darker">
      <Header userName={session.user?.name || ''} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push('/grove')}
            className="text-text-muted hover:text-text-soft text-sm mb-6 transition-soft"
          >
            ← Back to Grove
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-light text-text-soft mb-2">
              {branch.title}
            </h1>
            {branch.description && (
              <p className="text-text-muted">{branch.description}</p>
            )}
          </div>

          <div className="bg-bg-dark border border-firefly-dim/30 rounded-lg p-6 mb-8">
            <p className="text-text-muted text-sm italic mb-4">
              "{randomPrompt}"
            </p>
            <button
              onClick={() => setShowNewMemory(true)}
              className="w-full py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded font-medium transition-soft"
            >
              Add Memory
            </button>
          </div>

          <div className="space-y-6">
            {branch.entries.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                No memories yet. Add your first one above.
              </div>
            ) : (
              branch.entries.map((entry) => (
                <MemoryCard key={entry.id} entry={entry} />
              ))
            )}
          </div>
        </div>
      </div>

      {showNewMemory && (
        <MemoryModal
          onClose={() => setShowNewMemory(false)}
          onSave={handleCreateMemory}
          prompt={randomPrompt}
        />
      )}
    </div>
  )
}

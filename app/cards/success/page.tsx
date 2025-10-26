'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import CardSuccessContent from '@/components/CardSuccessContent'

export default function CardSuccessPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen">
      {session && <Header userName={session.user?.name || ''} />}

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-text-muted">Loading...</div>
        </div>
      }>
        <CardSuccessContent />
      </Suspense>
    </div>
  )
}

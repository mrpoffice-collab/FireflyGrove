'use client'

import { SessionProvider } from 'next-auth/react'
import AdminActivityNotifications from '@/components/AdminActivityNotifications'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/lib/toast'
import { NetworkStatus } from '@/components/NetworkStatus'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SessionProvider
          refetchInterval={5 * 60} // Refetch session every 5 minutes
          refetchOnWindowFocus={true} // Refetch when user focuses window
        >
          <NetworkStatus />
          {children}
          <AdminActivityNotifications />
        </SessionProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

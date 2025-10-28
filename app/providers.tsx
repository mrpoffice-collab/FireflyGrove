'use client'

import { SessionProvider } from 'next-auth/react'
import AdminActivityNotifications from '@/components/AdminActivityNotifications'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when user focuses window
    >
      {children}
      <AdminActivityNotifications />
    </SessionProvider>
  )
}

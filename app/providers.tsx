'use client'

import { SessionProvider } from 'next-auth/react'
import AdminActivityNotifications from '@/components/AdminActivityNotifications'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <AdminActivityNotifications />
    </SessionProvider>
  )
}

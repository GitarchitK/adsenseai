'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'auth' | 'unauth'>('loading')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStatus('auth')
      } else {
        setStatus('unauth')
        router.replace('/auth/login')
      }
    })
    return () => unsub()
  }, [router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden mx-auto shadow-lg shadow-primary/25">
            <img src="/icon.svg" alt="AdSenseAI" className="w-full h-full object-cover" />
          </div>
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauth') return null

  return <>{children}</>
}

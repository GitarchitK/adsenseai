'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function LandingCTA({ size = 'lg' }: { size?: 'lg' | 'xl' }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })
    return () => unsub()
  }, [])

  // Avoid hydration mismatch — render nothing until mounted
  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`rounded-xl bg-primary/20 animate-pulse ${size === 'xl' ? 'h-14 w-56' : 'h-12 w-48'}`} />
        <div className={`rounded-xl bg-muted animate-pulse ${size === 'xl' ? 'h-14 w-36' : 'h-12 w-32'}`} />
      </div>
    )
  }

  const btnCls = size === 'xl'
    ? 'h-14 px-10 text-base gap-2.5 bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border-0 transition-all'
    : 'h-12 px-8 text-base gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 transition-all'

  if (isLoggedIn) {
    return (
      <Link href="/dashboard">
        <Button className={btnCls}>
          <LayoutDashboard className="h-5 w-5" /> Go to Dashboard
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link href="/auth/signup">
        <Button className={btnCls}>
          Analyze My Site Free <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link href="/auth/login">
        <Button variant="outline" size="lg" className={size === 'xl' ? 'h-14 px-10 text-base' : 'h-12 px-8 text-base'}>
          Sign In
        </Button>
      </Link>
    </div>
  )
}

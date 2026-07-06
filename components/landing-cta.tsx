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
      <section className="py-24 relative overflow-hidden flex justify-center border-t border-border/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className={`rounded-xl bg-primary/20 animate-pulse h-14 w-56`} />
          <div className={`rounded-xl bg-muted animate-pulse h-14 w-36`} />
        </div>
      </section>
    )
  }

  const btnCls = 'h-16 px-10 text-lg gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_oklch(var(--primary)/0.3)] hover:shadow-[0_0_40px_oklch(var(--primary)/0.5)] border-0 transition-all rounded-2xl font-bold'

  return (
    <section className="py-24 relative overflow-hidden border-t border-border/50">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container relative z-10 px-4 mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground">Ready to Get Approved?</h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join thousands of successful publishers who used our AI to fix their websites and get Google AdSense approval.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button className={btnCls}>
                <LayoutDashboard className="h-5 w-5" /> Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signup">
                <Button className={btnCls}>
                  Analyze My Site Free <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="h-16 px-10 text-lg rounded-2xl bg-background/50 backdrop-blur-sm border-border hover:bg-muted">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

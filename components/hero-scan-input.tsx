'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Globe, Shield, ArrowRight } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function HeroScanInput() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })
    return () => unsub()
  }, [])

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setIsLoading(true)
    const encodedUrl = encodeURIComponent(url.startsWith('http') ? url : `https://${url}`)
    if (isLoggedIn) {
      router.push(`/dashboard?scan=${encodedUrl}`)
    } else {
      router.push(`/auth/login?returnUrl=${encodedUrl}`)
    }
  }

  return (
    <form onSubmit={handleScan} className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
      <div className="relative flex flex-col sm:flex-row gap-3 bg-card/50 backdrop-blur-xl p-2 rounded-2xl border border-border/60 shadow-2xl">
        <div className="relative flex-1">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Enter your website URL (e.g. yoursite.com)"
            className="h-14 pl-12 bg-transparent border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/60"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
        >
          {isLoading ? (
            <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          ) : (
            <>Analyze Free <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1.5 font-medium">
        <Shield className="h-3 w-3" /> No credit card required · Instant 30-second audit
      </p>
    </form>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Globe, Shield, ArrowRight, ScanLine } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function HeroScanInput() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
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
    router.push(`/dashboard?scan=${encodedUrl}`)
  }

  return (
    <form onSubmit={handleScan} className="relative group w-full">
      <div className={`absolute -inset-1.5 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500 rounded-3xl blur opacity-30 transition-all duration-700 ${isFocused ? 'opacity-70 scale-105' : 'group-hover:opacity-50 group-hover:scale-100'}`} />
      
      <div className="relative flex flex-col sm:flex-row gap-3 bg-card/80 dark:bg-black/60 backdrop-blur-2xl p-3 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl">
        <div className="relative flex-1 flex items-center">
          <div className={`absolute left-5 flex items-center justify-center transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`}>
            <Globe className="h-6 w-6" />
          </div>
          <Input
            type="text"
            placeholder="Enter your website URL (e.g. yoursite.com)"
            className="h-16 pl-14 bg-transparent border-0 focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60 w-full"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg gap-3 shadow-[0_0_30px_oklch(var(--primary)/0.3)] hover:shadow-[0_0_40px_oklch(var(--primary)/0.5)] transition-all active:scale-95 whitespace-nowrap border-0 overflow-hidden relative"
        >
          {isLoading ? (
            <div className="h-6 w-6 rounded-full border-3 border-white/20 border-t-white animate-spin" />
          ) : (
            <>
              <ScanLine className="h-5 w-5" />
              <span>Run Deep Scan</span>
              <ArrowRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
      
      <p className="mt-4 text-xs text-muted-foreground/80 text-center flex items-center justify-center gap-2 font-medium">
        <Shield className="h-4 w-4 text-emerald-500" /> Enterprise-grade scan. No credit card required.
      </p>
    </form>
  )
}

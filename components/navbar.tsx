'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LayoutDashboard, LogOut, User } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { signOut } from '@/lib/auth'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })

    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      unsub()
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
            <img src="/icon.svg" alt="AdSenseAI" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-foreground text-[15px]">
            <span className="md:hidden">AdSense <span className="text-primary">Checker</span></span>
            <span className="hidden md:inline">AdSense Approval <span className="text-primary">Checker AI</span></span>
          </span>
        </Link>

        {/* Nav links — desktop only */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60">
            Pricing
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {mounted && (
            <>
              {isLoggedIn ? (
                <>
                  {/* Desktop */}
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium hidden md:inline-flex">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-sm font-medium hidden md:inline-flex"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                  {/* Mobile — dashboard icon */}
                  <Link href="/dashboard" className="md:hidden">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium h-8 px-3">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Desktop */}
                  <Link href="/auth/login" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-sm font-medium">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup" className="hidden md:block">
                    <Button size="sm" className="text-sm font-medium shadow-sm">
                      Get Started Free
                    </Button>
                  </Link>
                  {/* Mobile — login button */}
                  <Link href="/auth/login" className="md:hidden">
                    <Button size="sm" className="gap-1.5 text-xs font-bold h-8 px-3 rounded-lg shadow-sm">
                      <User className="h-3.5 w-3.5" />
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-xl"
          >
            {mounted && (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

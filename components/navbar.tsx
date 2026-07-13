'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LayoutDashboard, LogOut, User, Menu, X } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { signOut } from '@/lib/auth'
import { useProfile } from '@/hooks/use-profile'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { profile } = useProfile()

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
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-background/70 backdrop-blur-2xl border-b border-border/50 shadow-sm'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
            <img src="/icon.svg" alt="AdSense Checker AI" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-[15px]">
            <span className="md:hidden">AdSense <span className="text-primary">Intelligence</span></span>
            <span className="hidden md:inline">AdSense <span className="text-primary">Intelligence</span></span>
          </span>
        </Link>

        {/* Nav links — desktop only */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60">
            Features
          </Link>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60">
            Blog
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {mounted && (
            <>
              {/* Desktop */}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium hidden md:inline-flex">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              {/* Mobile */}
              <Link href="/dashboard" className="md:hidden">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium h-8 px-3">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
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

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-xl ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-6 py-4 space-y-4 shadow-lg absolute w-full left-0 top-full">
          <Link 
            href="/#features" 
            className="block text-sm font-medium text-foreground hover:text-violet-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link 
            href="/blog" 
            className="block text-sm font-medium text-foreground hover:text-violet-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Blog
          </Link>
          
        </div>
      )}
    </nav>
  )
}

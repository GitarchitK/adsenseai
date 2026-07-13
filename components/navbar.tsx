'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Home,
  LayoutDashboard,
  Terminal,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Sun,
  Moon
} from 'lucide-react'

const TOP_BAR_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' }
]

const SOCIAL_LINKS = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' }
]

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home, exact: true, dot: true },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Developer Tools', href: '/dashboard/tools', icon: Terminal },
  { label: 'Audit Guide', href: '/blog/adsense-low-value-content-fix', icon: BookOpen },
  { label: 'Readiness Checker', href: '/dashboard', icon: ShieldCheck },
  { label: 'Blog & News', href: '/blog', icon: TrendingUp }
]

const TICKER_ITEMS = [
  { title: 'Google AdSense Approval Requirements: 2026 Complete Blueprint', href: '/blog/adsense-approval-requirements' },
  { title: "How to Fix 'Low Value Content' Rejection (Step-by-Step Guide)", href: '/blog/adsense-low-value-content-fix' },
  { title: 'Top 10 High CPC Niches for Google AdSense in 2026', href: '/blog/adsense-high-cpc-niches-2026' },
  { title: 'Thin Content Guide: What It Is and How to Fix It for Approval', href: '/blog/thin-content-guide' },
  { title: "Does Google AdSense Allow AI-Generated Content? (Google's Stance)", href: '/blog/does-google-adsense-allow-ai-content' }
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [tickerIndex, setTickerIndex] = useState(0)
  const [fade, setFade] = useState(true)

  // Auto-scroll header effect
  useEffect(() => {
    setMounted(true)
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-rotate ticker items
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextTicker()
    }, 5500)
    return () => clearInterval(interval)
  }, [])

  const handlePrevTicker = useCallback(() => {
    setFade(false)
    setTimeout(() => {
      setTickerIndex(prev => (prev - 1 + TICKER_ITEMS.length) % TICKER_ITEMS.length)
      setFade(true)
    }, 200)
  }, [])

  const handleNextTicker = useCallback(() => {
    setFade(false)
    setTimeout(() => {
      setTickerIndex(prev => (prev + 1) % TICKER_ITEMS.length)
      setFade(true)
    }, 200)
  }, [])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-background transition-all duration-300">
      {/* 1. TOP BAR */}
      <div
        className={`bg-slate-50 dark:bg-zinc-950 border-b border-border/40 transition-all duration-300 overflow-hidden ${
          scrolled ? 'h-0 opacity-0 border-b-0' : 'h-9 opacity-100'
        }`}
      >
        <div className="container mx-auto h-full flex items-center justify-between px-6">
          {/* Top Bar Left links */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
            {TOP_BAR_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Top Bar Right socials */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={label}
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="bg-background/95 dark:bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm transition-all duration-300">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              className="w-6 h-6 text-red-500 animate-pulse flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-black text-[18px] tracking-tight flex items-center">
              <span className="text-foreground">AdSense</span>
              <span className="ml-1.5 bg-red-600 text-white text-[11px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                INFO
              </span>
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {NAV_ITEMS.map(item => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold tracking-tight transition-all duration-200 ${
                    active
                      ? 'text-red-500 hover:text-red-600 bg-red-500/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.dot && active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                  )}
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Action Icons & Dark Mode Switch */}
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted"
              title="Search"
            >
              <Search className="h-4 w-4 text-foreground/80" />
            </Button>

            {/* Custom Premium Sliding Theme Switch */}
            <button
              onClick={() => mounted && setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative flex items-center h-7 w-[52px] rounded-full bg-slate-200 dark:bg-zinc-800 p-1 cursor-pointer transition-colors duration-300 focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              title="Toggle Theme"
              disabled={!mounted}
            >
              <div className="flex justify-between w-full px-0.5 text-muted-foreground select-none pointer-events-none">
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-950 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  mounted && theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {mounted && theme === 'dark' ? (
                  <Moon className="h-3 w-3 text-indigo-400" />
                ) : (
                  <Sun className="h-3 w-3 text-amber-500" />
                )}
              </div>
            </button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-xl hover:bg-muted"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC TICKER BAR */}
      <div
        className={`bg-blue-50/30 dark:bg-zinc-950 border-b border-border/30 transition-all duration-300 overflow-hidden ${
          scrolled ? 'h-0 opacity-0 border-b-0' : 'h-11 opacity-100'
        }`}
      >
        <div className="container mx-auto h-full flex items-center justify-between px-6 min-w-0">
          {/* Ticker Banner Left */}
          <div className="flex items-center gap-3 overflow-hidden flex-1 mr-4 min-w-0">
            <span className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black px-2.5 py-1 rounded tracking-wider uppercase">
              Interesting:
            </span>
            <Link
              href={TICKER_ITEMS[tickerIndex].href}
              className={`text-xs md:text-sm font-bold tracking-tight text-foreground/80 hover:text-red-500 truncate flex-1 min-w-0 transition-all duration-300 ${
                fade ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              {TICKER_ITEMS[tickerIndex].title}
            </Link>
          </div>

          {/* Ticker Controls Right */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handlePrevTicker}
              className="p-1 rounded bg-background hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Previous Article"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleNextTicker}
              className="p-1 rounded bg-background hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Next Article"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER PANEL */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3 shadow-lg absolute w-full left-0 top-full max-h-[80vh] overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 text-sm font-bold p-2.5 rounded-lg transition-colors ${
                isActive(item.href, item.exact)
                  ? 'text-red-500 bg-red-500/5'
                  : 'text-foreground/80 hover:text-foreground hover:bg-muted'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

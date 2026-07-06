'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Settings, LogOut, History,
  Crown, Menu, X, FilePenLine,
} from 'lucide-react'
import { signOut } from '@/lib/auth'
import { useProfile } from '@/hooks/use-profile'
import { useState } from 'react'

import { LucideIcon } from 'lucide-react'

const navItems: { name: string, href: string, icon: LucideIcon, badge?: string }[] = [
  { name: 'Dashboard',        href: '/dashboard',                   icon: LayoutDashboard },
  { name: 'My Scans',         href: '/dashboard/scans',             icon: History         },
  { name: 'Article Studio',   href: '/dashboard/article-studio',    icon: FilePenLine     },
  { name: 'Settings',         href: '/dashboard/settings',          icon: Settings        },
]

// No pro nav items — all tools removed
const proNavItems: never[] = []

// ── Shared sidebar content ────────────────────────────────────────────────────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { profile } = useProfile()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const initial = (profile?.fullName?.[0] ?? profile?.email?.[0] ?? '?').toUpperCase()

  // Active check for nav items
  const isNavActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden flex-shrink-0">
            <img src="/icon.svg" alt="AdSense Checker AI" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-sidebar-foreground text-[14px] leading-tight">
            AdSense <span className="text-primary">Checker AI</span>
          </span>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Main</p>
        {navItems.map(({ name, href, icon: Icon, badge }) => (
          <Link key={href} href={href} onClick={onClose} className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
            isNavActive(href)
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            {name}
            {badge && (
              <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-violet-500 text-white uppercase tracking-widest">
                {badge}
              </span>
            )}
          </Link>
        ))}

        {/* AI Tools section removed */}

      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary text-primary-foreground text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {profile?.fullName ?? profile?.email ?? '...'}
            </p>
          </div>
          <div
            onClick={handleLogout}
            className="cursor-pointer p-1 rounded-lg hover:bg-muted transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ md) ── */}
      <aside className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* ── Mobile: hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex md:hidden items-center justify-center h-10 w-10 rounded-xl bg-background border border-border shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* ── Mobile: backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 flex flex-col bg-sidebar border-r border-sidebar-border md:hidden',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}

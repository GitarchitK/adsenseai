'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Settings, LogOut, History,
  Menu, X, FilePenLine, SearchCode, Wrench,
  Target, ChevronDown, ChevronRight,
  Scan, FileSearch, Shield, Globe, Image,
  PenLine, Tag, TrendingUp, Code2, ScrollText,
  Zap, Crown,
} from 'lucide-react'
import { signOut } from '@/lib/auth'
import { useProfile } from '@/hooks/use-profile'
import { useState } from 'react'
import { LucideIcon } from 'lucide-react'

type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  badge?: string
  exact?: boolean
}

type NavSection = {
  label: string
  items: NavItem[]
  collapsible?: boolean
}

const MAIN_NAV: NavSection = {
  label: 'MAIN',
  items: [
    { name: 'Dashboard',    href: '/dashboard',       icon: LayoutDashboard, exact: true },
    { name: 'My Scans',     href: '/dashboard/scans', icon: History },
  ],
}

const ADSENSE_NAV: NavSection = {
  label: 'ADSENSE TOOLS',
  items: [
    { name: 'Article Analyzer',  href: '/dashboard/articles',       icon: FileSearch, badge: 'Free' },
    { name: 'Article Studio',    href: '/dashboard/article-studio', icon: FilePenLine },
    { name: 'My Plan',           href: '/dashboard/plan',           icon: Target },
  ],
}

const TOOLS_NAV: NavSection = {
  label: 'TOOLS (40+)',
  collapsible: true,
  items: [
    { name: 'All Tools',         href: '/dashboard/tools',                    icon: Wrench,    badge: '40+' },
    { name: 'Content Writing',   href: '/dashboard/tools?cat=content',        icon: PenLine },
    { name: 'SEO Tools',         href: '/dashboard/tools?cat=seo',            icon: TrendingUp },
    { name: 'Developer Tools',   href: '/dashboard/tools?cat=technical',      icon: Code2 },
    { name: 'Legal & Policy',    href: '/dashboard/tools?cat=legal',          icon: ScrollText },
    { name: 'Media & Images',    href: '/dashboard/tools?cat=media',          icon: Image },
  ],
}

const ACCOUNT_NAV: NavSection = {
  label: 'ACCOUNT',
  items: [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
}

function SidebarLink({ item, isActive, onClick }: {
  item: NavItem; isActive: boolean; onClick?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150',
        isActive
          ? 'bg-primary/15 text-primary border border-primary/20'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{item.name}</span>
      {item.badge && (
        <span className={cn(
          'ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0',
          item.badge === 'Free' ? 'bg-emerald-500/15 text-emerald-400' :
          item.badge === '40+' ? 'bg-violet-500/15 text-violet-400' :
          'bg-primary/15 text-primary'
        )}>
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, isPro } = useProfile()
  const [toolsOpen, setToolsOpen] = useState(true)

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const isActive = (item: NavItem) => {
    if (item.href.includes('?')) {
      // For query-param links, just check pathname
      return pathname === item.href.split('?')[0] && typeof window !== 'undefined'
        && window.location.search.includes(item.href.split('?')[1] ?? '')
    }
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const initial = (profile?.fullName?.[0] ?? profile?.email?.[0] ?? '?').toUpperCase()

  const renderSection = (section: NavSection) => (
    <div key={section.label} className="mb-1">
      {section.collapsible ? (
        <button
          onClick={() => setToolsOpen(o => !o)}
          className="flex items-center justify-between w-full px-3 py-1.5 mb-0.5 group"
        >
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
            {section.label}
          </p>
          {toolsOpen
            ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
            : <ChevronRight className="h-3 w-3 text-muted-foreground" />
          }
        </button>
      ) : (
        <p className="px-3 py-1.5 mb-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {section.label}
        </p>
      )}
      {(!section.collapsible || toolsOpen) && (
        <div className="space-y-0.5">
          {section.items.map(item => (
            <SidebarLink
              key={item.href + item.name}
              item={item}
              isActive={isActive(item)}
              onClick={onClose}
            />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-[60px] border-b border-sidebar-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            <img src="/icon.svg" alt="AdSense Checker AI" className="w-full h-full object-cover" width="32" height="32" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sidebar-foreground text-[13px]">
              AdSense <span className="text-primary">Intelligence</span>
            </p>
            <p className="text-[10px] text-muted-foreground">40+ Free Tools</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
        {renderSection(MAIN_NAV)}
        <div className="border-t border-sidebar-border/50" />
        {renderSection(ADSENSE_NAV)}
        <div className="border-t border-sidebar-border/50" />
        {renderSection(TOOLS_NAV)}
        <div className="border-t border-sidebar-border/50" />
        {renderSection(ACCOUNT_NAV)}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3 flex-shrink-0">
        {/* Free badge */}
        <div className="mb-2 px-1">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Zap className="h-3 w-3 text-emerald-400 flex-shrink-0" />
            <p className="text-[11px] font-semibold text-emerald-400">All tools free — no limits</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-sidebar-accent transition-colors group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary text-primary-foreground text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-sidebar-foreground truncate">
              {profile?.fullName ?? 'Guest User'}
            </p>
            <p className="text-[10px] text-muted-foreground">Free Plan</p>
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
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-[240px] flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex md:hidden items-center justify-center h-10 w-10 rounded-xl bg-background border border-border shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-screen w-[260px] flex flex-col bg-sidebar border-r border-sidebar-border md:hidden',
        'transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Settings, LogOut, History, Sparkles,
  Crown, BookOpen, FileText, PenLine, Search, BarChart3,
  ShieldCheck, Menu, X,
} from 'lucide-react'
import { signOut } from '@/lib/auth'
import { useProfile } from '@/hooks/use-profile'
import { UpgradeModal } from './upgrade-modal'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard',  href: '/dashboard',          icon: LayoutDashboard },
  { name: 'My Scans',   href: '/dashboard/scans',    icon: History         },
  { name: 'Settings',   href: '/dashboard/settings', icon: Settings        },
]

// Thumbnail Maker and Article Studio removed
const proNavItems = [
  { name: 'Article Analyzer',  href: '/dashboard/articles',        icon: BookOpen   },
  { name: 'Privacy Policy',    href: '/dashboard/privacy-policy',  icon: FileText   },
  { name: 'Content Rewriter',  href: '/dashboard/rewrite',         icon: PenLine    },
  { name: 'SEO Suggestions',   href: '/dashboard/seo',             icon: Search     },
  { name: 'Meta Generator',    href: '/dashboard/meta',            icon: FileText   },
  { name: 'Title Generator',   href: '/dashboard/titles',          icon: Sparkles   },
  { name: 'Keyword Density',   href: '/dashboard/keyword-density', icon: BarChart3  },
  { name: 'Policy Checker',    href: '/dashboard/policy',          icon: ShieldCheck},
]

// ── Shared sidebar content ────────────────────────────────────────────────────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { isPro, usage, profile } = useProfile()
  const [modalOpen, setModalOpen]     = useState(false)
  const [modalFeature, setModalFeature] = useState('')

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const openUpgrade = (feature: string) => {
    setModalFeature(feature)
    setModalOpen(true)
  }

  const initial = (profile?.fullName?.[0] ?? profile?.email?.[0] ?? '?').toUpperCase()

  const linkCls = (href: string) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
      (pathname === href || (href !== '/dashboard' && pathname.startsWith(href)))
        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    )

  return (
    <>
      <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} feature={modalFeature} />

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
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link key={href} href={href} onClick={onClose} className={linkCls(href)}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            {name}
          </Link>
        ))}

        {/* AI Tools */}
        <div className="pt-5">
          <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">AI Tools</p>
          {isPro ? (
            proNavItems.map(({ name, href, icon: Icon }) => (
              <Link key={href} href={href} onClick={onClose} className={linkCls(href)}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                {name}
              </Link>
            ))
          ) : (
            proNavItems.map(({ name, href, icon: Icon }) => (
              <button
                key={href}
                onClick={() => openUpgrade(name)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition-all group"
              >
                <Icon className="h-4 w-4 flex-shrink-0 opacity-40 group-hover:opacity-60" />
                <span className="opacity-40 group-hover:opacity-60">{name}</span>
                <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">PRO</span>
              </button>
            ))
          )}
        </div>

        {/* Usage pill */}
        {!isPro && usage && (
          <div className="mt-5 mx-1 rounded-xl border border-border/60 bg-muted/40 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">Monthly Scans</p>
              <p className="text-xs font-mono text-muted-foreground">{usage.scans_this_month} / {usage.scans_limit ?? 1}</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${usage.scans_limit ? Math.min((usage.scans_this_month / usage.scans_limit) * 100, 100) : 0}%` }}
              />
            </div>
            <button
              onClick={() => openUpgrade('Scan Limits')}
              className="mt-2.5 w-full text-xs font-semibold text-primary hover:underline text-left flex items-center gap-1"
            >
              <Crown className="h-3 w-3" /> Upgrade to Pro
            </button>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3 flex-shrink-0">
        <button
          onClick={() => !isPro && openUpgrade('Pro Account')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-accent transition-colors group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary text-primary-foreground text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {profile?.fullName ?? profile?.email ?? '...'}
            </p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              {isPro ? <><Crown className="h-2.5 w-2.5 text-amber-500" /> Pro</> : 'Free Plan'}
            </p>
          </div>
          <div
            onClick={(e) => { e.stopPropagation(); handleLogout() }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-muted"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </button>
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

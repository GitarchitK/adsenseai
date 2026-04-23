'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Settings, LogOut, History, Sparkles, Crown, Zap, BookOpen } from 'lucide-react'
import { signOut } from '@/lib/auth'
import { useProfile } from '@/hooks/use-profile'
import { UpgradeModal } from './upgrade-modal'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Scans', href: '/dashboard/scans', icon: History },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const proNavItems = [
  { name: 'AI Tools', href: '/dashboard/ai-tools', icon: Sparkles },
  { name: 'Article Analyzer', href: '/dashboard/articles', icon: BookOpen },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isPro, usage, profile } = useProfile()
  const [modalOpen, setModalOpen] = useState(false)
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

  return (
    <>
      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        feature={modalFeature}
      />

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 md:flex flex-col bg-sidebar border-r border-sidebar-border">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden flex-shrink-0">
          <img src="/icon.svg" alt="AdSenseAI" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-sidebar-foreground text-[15px]">
          AdSense Approval <span className="text-primary">Checker AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Main
        </p>
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {name}
            </Link>
          )
        })}

        {/* AI Tools section */}
        <div className="pt-5">
          <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            AI Tools
          </p>
          {isPro ? (
            proNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            ))
          ) : (
            <>
              {proNavItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => openUpgrade(item.name)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition-all group"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0 opacity-40 group-hover:opacity-60" />
                  <span className="opacity-40 group-hover:opacity-60">{item.name}</span>
                  <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Usage pill */}
        {!isPro && usage && (
          <div className="mt-5 mx-1 rounded-xl border border-border/60 bg-muted/40 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">Monthly Scans</p>
              <p className="text-xs font-mono text-muted-foreground">
                {usage.scans_this_month} / {usage.scans_limit ?? 1}
              </p>
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
    </aside>
  </>
)
}

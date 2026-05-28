'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { PromoAdBanner } from '@/components/promo-ad-banner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      {/* md: offset for sidebar; mobile: top padding for hamburger button */}
      <main className="md:pl-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6 pb-0">
          <PromoAdBanner />
        </div>
        {children}
      </main>
    </div>
  )
}

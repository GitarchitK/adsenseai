import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { AuthGuard } from '@/components/auth-guard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar />
        <div className="flex-1 md:ml-64 min-w-0">
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}

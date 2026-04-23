import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — AdSense Approval Checker AI',
  description: 'Sign in to your AdSense Approval Checker AI account.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up Free — AdSense Approval Checker AI',
  description: 'Create a free account to check your website\'s AdSense approval readiness.',
  robots: { index: false, follow: false },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

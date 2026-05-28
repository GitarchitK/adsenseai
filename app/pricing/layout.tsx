import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — AdSense Approval Checker AI | Free & Pro Plans',
  description: 'Free AdSense approval checker with unlimited scans. Fix your site step by step with our AI coaching roadmap.',
  keywords: ['adsense approval checker pricing', 'adsense audit tool price', 'free adsense checker'],
  alternates: { canonical: 'https://www.adsensechecker.in/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

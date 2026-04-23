import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — AdSense Approval Checker AI | Free & Pro Plans',
  description: 'Free AdSense approval checker with 5 scans/month. Unlock full AI report for ₹19 or go Pro for ₹199/month with 200 scans, article analyzer, and all AI tools.',
  keywords: ['adsense approval checker pricing', 'adsense audit tool price', 'free adsense checker'],
  alternates: { canonical: 'https://adsensechecker.in/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

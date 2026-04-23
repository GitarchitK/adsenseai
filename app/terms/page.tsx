import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — AdSense Approval Checker AI',
  description: 'Terms of Service for AdSense Approval Checker AI. Read our terms before using our free AdSense approval checker and website audit tool.',
  alternates: { canonical: 'https://adsenseai.in/terms' },
  robots: { index: false },
}

export default function TermsPage() {
  const updated = 'January 1, 2025'
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
        </div>

        <div className="space-y-8 text-foreground">
          {[
            {
              title: '1. Acceptance of Terms',
              content: 'By accessing or using AdSenseAI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.',
            },
            {
              title: '2. Description of Service',
              content: 'AdSenseAI provides AI-powered website analysis to help publishers prepare their sites for Google AdSense monetization. We analyze publicly accessible website content and provide scores, recommendations, and reports.',
            },
            {
              title: '3. User Accounts',
              content: 'You must sign in with a Google account to use the Service. You are responsible for maintaining the security of your account. You must not share your account with others.',
            },
            {
              title: '4. Acceptable Use',
              content: `You agree not to:
• Submit URLs of websites you do not own or have permission to analyze
• Attempt to circumvent rate limits or access restrictions
• Use the Service to analyze illegal or harmful content
• Reverse engineer or scrape the Service
• Use automated tools to submit bulk scan requests`,
            },
            {
              title: '5. Payments & Refunds',
              content: `Free plan: No payment required for 1 scan.
Report Unlock (₹19): One-time payment to unlock the AI report for a specific scan. Non-refundable once the report is generated.
Pro Plan (₹199/month): Monthly subscription. You may cancel at any time. No refunds for partial months. Cancellation takes effect at the end of the current billing period.`,
            },
            {
              title: '6. Disclaimer of Warranties',
              content: 'AdSenseAI provides analysis based on publicly available information and AI models. We do not guarantee AdSense approval. Google\'s approval decisions are made solely by Google and are subject to their policies, which may change at any time.',
            },
            {
              title: '7. Limitation of Liability',
              content: 'To the maximum extent permitted by law, AdSenseAI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to AdSense rejection or loss of revenue.',
            },
            {
              title: '8. Intellectual Property',
              content: 'The AdSenseAI platform, including its AI models, scoring algorithms, and interface, is our intellectual property. You retain ownership of your website content.',
            },
            {
              title: '9. Termination',
              content: 'We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time from the Settings page.',
            },
            {
              title: '10. Governing Law',
              content: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.',
            },
            {
              title: '11. Contact',
              content: 'For questions about these Terms, contact us at: legal@adsenseai.in',
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

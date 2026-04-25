import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — AdSense Checker AI',
  description: 'Privacy Policy for AdSense Checker AI (adsensechecker.in). Learn how we collect, use, and protect your data when you use our free AdSense approval checker tool.',
  alternates: { canonical: 'https://www.adsensechecker.in/privacy' },
}

export default function PrivacyPage() {
  const updated = 'April 24, 2025'
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
          <p className="text-sm text-muted-foreground mt-2">This Privacy Policy applies to <strong>AdSense Checker AI</strong> operated at <strong>www.adsensechecker.in</strong> by Navroll Studio.</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          {[
            {
              title: '1. Information We Collect',
              content: `When you use AdSense Checker AI, we collect:
• Account information: Your name and email address when you sign in with Google.
• Usage data: URLs you submit for analysis, scan results, and usage statistics.
• Payment information: Payment confirmations processed through Razorpay. We do not store card details.
• Technical data: IP address, browser type, and device information for security and rate limiting.`,
            },
            {
              title: '2. How We Use Your Information',
              content: `We use your information to:
• Provide and improve the AdSense Checker AI service
• Process payments and manage your subscription
• Send transactional emails (welcome emails, scan results, payment confirmations)
• Prevent abuse and enforce rate limits
• Analyze usage patterns to improve our AI models`,
            },
            {
              title: '3. Cookies & Tracking',
              content: `We use the following cookies and tracking technologies:
• Session cookies (firebase-session) to maintain your login state
• Vercel Analytics for anonymous usage statistics
• Google AdSense cookies: This website uses Google AdSense, a web advertising service provided by Google LLC. Google AdSense uses cookies to serve ads based on your prior visits to this website or other websites. You may opt out of personalized advertising by visiting Google's Ads Settings at https://www.google.com/settings/ads`,
            },
            {
              title: '4. Google AdSense & Third-Party Advertising',
              content: `This website uses Google AdSense to display advertisements. Google AdSense is a service provided by Google LLC ("Google").

Google uses cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this website and other websites on the internet. These cookies allow Google and its partners to serve ads based on your visit to our site and/or other sites on the internet.

You may opt out of personalized advertising by:
• Visiting Google's Ads Settings: https://www.google.com/settings/ads
• Visiting the Network Advertising Initiative opt-out page: http://www.networkadvertising.org/managing/opt_out.asp

Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the internet.`,
            },
            {
              title: '5. Data Sharing',
              content: `We do not sell your personal data. We share data only with:
• Firebase (Google) — authentication and database storage
• Razorpay — payment processing
• OpenAI — AI analysis of website content (anonymized, no personal data)
• Vercel — hosting and analytics
• Google AdSense — advertising (see Section 4)`,
            },
            {
              title: '6. Data Retention',
              content: `We retain your account data for as long as your account is active. Scan results are stored indefinitely so you can access your history. You may request deletion of your data at any time by contacting support@adsensechecker.in.`,
            },
            {
              title: '7. Your Rights',
              content: `You have the right to:
• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your account and data
• Export your scan history
• Opt out of personalized advertising (see Section 4)
Contact us at support@adsensechecker.in to exercise these rights.`,
            },
            {
              title: '8. Children\'s Privacy',
              content: `AdSense Checker AI is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately at privacy@adsensechecker.in.`,
            },
            {
              title: '9. Security',
              content: `We use industry-standard security measures including HTTPS encryption, Firebase security rules, and Razorpay's PCI-DSS compliant payment processing. However, no system is 100% secure.`,
            },
            {
              title: '10. Changes to This Policy',
              content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our website. The "Last updated" date at the top of this page indicates when this policy was last revised.`,
            },
            {
              title: '11. Contact Us',
              content: `For privacy-related questions or to exercise your rights, contact us at:
Email: privacy@adsensechecker.in
Website: www.adsensechecker.in/contact
Company: Navroll Studio`,
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

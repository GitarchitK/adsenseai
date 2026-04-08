import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'

export default function PrivacyPage() {
  const updated = 'January 1, 2025'
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          {[
            {
              title: '1. Information We Collect',
              content: `When you use AdSenseAI, we collect:
• Account information: Your name and email address when you sign in with Google.
• Usage data: URLs you submit for analysis, scan results, and usage statistics.
• Payment information: Payment confirmations processed through Razorpay. We do not store card details.
• Technical data: IP address, browser type, and device information for security and rate limiting.`,
            },
            {
              title: '2. How We Use Your Information',
              content: `We use your information to:
• Provide and improve the AdSenseAI service
• Process payments and manage your subscription
• Send transactional emails (scan results, payment confirmations)
• Prevent abuse and enforce rate limits
• Analyze usage patterns to improve our AI models`,
            },
            {
              title: '3. Cookies & Tracking',
              content: `We use a session cookie (firebase-session) to maintain your login state. We use Vercel Analytics for anonymous usage statistics. We do not use third-party advertising cookies.`,
            },
            {
              title: '4. Google AdSense & Advertising',
              content: `AdSenseAI does not currently display Google AdSense ads. If we add advertising in the future, we will update this policy. Our service analyzes your site for AdSense readiness but does not place ads on your behalf.`,
            },
            {
              title: '5. Data Sharing',
              content: `We do not sell your personal data. We share data only with:
• Firebase (Google) — authentication and database storage
• Razorpay — payment processing
• OpenAI — AI analysis of website content (anonymized)
• Vercel — hosting and analytics`,
            },
            {
              title: '6. Data Retention',
              content: `We retain your account data for as long as your account is active. Scan results are stored indefinitely so you can access your history. You may request deletion of your data at any time by contacting support@adsenseai.in.`,
            },
            {
              title: '7. Your Rights',
              content: `You have the right to:
• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your account and data
• Export your scan history
Contact us at support@adsenseai.in to exercise these rights.`,
            },
            {
              title: '8. Security',
              content: `We use industry-standard security measures including HTTPS encryption, Firebase security rules, and Razorpay's PCI-DSS compliant payment processing. However, no system is 100% secure.`,
            },
            {
              title: '9. Changes to This Policy',
              content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our website.`,
            },
            {
              title: '10. Contact',
              content: `For privacy-related questions, contact us at: privacy@adsenseai.in`,
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

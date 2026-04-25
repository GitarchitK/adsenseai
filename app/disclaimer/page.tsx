import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer — AdSense Checker AI',
  description: 'Disclaimer for AdSense Checker AI. Our tool provides AdSense readiness analysis for informational purposes. Final AdSense approval is determined by Google.',
  alternates: { canonical: 'https://www.adsensechecker.in/disclaimer' },
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-2">Disclaimer</h1>
          <p className="text-sm text-muted-foreground">Last updated: April 24, 2025</p>
          <p className="text-sm text-muted-foreground mt-2">This disclaimer applies to <strong>AdSense Checker AI</strong> at <strong>www.adsensechecker.in</strong>.</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          {[
            {
              title: '1. No Affiliation with Google',
              content: 'AdSense Checker AI is an independent tool and is not affiliated with, endorsed by, or sponsored by Google LLC or Google AdSense. "Google AdSense" is a trademark of Google LLC. We use this term only to describe the service our tool helps publishers prepare for.',
            },
            {
              title: '2. Informational Purposes Only',
              content: 'The analysis, scores, and recommendations provided by AdSense Checker AI are for informational purposes only. Our tool analyzes publicly available signals on your website and provides an estimate of AdSense readiness based on known approval criteria. This is not a guarantee of AdSense approval.',
            },
            {
              title: '3. No Guarantee of Approval',
              content: 'AdSense Checker AI does not guarantee that following our recommendations will result in Google AdSense approval. Google\'s approval process involves human review and proprietary algorithms that we cannot fully replicate. Final approval decisions are made solely by Google.',
            },
            {
              title: '4. Accuracy of Analysis',
              content: 'While we strive to provide accurate and up-to-date analysis, AdSense Checker AI\'s results are based on AI models and heuristics that may not capture every factor Google considers. Our tool is designed to identify common issues but may not detect all problems or may flag issues that are not actually problematic.',
            },
            {
              title: '5. Third-Party Links',
              content: 'Our website and blog posts contain links to third-party websites, including Google\'s official documentation. We are not responsible for the content, accuracy, or privacy practices of these external sites. Links to Google AdSense resources are provided for informational purposes only.',
            },
            {
              title: '6. Advertising Disclosure',
              content: 'This website displays advertisements through Google AdSense. We may earn revenue from these advertisements. The presence of ads does not influence our editorial content or tool recommendations.',
            },
            {
              title: '7. Earnings Disclaimer',
              content: 'Any revenue figures, CPC estimates, or monetization projections mentioned on this website are estimates based on industry data and are not guarantees of actual earnings. Actual AdSense revenue depends on many factors including traffic, niche, audience location, and ad placement.',
            },
            {
              title: '8. Contact',
              content: 'If you have questions about this disclaimer, contact us at: legal@adsensechecker.in',
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

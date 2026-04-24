import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How To Optimize Your Website For Adsense Approval',
  description: 'Learn how to optimize your website to meet Adsense approval standards. Improve content quality, site design, and technical SEO. Follow actionable steps to increase your approval chances and monetize your site successfully.',
  keywords: ['optimize website for adsense approval', 'adsense optimization', 'how to optimize for adsense', 'adsense approval checker'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/optimize-website-for-adsense-approval' },
  openGraph: { type: 'article', title: 'How To Optimize Your Website For Adsense Approval', url: 'https://www.adsensechecker.in/blog/optimize-website-for-adsense-approval', siteName: 'AdSense Approval Checker AI' },
}

const schemas = [
  {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: 'How To Optimize Your Website For Adsense Approval',
    url: 'https://www.adsensechecker.in/blog/optimize-website-for-adsense-approval',
    datePublished: '2025-04-24', dateModified: '2025-04-24',
    author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
    publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
      { '@type': 'ListItem', position: 3, name: 'Optimize for AdSense', item: 'https://www.adsensechecker.in/blog/optimize-website-for-adsense-approval' },
    ],
  },
]

const optimizations = [
  { area: 'Content Quality', steps: ['Write 600+ words per article with original insights', 'Add personal experience and real examples to every post', 'Use clear H1, H2, H3 heading structure', 'Include a conclusion that summarizes key takeaways', 'Aim for 25-30 articles before applying'] },
  { area: 'Required Pages', steps: ['Create a Privacy Policy page at /privacy-policy', 'Add an About page explaining who you are', 'Add a Contact page with email or contact form', 'Add Terms of Service page', 'Add Disclaimer page (especially for finance/health niches)'] },
  { area: 'Technical SEO', steps: ['Add unique meta descriptions to every page (150-160 chars)', 'Ensure every page has exactly one H1 tag', 'Enable HTTPS (SSL certificate)', 'Make your site mobile-friendly', 'Improve page load speed (aim for under 3 seconds)'] },
  { area: 'Trust Signals', steps: ['Add author bio to your articles', 'Link to authoritative sources when citing facts', 'Add internal links between related articles', 'Ensure clear navigation from homepage', 'Remove broken links'] },
  { area: 'Policy Compliance', steps: ['Remove any adult or explicit content', 'Don\'t copy content from other websites', 'Avoid excessive keyword stuffing', 'Don\'t use misleading headlines (clickbait)', 'Remove any content promoting illegal activities'] },
]

export default function OptimizeWebsiteForAdsense() {
  return (
    <div className="min-h-screen bg-background">
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">AdSense Guide</div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">How to Optimize Your Website for AdSense Approval</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Optimizing your website for AdSense approval isn't just about fixing errors — it's about building a site that Google genuinely wants to partner with. Here's a complete optimization guide covering every area that matters.</p>
        </div>
        <div className="prose prose-sm max-w-none space-y-10 text-foreground">
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">The 5 Areas You Must Optimize</h2>
            <p className="text-muted-foreground leading-relaxed">Google evaluates your site across five key areas. Weakness in any one area can cause rejection — even if everything else is perfect.</p>
          </section>
          {optimizations.map(opt => (
            <section key={opt.area}>
              <h2 className="text-2xl font-black text-foreground mb-4">Optimize {opt.area}</h2>
              <div className="space-y-2">
                {opt.steps.map(step => (
                  <div key={step} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Check Your Optimization Score</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">After optimizing, use AdSense Checker AI to verify your site meets all requirements. Our tool scans every page and gives you a score from 0-100 — aim for 70+ before applying.</p>
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="font-bold text-foreground mb-2">Free AdSense Optimization Checker</p>
              <p className="text-sm text-muted-foreground mb-4">Scan your site and see your optimization score across all 5 areas above.</p>
              <Link href="/auth/signup"><Button className="gap-2 rounded-xl">Check My Optimization Score — Free <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </section>
          <div className="flex gap-4 pt-4 border-t border-border/60 flex-wrap">
            <Link href="/blog/adsense-approval-requirements" className="text-sm text-primary hover:underline">← AdSense Requirements</Link>
            <Link href="/blog/adsense-rejected-how-to-fix" className="text-sm text-primary hover:underline ml-auto">Fix AdSense Rejection →</Link>
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

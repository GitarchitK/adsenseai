import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why Does AdSense Keep Rejecting My Site? 8 Real Reasons + Fixes',
  description: 'AdSense keeps rejecting your website? Here are the 8 most common reasons Google rejects AdSense applications — and exactly how to fix each one. Use our free AdSense approval checker to diagnose your site.',
  keywords: ['adsense keeps rejecting my site', 'why adsense rejected my application', 'adsense rejection reasons', 'adsense approval checker', 'fix adsense rejection'],
  alternates: { canonical: 'https://adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site' },
  openGraph: {
    type: 'article',
    title: 'Why Does AdSense Keep Rejecting My Site? 8 Real Reasons + Fixes',
    description: 'The 8 most common reasons Google rejects AdSense applications and how to fix them.',
    url: 'https://adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Why Does AdSense Keep Rejecting My Site? 8 Real Reasons + Fixes',
  description: 'The 8 most common reasons Google rejects AdSense applications and how to fix them.',
  url: 'https://adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site',
  datePublished: '2025-01-01',
  dateModified: '2025-04-23',
  author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://adsensechecker.in' },
  publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://adsensechecker.in' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'Why AdSense Keeps Rejecting', item: 'https://adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site' },
  ],
}

const reasons = [
  {
    title: '1. "Low Value Content" — The #1 Rejection Reason',
    problem: 'Your articles are too short, too generic, or too similar to what\'s already on the internet. Google\'s AI can detect thin content instantly.',
    fix: 'Rewrite your weakest articles to 700+ words. Add your personal experience, original examples, and insights that only you could write. Use our AdSense approval checker to identify which pages are flagged as thin.',
    critical: true,
  },
  {
    title: '2. Missing Privacy Policy Page',
    problem: 'AdSense requires a Privacy Policy page on every site. Without it, your application is automatically rejected.',
    fix: 'Create a Privacy Policy page at /privacy-policy. It must explain what data you collect and how you use it. AdSenseAI\'s AI Tools include a free Privacy Policy generator.',
    critical: true,
  },
  {
    title: '3. Not Enough Content',
    problem: 'A site with 5-10 articles doesn\'t demonstrate enough value to Google. They want to see a content-rich site before approving.',
    fix: 'Publish at least 25 quality articles before applying. Focus on depth over quantity — one 1,000-word article is worth more than five 200-word posts.',
    critical: true,
  },
  {
    title: '4. Copied or Scraped Content',
    problem: 'If any of your content is copied from other websites, Google will detect it and reject your application.',
    fix: 'Run your articles through a plagiarism checker. Rewrite any copied content in your own words. Our AdSense approval checker flags copyright risk automatically.',
    critical: true,
  },
  {
    title: '5. No About or Contact Page',
    problem: 'Google wants to know who runs the site. Missing an About page or Contact page signals that the site may not be legitimate.',
    fix: 'Create an About page explaining who you are and why you created the site. Add a Contact page with at least an email address.',
    critical: true,
  },
  {
    title: '6. Site is Too New',
    problem: 'Google AdSense prefers sites that have been active for at least 6 months. Very new domains often get rejected even with good content.',
    fix: 'Keep publishing quality content while your domain matures. Apply once your site is at least 6 months old and has 25+ articles.',
    critical: false,
  },
  {
    title: '7. Poor Site Navigation',
    problem: 'If visitors can\'t easily find content on your site, Google sees it as a poor user experience.',
    fix: 'Add a clear navigation menu. Make sure every page is reachable within 2 clicks from your homepage. Add internal links between related articles.',
    critical: false,
  },
  {
    title: '8. Keyword Stuffing',
    problem: 'Repeating the same keywords too many times in your articles looks spammy to Google\'s reviewers.',
    fix: 'Write naturally. If a keyword appears more than 2-3 times per 100 words, reduce it. Use synonyms and related phrases instead.',
    critical: false,
  },
]

export default function WhyAdsenseKeepsRejectingMySite() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            AdSense Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            Why Does AdSense Keep Rejecting My Site? 8 Real Reasons + Fixes
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Getting rejected by Google AdSense is frustrating — especially when the rejection email gives you almost no useful information. Here are the 8 most common reasons AdSense rejects websites, and exactly how to fix each one.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          {reasons.map(reason => (
            <section key={reason.title} className={`p-5 rounded-2xl border ${
              reason.critical
                ? 'border-red-200 dark:border-red-800/40 bg-red-50/30 dark:bg-red-950/10'
                : 'border-border/60 bg-muted/20'
            }`}>
              <h2 className="text-lg font-black text-foreground mb-3 flex items-start gap-2">
                {reason.critical
                  ? <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                {reason.title}
              </h2>
              <div className="space-y-2 pl-7">
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">The Problem</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{reason.problem}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">The Fix</p>
                  <p className="text-sm text-foreground leading-relaxed">{reason.fix}</p>
                </div>
              </div>
            </section>
          ))}

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">How to Diagnose Your Rejection in 30 Seconds</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Instead of guessing which of these issues is causing your rejection, use AdSenseAI's free AdSense approval checker. It scans your entire site and tells you exactly which issues were found — with specific fixes for each one.
            </p>
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground text-sm">Free AdSense Approval Checker</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Scan your site against all 8 rejection reasons above. Get a score from 0-100 and a personalised fix list in 30 seconds.</p>
                </div>
              </div>
              <Link href="/auth/signup">
                <Button className="gap-2 rounded-xl">
                  Check Why AdSense Rejected My Site <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

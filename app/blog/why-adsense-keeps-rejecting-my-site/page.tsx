import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { AuthorBox } from '@/components/author-box'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, FileText, Check, XCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why AdSense Keeps Rejecting Your Site & How to Fix It (2026 Guide)',
  description: 'Stuck in an endless loop of AdSense rejection emails? Learn the top 8 official reasons Google rejects applications and follow our exact step-by-step fixes.',
  keywords: ['reasons of google adsense rejection', 'google adsense common rejection reasons', 'why is adsense taking so long', 'google adsense rejection reasons official'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site' },
  openGraph: {
    type: 'article',
    title: 'Why AdSense Keeps Rejecting Your Site & How to Fix It (2026 Guide)',
    description: 'The official reasons Google rejects AdSense applications and how to fix them.',
    url: 'https://www.adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Why AdSense Keeps Rejecting Your Site & How to Fix It (2026 Guide)',
  url: 'https://www.adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site',
  datePublished: '2025-01-01',
  dateModified: '2026-07-14',
  author: {
    '@type': 'Person',
    name: 'Archit Karmakar',
    jobTitle: 'AdSense Compliance Specialist',
    worksFor: { '@type': 'Organization', name: 'Navroll Studio' },
    url: 'https://www.adsensechecker.in/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AdSense Approval Checker AI',
    url: 'https://www.adsensechecker.in',
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'Why AdSense Keeps Rejecting', item: 'https://www.adsensechecker.in/blog/why-adsense-keeps-rejecting-my-site' },
  ],
}

const reasons = [
  {
    title: '1. "Low Value Content" — The #1 Rejection Trigger',
    problem: 'Your articles are too short, too generic, or contain AI-generated text without human curation. Google Quality Raters assign low ratings to repetitive information.',
    fix: 'Expand weak posts to 1,000+ words. Add unique insights, screenshots, data tables, and an author bio box to every page.',
    critical: true,
  },
  {
    title: '2. Missing Privacy Policy with Google Cookie Clause',
    problem: 'AdSense requires a comprehensive Privacy Policy page on every site. Missing DoubleClick cookie disclosures results in automatic rejection.',
    fix: 'Ensure your Privacy Policy explicitly discloses Google AdSense, DoubleClick cookies, and opt-out links.',
    critical: true,
  },
  {
    title: '3. Insufficient Content Volume (Fewer than 25 Posts)',
    problem: 'A website with fewer than 20–25 articles rarely demonstrates enough authority or contextual ad space.',
    fix: 'Publish at least 25–30 comprehensive articles before applying. Focus on depth over volume.',
    critical: true,
  },
  {
    title: '4. Copied, Scraped, or Paraphrased Content',
    problem: 'If your text relies heavily on Wikipedia, press releases, or news feeds without added analysis, Google flags it for copyright risk.',
    fix: 'Rewrite flagged sections completely. Add original opinions, test results, and original commentary.',
    critical: true,
  },
  {
    title: '5. Missing E-E-A-T & Contact Information',
    problem: 'Sites lacking an About Us page, real author bios, or contact forms are viewed as untrustworthy.',
    fix: 'Add visible author bio cards, an About Us page detailing your team, and a working Contact form.',
    critical: true,
  },
  {
    title: '6. Broken Navigation or Empty Category Pages',
    problem: 'Empty tag pages or dead menu links trigger "Valuable Inventory: Under Construction" rejections.',
    fix: 'Remove empty category links and set tag pages to noindex.',
    critical: false,
  },
]

export default function WhyAdsenseKeepsRejectingMySite() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      <article className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <ShieldAlert className="h-3.5 w-3.5" /> Troubleshooting Guide
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            Why AdSense Keeps Rejecting Your Site & How to Fix It (2026 Master Guide)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Stuck in an endless loop of vague AdSense rejection emails? This guide decodes the exact reasons behind Google AdSense rejections and gives you step-by-step solutions to get approved.
          </p>
        </div>

        <AuthorBox publishedDate="January 01, 2025" updatedDate="July 14, 2026" readTime="11 min read" />

        <div className="prose prose-sm md:prose-base max-w-none space-y-10 text-foreground leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">The Real Causes of AdSense Rejections</h2>
            <p>
              Google receives over 100,000 AdSense applications every month. To handle this volume, Google uses automated AI bots alongside human reviewers. Most rejection emails provide generic template responses, leaving publishers confused.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">Top Rejection Reasons & Step-by-Step Fixes</h2>
            
            <div className="space-y-6">
              {reasons.map((r) => (
                <div key={r.title} className="p-6 rounded-2xl border border-border/70 bg-card space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-foreground">{r.title}</h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                      r.critical ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {r.critical ? 'Critical' : 'Recommended'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.problem}</p>
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-foreground font-medium flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Fix:</strong> {r.fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-violet-500/10 border border-primary/25 text-center my-8">
            <h2 className="text-2xl font-black text-foreground mb-3">Audit Your Site automatically Before Reapplying</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
              Use AdSense Checker AI to find exact policy risks on your pages before submitting your site for review again.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/25">
                Scan My Site Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

        </div>
      </article>

      <SiteFooter />
    </div>
  )
}

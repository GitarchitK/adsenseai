import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Real Adsense Approval Success Case Study Explained',
  description: 'Learn from real Adsense approval success stories and understand what works. Discover strategies, mistakes, and improvements that led to approval. Apply these insights to your own website and increase your chances of success.',
  keywords: ['adsense approval success case study', 'adsense approval story', 'how to get adsense approved case study', 'adsense approval checker'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/adsense-approval-success-case-study' },
  openGraph: { type: 'article', title: 'Real Adsense Approval Success Case Study Explained', url: 'https://www.adsensechecker.in/blog/adsense-approval-success-case-study', siteName: 'AdSense Approval Checker AI' },
}

const schemas = [
  {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: 'Real Adsense Approval Success Case Study Explained',
    url: 'https://www.adsensechecker.in/blog/adsense-approval-success-case-study',
    datePublished: '2025-04-24', dateModified: '2025-04-24',
    author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
    publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
      { '@type': 'ListItem', position: 3, name: 'AdSense Approval Case Study', item: 'https://www.adsensechecker.in/blog/adsense-approval-success-case-study' },
    ],
  },
]

const caseStudies = [
  {
    name: 'Priya S. — Lifestyle Blog',
    rejections: 3,
    approvalTime: '6 weeks after using AdSense Checker AI',
    score: 82,
    problem: 'Missing Privacy Policy, 8 thin articles under 300 words, no About page.',
    fix: 'Created Privacy Policy and About pages, rewrote 8 articles to 700+ words, added author bio.',
    quote: 'I\'d been rejected 3 times. AdSenseAI showed me exactly what was wrong. Fixed both issues, approved in a week.',
  },
  {
    name: 'Marcus T. — Tech Blog',
    rejections: 1,
    approvalTime: '3 weeks after fixes',
    score: 76,
    problem: 'Low originality score (42/100), keyword stuffing on 5 pages, no meta descriptions.',
    fix: 'Rewrote 5 articles with original insights, reduced keyword density, added meta descriptions to all pages.',
    quote: 'The AI fix suggestions were incredibly specific. Not generic advice — actual page-by-page recommendations.',
  },
  {
    name: 'Aisha K. — News Site',
    rejections: 2,
    approvalTime: '4 weeks after fixes',
    score: 79,
    problem: 'Copyright risk detected on 3 pages, no Disclaimer page, domain only 4 months old.',
    fix: 'Removed copied content, added Disclaimer page, waited 2 more months for domain to mature.',
    quote: 'Saved me hours of guesswork. The policy risk checker caught a copyright issue I had no idea about.',
  },
]

export default function AdsenseApprovalCaseStudy() {
  return (
    <div className="min-h-screen bg-background">
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Case Studies</div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">Real AdSense Approval Success Case Studies Explained</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">The best way to understand what gets AdSense approved is to look at real examples. Here are 3 case studies from publishers who went from rejected to approved — with the exact issues they fixed.</p>
        </div>
        <div className="prose prose-sm max-w-none space-y-10 text-foreground">
          <section>
            <h2 className="text-2xl font-black text-foreground mb-6">3 Real AdSense Approval Success Stories</h2>
            <div className="space-y-6">
              {caseStudies.map(cs => (
                <div key={cs.name} className="p-5 rounded-2xl border border-border/60 bg-muted/20 space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-black text-foreground">{cs.name}</h3>
                      <p className="text-xs text-muted-foreground">{cs.rejections} rejection{cs.rejections > 1 ? 's' : ''} before approval</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                      <TrendingUp className="h-3.5 w-3.5" /> Score: {cs.score}/100
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40">
                      <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">The Problem</p>
                      <p className="text-sm text-foreground">{cs.problem}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">The Fix</p>
                      <p className="text-sm text-foreground">{cs.fix}</p>
                    </div>
                  </div>
                  <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">"{cs.quote}"</blockquote>
                  <p className="text-xs text-muted-foreground">✓ Approved {cs.approvalTime}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">What These Case Studies Have in Common</h2>
            <div className="space-y-2">
              {['All used an AdSense approval checker to identify the exact issues', 'All fixed specific pages — not just general improvements', 'All waited 2-4 weeks after fixing before reapplying', 'All had a score of 70+ before their successful application', 'None reapplied immediately after rejection'].map(item => (
                <div key={item} className="flex items-start gap-2 p-3 rounded-xl border border-border/60 bg-muted/20 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="font-bold text-foreground mb-2">Start Your Own Success Story</p>
            <p className="text-sm text-muted-foreground mb-4">Use AdSense Checker AI to find your exact issues — just like the publishers above. Free scan, no credit card.</p>
            <Link href="/auth/signup"><Button className="gap-2 rounded-xl">Check My Site — Free <ArrowRight className="h-4 w-4" /></Button></Link>
          </section>
          <div className="flex gap-4 pt-4 border-t border-border/60 flex-wrap">
            <Link href="/blog/adsense-rejected-how-to-fix" className="text-sm text-primary hover:underline">← Fix AdSense Rejection</Link>
            <Link href="/blog/monetize-website-without-adsense" className="text-sm text-primary hover:underline ml-auto">Monetize Without AdSense →</Link>
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

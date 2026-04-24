import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Adsense Rejected Here Is How To Fix Your Website Fast',
  description: 'Got rejected by Adsense? Learn how to fix your website with proven strategies. Identify common issues, improve content quality, and meet policy requirements. Follow this guide to correct mistakes and reapply with confidence.',
  keywords: ['adsense rejected how to fix website', 'adsense rejection fix', 'fix adsense rejection', 'adsense rejected what to do', 'adsense approval checker'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/adsense-rejected-how-to-fix' },
  openGraph: { type: 'article', title: 'Adsense Rejected? Here Is How To Fix Your Website Fast', url: 'https://www.adsensechecker.in/blog/adsense-rejected-how-to-fix', siteName: 'AdSense Approval Checker AI' },
}

const schemas = [
  {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: 'Adsense Rejected? Here Is How To Fix Your Website Fast',
    url: 'https://www.adsensechecker.in/blog/adsense-rejected-how-to-fix',
    datePublished: '2025-04-24', dateModified: '2025-04-24',
    author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
    publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
      { '@type': 'ListItem', position: 3, name: 'Fix AdSense Rejection', item: 'https://www.adsensechecker.in/blog/adsense-rejected-how-to-fix' },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What should I do after AdSense rejects my application?', acceptedAnswer: { '@type': 'Answer', text: 'After AdSense rejection: 1) Read the rejection email carefully for the stated reason, 2) Use an AdSense approval checker to identify all issues, 3) Fix every flagged issue, 4) Wait 2-4 weeks before reapplying, 5) Re-scan your site to confirm issues are resolved.' } },
      { '@type': 'Question', name: 'How long should I wait before reapplying to AdSense?', acceptedAnswer: { '@type': 'Answer', text: 'Wait at least 2-4 weeks after fixing your issues before reapplying to AdSense. This gives Google time to re-crawl your site and see the improvements. Use an AdSense approval checker to confirm your score is 70+ before reapplying.' } },
      { '@type': 'Question', name: 'Can I reapply to AdSense after rejection?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, you can reapply to AdSense after rejection. There is no limit on the number of applications. However, fix all the issues first — reapplying without fixing the problems will result in another rejection.' } },
    ],
  },
]

const fixes = [
  { rejection: '"Low Value Content"', steps: ['Rewrite thin articles to 700+ words', 'Add original insights and personal experience', 'Remove or merge very short pages', 'Ensure every article fully answers the reader\'s question', 'Add proper H1, H2, H3 structure to all articles'] },
  { rejection: '"Insufficient Content"', steps: ['Publish at least 20-25 quality articles before reapplying', 'Each article should be 600+ words', 'Focus on one niche — don\'t mix unrelated topics', 'Ensure articles are indexed by Google (check Search Console)', 'Remove placeholder or draft pages'] },
  { rejection: '"Policy Violation"', steps: ['Remove any adult, violent, or illegal content', 'Replace copied content with original writing', 'Remove excessive keyword stuffing', 'Fix misleading headlines or clickbait titles', 'Remove any content promoting dangerous products'] },
  { rejection: '"Site Navigation Issues"', steps: ['Add a clear navigation menu to every page', 'Ensure every page is reachable within 2 clicks from homepage', 'Fix all broken links', 'Add internal links between related articles', 'Make sure your site works on mobile devices'] },
]

export default function AdsenseRejectedHowToFix() {
  return (
    <div className="min-h-screen bg-background">
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-4">AdSense Rejection Fix</div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">AdSense Rejected? Here Is How to Fix Your Website Fast</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Getting rejected by AdSense is frustrating — especially when the rejection email is vague. This guide gives you a clear, step-by-step fix plan based on the most common rejection reasons.</p>
        </div>
        <div className="prose prose-sm max-w-none space-y-10 text-foreground">
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Step 1: Diagnose Your Rejection in 30 Seconds</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Before fixing anything, you need to know exactly what's wrong. The rejection email gives you a category (like "Low Value Content") but not the specific pages or issues. Use AdSense Checker AI to get a detailed breakdown:</p>
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 mb-4">
              <p className="font-bold text-foreground mb-2">Free AdSense Rejection Diagnosis</p>
              <p className="text-sm text-muted-foreground mb-3">Scan your site and see exactly which pages are causing your rejection — with specific fixes for each one.</p>
              <Link href="/auth/signup"><Button size="sm" className="gap-2 rounded-xl">Diagnose My Rejection — Free <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Step 2: Fix Based on Your Rejection Reason</h2>
            <div className="space-y-6">
              {fixes.map(fix => (
                <div key={fix.rejection} className="p-5 rounded-2xl border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <h3 className="font-black text-foreground">Rejection Reason: {fix.rejection}</h3>
                  </div>
                  <div className="space-y-2">
                    {fix.steps.map(step => (
                      <div key={step} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Step 3: Verify Before Reapplying</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">After making fixes, don't reapply immediately. Run a fresh scan on AdSense Checker AI to confirm your score is 70+. Reapplying with the same issues will result in another rejection.</p>
            <div className="grid grid-cols-3 gap-3">
              {[{ score: '0-59', label: 'Don\'t apply yet', color: 'border-red-300 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300' }, { score: '60-69', label: 'Almost ready', color: 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' }, { score: '70+', label: 'Apply now', color: 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' }].map(s => (
                <div key={s.score} className={`p-4 rounded-xl border-2 text-center ${s.color}`}>
                  <p className="text-xl font-black">{s.score}</p>
                  <p className="text-xs font-bold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {schemas[2].mainEntity.map((faq: { name: string; acceptedAnswer: { text: string } }) => (
                <div key={faq.name} className="p-4 rounded-xl border border-border/60 bg-muted/20">
                  <p className="font-bold text-foreground text-sm mb-1">{faq.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="flex gap-4 pt-4 border-t border-border/60 flex-wrap">
            <Link href="/blog/why-adsense-keeps-rejecting-my-site" className="text-sm text-primary hover:underline">← Why AdSense Rejects Sites</Link>
            <Link href="/blog/optimize-website-for-adsense-approval" className="text-sm text-primary hover:underline ml-auto">Optimize for AdSense →</Link>
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

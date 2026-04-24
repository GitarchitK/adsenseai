import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How Long Does AdSense Approval Take in 2025? (Real Timeline)',
  description: 'How long does Google AdSense approval take? Learn the real timeline, what happens during review, and how to speed up your AdSense approval.',
  keywords: ['adsense approval time', 'how long does adsense approval take', 'adsense review time 2025', 'adsense approval process', 'adsense approval checker'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/adsense-approval-time' },
  openGraph: {
    type: 'article',
    title: 'How Long Does AdSense Approval Take in 2025?',
    description: 'The real AdSense approval timeline and how to speed up your review.',
    url: 'https://www.adsensechecker.in/blog/adsense-approval-time',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How Long Does AdSense Approval Take in 2025? (Real Timeline)',
  url: 'https://www.adsensechecker.in/blog/adsense-approval-time',
  datePublished: '2025-04-23',
  dateModified: '2025-04-23',
  author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How long does AdSense approval take?', acceptedAnswer: { '@type': 'Answer', text: 'Google AdSense approval typically takes 1-14 days. Sites that meet all requirements are usually approved within 3-7 days. Sites with issues may take longer or receive a rejection email.' } },
    { '@type': 'Question', name: 'Why is my AdSense application taking so long?', acceptedAnswer: { '@type': 'Answer', text: 'AdSense applications can take longer if your site has borderline content quality, is very new, or is in a high-risk niche. Google manually reviews applications, so processing times vary.' } },
    { '@type': 'Question', name: 'How can I speed up AdSense approval?', acceptedAnswer: { '@type': 'Answer', text: 'To speed up AdSense approval: ensure your site meets all requirements before applying, use an AdSense approval checker to fix issues first, and make sure your site is fully indexed by Google.' } },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'AdSense Approval Time', item: 'https://www.adsensechecker.in/blog/adsense-approval-time' },
  ],
}

const timeline = [
  { day: 'Day 1', event: 'Application submitted', detail: 'Google receives your application and adds it to the review queue.' },
  { day: 'Day 1-3', event: 'Automated check', detail: 'Google\'s systems automatically scan your site for obvious policy violations, missing pages, and basic requirements.' },
  { day: 'Day 3-7', event: 'Manual review', detail: 'A Google reviewer manually evaluates your site\'s content quality, design, and compliance.' },
  { day: 'Day 7-14', event: 'Decision sent', detail: 'You receive an email with either approval or a rejection with the reason.' },
  { day: 'After approval', event: 'Ad serving begins', detail: 'Add the AdSense code to your site. Ads start showing within 24-48 hours.' },
]

export default function AdsenseApprovalTime() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">AdSense Guide</div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            How Long Does AdSense Approval Take in 2025? (Real Timeline)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            After submitting your AdSense application, the waiting is the hardest part. Here's the real timeline of what happens during the review process — and how to make sure you get approved on the first try.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-10 text-foreground">

          <section>
            <h2 className="text-2xl font-black text-foreground mb-2">The Short Answer: 1-14 Days</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Most AdSense applications are reviewed within <strong>3-7 business days</strong>. Sites that clearly meet all requirements tend to get approved faster. Sites with borderline content or new domains may take up to 14 days.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { time: '1-3 days', label: 'Best case', color: 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' },
                { time: '3-7 days', label: 'Typical', color: 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' },
                { time: '7-14 days', label: 'Slow review', color: 'border-red-300 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300' },
              ].map(s => (
                <div key={s.time} className={`p-4 rounded-xl border-2 text-center ${s.color}`}>
                  <p className="text-xl font-black">{s.time}</p>
                  <p className="text-xs font-bold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">The AdSense Review Timeline</h2>
            <div className="space-y-3">
              {timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <div className="flex items-center justify-center h-10 w-20 rounded-lg bg-primary/10 text-primary text-xs font-black flex-shrink-0 text-center">{step.day}</div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{step.event}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">How to Get Approved Faster</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The single best way to speed up AdSense approval is to make sure your site passes all requirements <em>before</em> you apply. Sites that fail the automated check go into a longer manual review queue.
            </p>
            <div className="space-y-3">
              {[
                { tip: 'Use an AdSense approval checker first', detail: 'Run your site through AdSenseAI before applying. Fix all flagged issues so your application passes the automated check immediately.' },
                { tip: 'Make sure Google has indexed your site', detail: 'Check Google Search Console to confirm your pages are indexed. Unindexed sites can\'t be reviewed.' },
                { tip: 'Don\'t apply with a brand new domain', detail: 'Wait at least 3-6 months after launching your site. New domains are reviewed more slowly and rejected more often.' },
                { tip: 'Have all required pages ready', detail: 'Privacy Policy, About, and Contact pages must exist before you apply. Missing any of these causes instant rejection.' },
              ].map(item => (
                <div key={item.tip} className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground text-sm">{item.tip}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Check Your Site Before Applying</p>
                <p className="text-sm text-muted-foreground mt-0.5">Use our free AdSense approval checker to find and fix all issues before submitting your application. Sites that pass our checker get approved significantly faster.</p>
              </div>
            </div>
            <Link href="/auth/signup">
              <Button className="gap-2 rounded-xl">Check My Site — Free <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq: { name: string; acceptedAnswer: { text: string } }) => (
                <div key={faq.name} className="p-4 rounded-xl border border-border/60 bg-muted/20">
                  <p className="font-bold text-foreground text-sm mb-1">{faq.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-4 pt-4 border-t border-border/60 flex-wrap">
            <Link href="/blog/how-to-check-adsense-approval" className="text-sm text-primary hover:underline">← How to Check Approval</Link>
            <Link href="/blog/why-adsense-keeps-rejecting-my-site" className="text-sm text-primary hover:underline ml-auto">Why AdSense Rejects Sites →</Link>
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Google AdSense Approval Requirements 2025 — Complete Checklist',
  description: 'Complete list of Google AdSense approval requirements for 2025. Check every requirement your website must meet before applying — content, policy, pages, SEO, and more.',
  keywords: ['adsense approval requirements', 'adsense requirements 2025', 'google adsense requirements', 'adsense approval checklist', 'adsense approval checker'],
  alternates: { canonical: 'https://adsensechecker.in/blog/adsense-approval-requirements' },
  openGraph: {
    type: 'article',
    title: 'Google AdSense Approval Requirements 2025 — Complete Checklist',
    description: 'Complete list of Google AdSense approval requirements for 2025.',
    url: 'https://adsensechecker.in/blog/adsense-approval-requirements',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Google AdSense Approval Requirements 2025 — Complete Checklist',
  description: 'Complete list of Google AdSense approval requirements for 2025.',
  url: 'https://adsensechecker.in/blog/adsense-approval-requirements',
  datePublished: '2025-01-01',
  dateModified: '2025-04-23',
  author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://adsensechecker.in' },
  publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://adsensechecker.in' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://adsensechecker.in/blog/adsense-approval-requirements' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'AdSense Approval Requirements', item: 'https://adsensechecker.in/blog/adsense-approval-requirements' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What are the requirements for Google AdSense approval?', acceptedAnswer: { '@type': 'Answer', text: 'Google AdSense requires: original content (20-30+ articles, 600+ words each), Privacy Policy page, About page, Contact page, HTTPS, mobile-friendly design, and no policy violations.' } },
    { '@type': 'Question', name: 'How many articles do I need for AdSense approval?', acceptedAnswer: { '@type': 'Answer', text: 'Most publishers need at least 20-30 quality articles before applying for AdSense. Each article should be at least 600 words of original content.' } },
    { '@type': 'Question', name: 'Is a Privacy Policy required for AdSense?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, a Privacy Policy page is required for Google AdSense approval. It must explain what data you collect and how you use it.' } },
  ],
}

const requirements = [
  {
    category: 'Content Requirements',
    items: [
      { req: 'Minimum 20-30 original articles', critical: true },
      { req: 'Each article at least 600 words', critical: true },
      { req: 'No copied or scraped content', critical: true },
      { req: 'No adult, violent, or dangerous content', critical: true },
      { req: 'Content written in a supported language', critical: true },
      { req: 'Regular publishing schedule (2-3 posts/week)', critical: false },
    ],
  },
  {
    category: 'Required Pages',
    items: [
      { req: 'Privacy Policy page', critical: true },
      { req: 'About Us page', critical: true },
      { req: 'Contact page', critical: true },
      { req: 'Terms of Service page', critical: false },
      { req: 'Disclaimer page (for finance/health niches)', critical: false },
    ],
  },
  {
    category: 'Technical Requirements',
    items: [
      { req: 'HTTPS (SSL certificate)', critical: true },
      { req: 'H1 heading on every page', critical: true },
      { req: 'Meta description on every page', critical: false },
      { req: 'Mobile-friendly design', critical: true },
      { req: 'Fast page load speed', critical: false },
      { req: 'No broken links', critical: false },
    ],
  },
  {
    category: 'Domain & Site Requirements',
    items: [
      { req: 'Domain at least 6 months old (recommended)', critical: false },
      { req: 'You own and control the website', critical: true },
      { req: 'Site is publicly accessible (not under construction)', critical: true },
      { req: 'No excessive ads from other networks', critical: true },
      { req: 'Clear navigation structure', critical: false },
    ],
  },
]

export default function AdsenseApprovalRequirements() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            AdSense Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            Google AdSense Approval Requirements 2025: The Complete Checklist
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Before you apply for Google AdSense, your website must meet a specific set of requirements. This complete checklist covers every AdSense approval requirement — use it alongside our free AdSense approval checker to know exactly where you stand.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-10 text-foreground">

          <section>
            <h2 className="text-2xl font-black text-foreground mb-2">The AdSense Approval Checklist</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Items marked <span className="text-red-600 font-bold">Critical</span> will cause automatic rejection if not met. Items marked <span className="text-amber-600 font-bold">Recommended</span> improve your approval chances.
            </p>
            <div className="space-y-8">
              {requirements.map(section => (
                <div key={section.category}>
                  <h3 className="text-lg font-black text-foreground mb-3">{section.category}</h3>
                  <div className="space-y-2">
                    {section.items.map(item => (
                      <div key={item.req} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                        item.critical
                          ? 'border-red-200 dark:border-red-800/40 bg-red-50/30 dark:bg-red-950/10'
                          : 'border-border/60 bg-muted/20'
                      }`}>
                        {item.critical
                          ? <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          : <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                        <span className="text-foreground">{item.req}</span>
                        <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                          item.critical
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {item.critical ? 'Critical' : 'Recommended'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">How to Check All Requirements Automatically</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Manually checking every requirement takes hours. AdSenseAI's free AdSense approval checker scans your entire website in 30 seconds and tells you exactly which requirements you're failing — with specific fixes for each one.
            </p>
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="font-bold text-foreground mb-2">Free AdSense Approval Checker</p>
              <p className="text-sm text-muted-foreground mb-4">Scan your site against all the requirements above. Get a score from 0-100 and a personalised fix list.</p>
              <Link href="/auth/signup">
                <Button className="gap-2 rounded-xl">
                  Check My Site Now — Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'How long does AdSense approval take?', a: 'Google typically reviews AdSense applications within 1-14 days. If your site meets all requirements, approval is usually faster.' },
                { q: 'Can I apply for AdSense with a new website?', a: 'Yes, but Google recommends your site is at least 6 months old and has sufficient content. New sites with fewer than 20 articles are often rejected.' },
                { q: 'What is the minimum traffic for AdSense approval?', a: 'Google does not have a minimum traffic requirement for AdSense approval. However, sites with some organic traffic tend to get approved faster.' },
                { q: 'How many times can I apply for AdSense?', a: 'You can reapply for AdSense after fixing the issues that caused rejection. There is no limit on the number of applications.' },
              ].map(faq => (
                <div key={faq.q} className="p-4 rounded-xl border border-border/60 bg-muted/20">
                  <p className="font-bold text-foreground text-sm mb-1">{faq.q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

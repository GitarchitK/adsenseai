import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { AuthorBox } from '@/components/author-box'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, FileCheck2, Zap, AlertTriangle, Layers, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Google AdSense Approval Requirements 2026: Complete Master Checklist',
  description: 'What are the exact Google AdSense website requirements? Check our ultimate 2026 checklist covering content depth, E-E-A-T, legal pages, and technical compliance.',
  keywords: ['google adsense approval requirements for website', 'google adsense requirements', 'adsense account requirements', 'google adsense website requirements 2026'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/adsense-approval-requirements' },
  openGraph: {
    type: 'article',
    title: 'Google AdSense Approval Requirements 2026: Master Checklist',
    description: 'Complete list of Google AdSense approval requirements for your website.',
    url: 'https://www.adsensechecker.in/blog/adsense-approval-requirements',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Google AdSense Approval Requirements 2026: Complete Master Checklist',
  url: 'https://www.adsensechecker.in/blog/adsense-approval-requirements',
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
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.adsensechecker.in/blog/adsense-approval-requirements' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'AdSense Requirements', item: 'https://www.adsensechecker.in/blog/adsense-approval-requirements' },
  ],
}

const requirements = [
  {
    category: '1. Content Depth & Originality',
    desc: 'Google AdSense quality raters evaluate content substance before anything else.',
    items: [
      { req: 'Minimum 25–30 original articles published', critical: true, detail: 'Single page apps or sites with <15 articles are flagged for Low Value Content.' },
      { req: 'Each article at least 1,000 to 1,500+ words', critical: true, detail: 'Short posts under 500 words do not provide enough contextual ad space.' },
      { req: 'Zero plagiarized, scraped, or unedited AI text', critical: true, detail: 'Run text through plagiarism checkers. Add unique human insights and examples.' },
      { req: 'Supported primary language', critical: true, detail: 'Must be written in an officially supported Google AdSense publisher language.' },
      { req: 'Consistent publishing history', critical: false, detail: 'Regular post updates show that the site is actively maintained.' },
    ],
  },
  {
    category: '2. Mandatory Trust & Legal Pages',
    desc: 'Google requires transparent ownership and legal disclosures.',
    items: [
      { req: 'Privacy Policy page with Google AdSense cookie clause', critical: true, detail: 'Must explicitly mention Google DoubleClick cookies and opt-out links.' },
      { req: 'About Us page with team & business background', critical: true, detail: 'Explains who operates the site and your editorial mission.' },
      { req: 'Contact page with real email and working form', critical: true, detail: 'Provides working contact mechanisms for visitors and compliance reviewers.' },
      { req: 'Terms of Service page', critical: false, detail: 'Establishes site usage rules and intellectual property ownership.' },
      { req: 'Disclaimer page (for Finance, Health, Legal niches)', critical: false, detail: 'Protects visitors and satisfies YMYL (Your Money Your Life) criteria.' },
    ],
  },
  {
    category: '3. Technical & SEO Infrastructure',
    desc: 'Your site must load securely and navigate seamlessly across all devices.',
    items: [
      { req: 'Active SSL/TLS Certificate (HTTPS)', critical: true, detail: 'Google reviewers immediately reject insecure HTTP websites.' },
      { req: 'Mobile-responsive layout without overflow', critical: true, detail: 'Navigation and layout must adjust cleanly on mobile viewports.' },
      { req: 'Single H1 tag per page & semantic hierarchy', critical: true, detail: 'Structured H1, H2, H3 tags help crawler indexing.' },
      { req: 'Valid XML Sitemap & Robots.txt', critical: false, detail: 'Ensures Googlebot can crawl and index all your articles.' },
      { req: 'Zero broken links (404 errors)', critical: false, detail: 'All header and footer links must point to live, working URLs.' },
    ],
  },
  {
    category: '4. Domain & Policy Compliance',
    desc: 'AdSense enforces strict safety and niche restrictions.',
    items: [
      { req: 'Verified domain ownership & control', critical: true, detail: 'You must own the domain and be able to insert code in <head>.' },
      { req: 'Site is live and publicly accessible', critical: true, detail: 'Not password protected, under construction, or behind a paywall.' },
      { req: 'Zero restricted niche violations', critical: true, detail: 'No adult content, dangerous products, hacking tools, or illegal downloads.' },
      { req: 'Clean ad-to-content balance', critical: true, detail: 'Must not be overloaded with popups, aggressive banners, or third-party ad networks.' },
    ],
  },
]

export default function AdsenseApprovalRequirements() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      <article className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <FileCheck2 className="h-3.5 w-3.5" /> 2026 Publisher Blueprint
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            Google AdSense Approval Requirements 2026: Complete Master Checklist
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Before submitting your website to Google AdSense, verify that your site satisfies every requirement in this master checklist. Meeting these standards reduces approval time and prevents frustrating 2-week rejections.
          </p>
        </div>

        <AuthorBox publishedDate="January 01, 2025" updatedDate="July 14, 2026" readTime="10 min read" />

        <div className="prose prose-sm md:prose-base max-w-none space-y-10 text-foreground leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">Overview: How Google Reviews Your Website</h2>
            <p>
              When you submit a site to Google AdSense, a two-stage evaluation process begins:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
              <li><strong>Automated Bot Crawl:</strong> Googlebot scans your HTML for basic requirements: SSL (HTTPS), mobile responsiveness, XML sitemaps, structured headings, and word count across indexed URLs.</li>
              <li><strong>Human Quality Rater Review:</strong> A human reviewer visits your site to check editorial quality, author credentials (E-E-A-T), mandatory legal pages, and user experience.</li>
            </ol>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">The 2026 AdSense Master Checklist</h2>
            
            <div className="space-y-8">
              {requirements.map((section) => (
                <div key={section.category} className="p-6 rounded-2xl border border-border/70 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{section.category}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{section.desc}</p>
                  
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.req} className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {item.critical ? (
                              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                            )}
                            <span className="font-bold text-sm text-foreground">{item.req}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                            item.critical ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {item.critical ? 'Critical' : 'Recommended'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-violet-500/10 border border-primary/25 text-center my-8">
            <h2 className="text-2xl font-black text-foreground mb-3">Check All Requirements Automatically in 30 Seconds</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
              Skip hours of manual checking. Our free AI-powered scanner evaluates your website against all 40+ AdSense approval rules automatically.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/25">
                Check My Site Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

        </div>
      </article>

      <SiteFooter />
    </div>
  )
}

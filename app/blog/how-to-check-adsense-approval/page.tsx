import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Check AdSense Approval Status — Complete Guide',
  description: 'Learn how to check if your website is ready for Google AdSense approval. Step-by-step guide covering content requirements, policy compliance, and how to use a free AdSense approval checker.',
  keywords: ['how to check adsense approval', 'adsense approval checker', 'adsense approval status', 'check adsense eligibility'],
  alternates: { canonical: 'https://adsenseai.in/blog/how-to-check-adsense-approval' },
  openGraph: {
    type: 'article',
    title: 'How to Check AdSense Approval Status — Complete Guide',
    description: 'Learn how to check if your website is ready for Google AdSense approval.',
    url: 'https://adsenseai.in/blog/how-to-check-adsense-approval',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Check AdSense Approval Status — Complete Guide',
  description: 'Learn how to check if your website is ready for Google AdSense approval.',
  url: 'https://adsenseai.in/blog/how-to-check-adsense-approval',
  datePublished: '2025-01-01',
  dateModified: '2025-04-23',
  author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://adsenseai.in' },
  publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://adsenseai.in' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://adsenseai.in/blog/how-to-check-adsense-approval' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://adsenseai.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://adsenseai.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'How to Check AdSense Approval', item: 'https://adsenseai.in/blog/how-to-check-adsense-approval' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I check if my website is AdSense ready?', acceptedAnswer: { '@type': 'Answer', text: 'Use AdSenseAI\'s free AdSense approval checker. Enter your URL, wait 30 seconds, and get a score from 0-100 with specific fixes.' } },
    { '@type': 'Question', name: 'What score do I need to get AdSense approved?', acceptedAnswer: { '@type': 'Answer', text: 'A score of 70+ on AdSenseAI\'s checker indicates your site is likely ready for AdSense approval. Scores of 80+ have a high approval rate.' } },
    { '@type': 'Question', name: 'What does Google check for AdSense approval?', acceptedAnswer: { '@type': 'Answer', text: 'Google checks content quality, policy compliance, required pages (Privacy Policy, About, Contact), site structure, and SEO signals like H1 tags and meta descriptions.' } },
  ],
}

export default function HowToCheckAdsenseApproval() {
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
            How to Check AdSense Approval: The Complete Guide for 2025
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Getting approved for Google AdSense is one of the most important milestones for any blogger or publisher. But how do you know if your site is actually ready? This guide explains exactly how to check your AdSense approval readiness — and what to fix if you're not there yet.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-10 text-foreground">

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">What Does Google Check for AdSense Approval?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Google's AdSense review team evaluates your website across several key areas before approving your application. Understanding these criteria is the first step to passing the AdSense approval check.
            </p>
            <div className="space-y-3">
              {[
                { title: 'Content Quality', desc: 'Your articles must be original, well-written, and provide genuine value to readers. Thin content (under 300 words), copied articles, or keyword-stuffed pages will cause rejection.' },
                { title: 'Policy Compliance', desc: 'Your site must not contain adult content, dangerous content, or copyright violations. Google checks every page, not just your homepage.' },
                { title: 'Required Pages', desc: 'You must have a Privacy Policy, About page, and Contact page. These are non-negotiable for AdSense approval.' },
                { title: 'Site Structure & SEO', desc: 'Every page needs a clear H1 heading and meta description. Google wants to see a well-organised, navigable website.' },
                { title: 'Content Volume', desc: 'Most publishers need at least 20-30 quality articles before applying. A site with 5 posts is unlikely to get approved.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">How to Use an AdSense Approval Checker</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The fastest way to check your AdSense approval readiness is to use an automated AdSense approval checker tool. These tools crawl your website and score it against Google's known approval criteria.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              AdSenseAI is a free AdSense approval checker that scans your entire website in under 30 seconds. It checks all the criteria above and gives you a score from 0-100, along with specific fixes.
            </p>
            <div className="space-y-3 mb-6">
              {[
                'Enter your website URL in the checker',
                'Wait 30 seconds while the AI scans your site',
                'Review your AdSense readiness score (0-100)',
                'Follow the prioritised fix list',
                'Re-scan to confirm your score is 70+ before applying',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-black flex-shrink-0">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
            <Link href="/auth/signup">
              <Button className="gap-2 rounded-xl">
                Check Your AdSense Approval — Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Common Reasons AdSense Rejects Websites</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Understanding why AdSense rejects sites helps you fix issues before applying. Here are the most common rejection reasons:
            </p>
            <div className="space-y-3">
              {[
                { issue: 'Low Value Content', fix: 'Rewrite thin articles to 600+ words with original insights and examples.' },
                { issue: 'Missing Privacy Policy', fix: 'Create a Privacy Policy page at /privacy-policy. Use AdSenseAI\'s free generator.' },
                { issue: 'Insufficient Content', fix: 'Publish at least 25 quality articles before applying.' },
                { issue: 'Copyright Violations', fix: 'Remove any copied content and replace with original writing.' },
                { issue: 'Navigation Issues', fix: 'Ensure every page is reachable from your homepage within 2 clicks.' },
              ].map(item => (
                <div key={item.issue} className="flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground text-sm">{item.issue}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed"><span className="font-semibold text-emerald-600 dark:text-emerald-400">Fix:</span> {item.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">What Score Do You Need to Get AdSense Approved?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Based on our analysis of thousands of sites, here's what different AdSense readiness scores mean:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { range: '80-100', label: 'Ready to Apply', color: 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-300', desc: 'Your site meets AdSense requirements. Apply now.' },
                { range: '60-79', label: 'Almost Ready', color: 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-300', desc: 'Fix the high-priority issues first, then apply.' },
                { range: '0-59', label: 'Not Ready', color: 'border-red-300 bg-red-50/50 dark:bg-red-950/20', text: 'text-red-700 dark:text-red-300', desc: 'Significant work needed. Follow the action plan.' },
              ].map(s => (
                <div key={s.range} className={`p-4 rounded-xl border-2 ${s.color}`}>
                  <p className={`text-2xl font-black ${s.text}`}>{s.range}</p>
                  <p className={`text-sm font-bold ${s.text} mb-1`}>{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-black text-foreground mb-2">Check Your AdSense Approval Score — Free</h2>
            <p className="text-sm text-muted-foreground mb-4">
              AdSenseAI is the most accurate free AdSense approval checker available. Get your score in 30 seconds and a personalised fix list.
            </p>
            <Link href="/auth/signup">
              <Button className="gap-2 rounded-xl">
                Start Free AdSense Check <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

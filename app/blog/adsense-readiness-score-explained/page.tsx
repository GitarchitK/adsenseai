import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AdSense Readiness Score Explained — What Your Score Means',
  description: 'What does your AdSense readiness score mean? Learn how AdSense Checker AI calculates your score, what each category measures, and what score you need to get approved.',
  keywords: ['adsense readiness score', 'adsense approval score', 'adsense score explained', 'adsense checker score', 'adsensechecker.in score'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/adsense-readiness-score-explained' },
  openGraph: { type: 'article', title: 'AdSense Readiness Score Explained — What Your Score Means', url: 'https://www.adsensechecker.in/blog/adsense-readiness-score-explained', siteName: 'AdSense Approval Checker AI' },
}

const schemas = [
  {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: 'AdSense Readiness Score Explained — What Your Score Means',
    url: 'https://www.adsensechecker.in/blog/adsense-readiness-score-explained',
    datePublished: '2025-04-24', dateModified: '2025-04-24',
    author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
    publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
      { '@type': 'ListItem', position: 3, name: 'AdSense Readiness Score Explained', item: 'https://www.adsensechecker.in/blog/adsense-readiness-score-explained' },
    ],
  },
]

const categories = [
  { name: 'Content Quality', weight: '35%', desc: 'The most important factor. Measures originality, readability, depth, and spam score of your articles. Low-quality or thin content is the #1 reason AdSense rejects sites.', improve: 'Write 600+ word articles with original insights. Avoid keyword stuffing. Add personal experience and examples.' },
  { name: 'Policy Compliance', weight: '30%', desc: 'Checks for adult content, copyright violations, dangerous content, and policy violations. Any critical violation here will cause automatic rejection regardless of other scores.', improve: 'Remove any copied content. Avoid adult or controversial topics. Ensure all content follows Google\'s AdSense Program Policies.' },
  { name: 'SEO Performance', weight: '15%', desc: 'Evaluates H1 tags, meta descriptions, site structure, and topical authority. Good SEO signals show Google your site is professionally managed.', improve: 'Add H1 headings to every page. Write unique meta descriptions. Build internal links between related articles.' },
  { name: 'User Experience', weight: '10%', desc: 'Measures navigation clarity, internal linking, content structure, and how easy your site is to use. Poor UX signals a low-quality site to Google\'s reviewers.', improve: 'Add clear navigation. Link related articles. Ensure your site works on mobile. Fix broken links.' },
  { name: 'Trust Signals', weight: '10%', desc: 'Checks for required pages (Privacy Policy, About, Contact, Terms, Disclaimer) and other trust indicators. Missing required pages causes instant rejection.', improve: 'Create all 5 required pages. Add author bios to articles. Cite sources when making factual claims.' },
]

export default function AdsenseReadinessScoreExplained() {
  return (
    <div className="min-h-screen bg-background">
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">Score Guide</div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">AdSense Readiness Score Explained — What Your Score Means</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">After scanning your website, AdSense Checker AI gives you a score from 0-100. Here's exactly how that score is calculated, what each category means, and what you need to do to improve it.</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-10 text-foreground">

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">The Scoring Formula</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Your AdSense readiness score is calculated using a weighted formula based on the same criteria Google's reviewers evaluate:</p>
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/60 font-mono text-sm text-center">
              <p className="text-foreground font-bold">Final Score =</p>
              <p className="text-muted-foreground mt-2">(Content × 0.35) + (Policy × 0.30) + (SEO × 0.15) + (UX × 0.10) + (Trust × 0.10)</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">Content quality has the highest weight (35%) because it's the most common reason for AdSense rejection. Policy compliance is second (30%) because violations cause automatic rejection.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-6">What Each Category Measures</h2>
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat.name} className="p-5 rounded-2xl border border-border/60 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-foreground">{cat.name}</h3>
                    <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{cat.weight}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{cat.desc}</p>
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">How to Improve</p>
                    <p className="text-xs text-foreground leading-relaxed">{cat.improve}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">What Your Score Means</h2>
            <div className="space-y-3">
              {[
                { range: '80-100', status: 'High Chance', meaning: 'Your site meets AdSense requirements. Apply now at adsense.google.com.', color: 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20' },
                { range: '70-79', status: 'Good', meaning: 'Strong site. Fix any remaining high-priority issues, then apply.', color: 'border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10' },
                { range: '60-69', status: 'Moderate', meaning: 'Potential detected. Fix the high-impact issues before applying.', color: 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' },
                { range: '40-59', status: 'Needs Work', meaning: 'Multiple issues found. Follow the 30-day action plan before applying.', color: 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/20' },
                { range: '0-39', status: 'Not Ready', meaning: 'Critical issues found. Applying now will result in rejection. Fix all critical issues first.', color: 'border-red-300 bg-red-50/50 dark:bg-red-950/20' },
              ].map(s => (
                <div key={s.range} className={`p-4 rounded-xl border-2 ${s.color} flex items-start gap-4`}>
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-black text-foreground">{s.range}</p>
                    <p className="text-[10px] font-bold text-muted-foreground">{s.status}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.meaning}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="font-bold text-foreground mb-2">Check Your Score Now — Free</p>
            <p className="text-sm text-muted-foreground mb-4">Get your AdSense readiness score in 30 seconds. See exactly which categories need improvement.</p>
            <Link href="/auth/signup"><Button className="gap-2 rounded-xl">Get My Score — Free <ArrowRight className="h-4 w-4" /></Button></Link>
          </section>

          <div className="flex gap-4 pt-4 border-t border-border/60 flex-wrap">
            <Link href="/blog/how-to-use-adsense-checker-ai" className="text-sm text-primary hover:underline">← How to Use the Tool</Link>
            <Link href="/blog/adsense-approval-requirements" className="text-sm text-primary hover:underline ml-auto">AdSense Requirements →</Link>
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

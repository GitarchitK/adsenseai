import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, BarChart3, FileText, Calendar } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Use AdSense Checker AI — Step-by-Step Guide',
  description: 'Learn how to use AdSense Checker AI to check your website\'s AdSense approval readiness. Step-by-step guide covering the scan process, reading your report, and fixing issues.',
  keywords: ['how to use adsense checker ai', 'adsense checker tutorial', 'adsense approval checker guide', 'adsensechecker.in tutorial'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/how-to-use-adsense-checker-ai' },
  openGraph: { type: 'article', title: 'How to Use AdSense Checker AI — Step-by-Step Guide', url: 'https://www.adsensechecker.in/blog/how-to-use-adsense-checker-ai', siteName: 'AdSense Approval Checker AI' },
}

const schemas = [
  {
    '@context': 'https://schema.org', '@type': 'HowTo',
    name: 'How to Use AdSense Checker AI',
    description: 'Step-by-step guide to checking your website\'s AdSense approval readiness using AdSense Checker AI.',
    url: 'https://www.adsensechecker.in/blog/how-to-use-adsense-checker-ai',
    step: [
      { '@type': 'HowToStep', name: 'Create a free account', text: 'Go to adsensechecker.in and sign up with Google. It takes 10 seconds and no credit card is required.' },
      { '@type': 'HowToStep', name: 'Enter your website URL', text: 'Type your website URL in the input box on the dashboard. Include the full URL (e.g. https://yourblog.com).' },
      { '@type': 'HowToStep', name: 'Wait for the scan', text: 'Our AI crawls your website and analyzes up to 60 pages. This takes 20-30 seconds.' },
      { '@type': 'HowToStep', name: 'Review your score', text: 'You\'ll see a readiness score from 0-100 with a breakdown by category: Content, Policy, SEO, UX, and Trust.' },
      { '@type': 'HowToStep', name: 'Fix the issues', text: 'The Overview tab shows your top issues for free. Unlock the Fix List for ₹19 to see specific, page-by-page fixes.' },
      { '@type': 'HowToStep', name: 'Re-scan and apply', text: 'After fixing issues, run a new scan to confirm your score is 70+. Then apply to Google AdSense.' },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: 'How to Use AdSense Checker AI — Step-by-Step Guide',
    url: 'https://www.adsensechecker.in/blog/how-to-use-adsense-checker-ai',
    datePublished: '2025-04-24', dateModified: '2025-04-24',
    author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
    publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
      { '@type': 'ListItem', position: 3, name: 'How to Use AdSense Checker AI', item: 'https://www.adsensechecker.in/blog/how-to-use-adsense-checker-ai' },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Is AdSense Checker AI free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AdSense Checker AI offers a free plan with 5 scans per month. The free scan gives you a full overview report including your readiness score, compliance checklist, and top issues. The detailed fix list and action plan are available for a one-time ₹19 unlock.' } },
      { '@type': 'Question', name: 'How long does an AdSense Checker AI scan take?', acceptedAnswer: { '@type': 'Answer', text: 'A scan typically takes 20-30 seconds. The tool crawls up to 60 pages of your website simultaneously and runs 7 AI analysis modules in parallel.' } },
      { '@type': 'Question', name: 'What does AdSense Checker AI check?', acceptedAnswer: { '@type': 'Answer', text: 'AdSense Checker AI checks: content quality (originality, readability, spam), policy compliance (adult content, copyright, violations), required pages (Privacy Policy, About, Contact), SEO signals (H1 tags, meta descriptions), trust signals, E-E-A-T, and monetization potential.' } },
    ],
  },
]

const steps = [
  {
    n: '01',
    title: 'Create Your Free Account',
    desc: 'Go to adsensechecker.in and click "Get Started Free". Sign in with your Google account — it takes 10 seconds. No credit card required.',
    detail: 'Your account gives you 5 free scans per month. Each scan analyzes your full website and gives you a readiness score.',
  },
  {
    n: '02',
    title: 'Enter Your Website URL',
    desc: 'On your dashboard, type your website URL in the input box. You can enter just the domain (e.g. yourblog.com) or the full URL.',
    detail: 'The tool automatically discovers your sitemap and crawls up to 60 pages. For Pro users, it crawls up to 150 pages.',
  },
  {
    n: '03',
    title: 'Wait 30 Seconds for the AI Scan',
    desc: 'Our AI runs 7 analysis modules simultaneously: Content Quality, Policy Compliance, Trust & UX, E-E-A-T, SEO Authority, Technical Health, and Monetization Potential.',
    detail: 'The scan reads your actual article content — not just surface signals. It evaluates originality, readability, and policy compliance the same way Google does.',
  },
  {
    n: '04',
    title: 'Read Your Readiness Score',
    desc: 'You\'ll see a score from 0-100 with a breakdown by category. The score is calculated using the same weighted formula Google uses: Content (35%), Policy (30%), SEO (15%), UX (10%), Trust (10%).',
    detail: 'Scores of 70+ indicate your site is likely ready to apply. Scores below 60 mean significant work is needed.',
  },
  {
    n: '05',
    title: 'Review the Overview Tab',
    desc: 'The Overview tab is free and shows: your score breakdown, compliance checklist (Privacy Policy, About, Contact, Terms, Disclaimer), article count, and top issues found.',
    detail: 'Even without paying, you can see exactly which required pages are missing and which issues are most critical.',
  },
  {
    n: '06',
    title: 'Unlock the Fix List (₹19)',
    desc: 'The Fix List tab shows every specific issue found on your site — with exact page URLs, what\'s wrong, and how to fix it. This is where the real value is.',
    detail: 'Unlike generic advice, every fix references your actual site. For example: "8 pages under 300 words — expand /blog/post-1, /blog/post-2..." with specific instructions.',
  },
  {
    n: '07',
    title: 'Follow the Action Plan',
    desc: 'The Action Plan tab gives you a 30-day roadmap specific to your site. It references your actual domain, actual scores, and actual issues — not a generic template.',
    detail: 'The plan is generated by AI after analyzing your full site. It tells you exactly what to do each week to reach a 70+ score.',
  },
  {
    n: '08',
    title: 'Re-Scan and Apply to AdSense',
    desc: 'After fixing your issues, run a new scan to confirm your score has improved. Once you hit 70+, apply to Google AdSense at adsense.google.com.',
    detail: 'You can run up to 5 free scans per month to track your progress. Pro users get 200 scans per month.',
  },
]

const tabs = [
  { icon: BarChart3, name: 'Overview Tab', desc: 'Free. Shows your readiness score, compliance checklist, article count, and top issues. Real AI data — not estimates.' },
  { icon: FileText, name: 'Fix List Tab', desc: '₹19 unlock. Every specific issue with exact page URLs and step-by-step fixes. Sorted by priority: critical → high → medium → low.' },
  { icon: Calendar, name: 'Action Plan Tab', desc: '₹19 unlock. A 30-day roadmap specific to your site. Week-by-week steps referencing your actual domain and issues.' },
  { icon: FileText, name: 'Pages Tab', desc: 'Free. Shows all crawled pages with health scores. Flags missing H1 tags, meta descriptions, and thin content.' },
]

export default function HowToUseAdsenseCheckerAI() {
  return (
    <div className="min-h-screen bg-background">
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">Tutorial</div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">How to Use AdSense Checker AI — Complete Step-by-Step Guide</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">AdSense Checker AI scans your website in 30 seconds and tells you exactly what's blocking your AdSense approval. Here's how to use it to get the most out of every scan.</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-10 text-foreground">

          <section>
            <h2 className="text-2xl font-black text-foreground mb-6">8 Steps to Check Your AdSense Readiness</h2>
            <div className="space-y-4">
              {steps.map(step => (
                <div key={step.n} className="p-5 rounded-2xl border border-border/60 bg-muted/20">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl font-black text-primary/20 leading-none flex-shrink-0">{step.n}</span>
                    <div>
                      <h3 className="font-black text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">{step.desc}</p>
                      <p className="text-xs text-muted-foreground/70 leading-relaxed italic">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Understanding the 4 Report Tabs</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {tabs.map(({ icon: Icon, name, desc }) => (
                <div key={name} className="p-4 rounded-xl border border-border/60 bg-muted/20 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"><Icon className="h-4 w-4" /></div>
                  <div><p className="font-bold text-foreground text-sm">{name}</p><p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">What Score Do You Need?</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { score: '70-100', label: 'Apply Now', desc: 'Your site meets AdSense requirements. Submit your application.', color: 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' },
                { score: '50-69', label: 'Fix First', desc: 'Fix the high-priority issues, then apply in 1-2 weeks.', color: 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' },
                { score: '0-49', label: 'Needs Work', desc: 'Significant issues found. Follow the 30-day action plan.', color: 'border-red-300 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300' },
              ].map(s => (
                <div key={s.score} className={`p-4 rounded-xl border-2 ${s.color}`}>
                  <p className="text-xl font-black">{s.score}</p>
                  <p className="text-xs font-bold mt-1 mb-1">{s.label}</p>
                  <p className="text-[11px] opacity-80 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-black text-foreground mb-2">Start Your Free Scan Now</h2>
            <p className="text-sm text-muted-foreground mb-4">No credit card. No setup. Get your AdSense readiness score in 30 seconds.</p>
            <Link href="/auth/signup"><Button className="gap-2 rounded-xl">Check My Website — Free <ArrowRight className="h-4 w-4" /></Button></Link>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {schemas[3].mainEntity.map((faq: { name: string; acceptedAnswer: { text: string } }) => (
                <div key={faq.name} className="p-4 rounded-xl border border-border/60 bg-muted/20">
                  <p className="font-bold text-foreground text-sm mb-1">{faq.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-4 pt-4 border-t border-border/60 flex-wrap">
            <Link href="/blog/adsense-approval-checker-tool-free" className="text-sm text-primary hover:underline">← Free Checker Tool</Link>
            <Link href="/blog/how-to-check-adsense-approval" className="text-sm text-primary hover:underline ml-auto">How to Check Approval →</Link>
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}

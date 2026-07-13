import { Navbar } from '@/components/navbar'
import { LandingCTA } from '@/components/landing-cta'
import { SiteFooter } from '@/components/site-footer'
import { HeroScanInput } from '@/components/hero-scan-input'
import { InteractiveEstimator } from '@/components/interactive-estimator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  BarChart3, Shield, Sparkles, CheckCircle2,
  Brain, Search, FileText, Star,
  TrendingUp, Clock, Lock, ArrowRight,
  AlertCircle, Crown, DollarSign, Wallet,
  Check, ChevronRight, Activity, Zap, SearchCode,
  Layers, ShieldCheck, ListTodo, BookOpen, FileCheck2
} from 'lucide-react'
import { FadeIn, StaggerChildren, StaggerItem, HoverLift } from '@/components/landing-animations'

export const metadata: Metadata = {
  title: 'Free AdSense Approval Checker & Site Audit (AdSense Check)',
  description: 'Use our free Google AdSense approval checker and eligibility checker to run a complete AdSense audit. Find exact issues blocking your application in 60 seconds.',
  keywords: ['adsense check', 'google adsense approval checker', 'adsense audit', 'adsense eligibility checker', 'adsense checker ai'],
  alternates: { canonical: 'https://www.adsensechecker.in' },
}

const HOMEPAGE_FAQ = [
  { q: "How long does Google AdSense approval take in 2026?", a: "Google AdSense approval typically takes 2 to 4 weeks in 2026. However, sites with thin content, missing privacy pages, or policy violations are rejected within 3 days. Use AdSense Checker AI to identify and fix issues before applying, reducing the review cycle to a single attempt." },
  { q: "How many posts do I need for AdSense approval?", a: "Google does not publish a minimum post count, but approved sites typically have 15-30 posts with an average of 800-1200 words each. More important than quantity is posting consistency — sites with gaps longer than 45 days between posts are frequently rejected for appearing inactive." },
  { q: "Why does Google AdSense keep rejecting my website?", a: "The top 5 reasons AdSense rejects websites are: (1) insufficient or thin content under 500 words per page, (2) missing Privacy Policy page, (3) content violating AdSense policies such as health claims or financial advice, (4) poor Core Web Vitals scores, and (5) site appears new with less than 3 months of content history." },
  { q: "What is the minimum traffic required for AdSense approval?", a: "Google AdSense has no official minimum traffic requirement. Sites with as few as 50 daily visitors have been approved when content quality is high. However, sites with very low traffic are scrutinised more carefully for content quality and policy compliance." },
  { q: "Does website age matter for AdSense approval?", a: "Google recommends websites be at least 6 months old before applying, though this is a guideline rather than a hard rule. In some countries including India and China, a 6-month minimum is enforced. More important than age is a consistent publishing history showing the site is actively maintained." },
  { q: "Can I use AdSense on a free blog or subdomain?", a: "AdSense no longer approves free subdomains from platforms like Blogger.com or WordPress.com for new accounts. You need a custom domain (e.g., yourblog.com) to apply. Existing accounts approved before policy changes may continue to use subdomains." },
  { q: "What pages are required for AdSense approval?", a: "Google AdSense requires four pages at minimum: (1) Privacy Policy that discloses data collection and ad personalisation, (2) About page establishing site ownership and purpose, (3) Contact page with working contact information, and (4) Terms of Service. Missing even one of these is an immediate rejection trigger." },
  { q: "How do I check if my site is ready for AdSense?", a: "The fastest way to check AdSense readiness is to use an automated checker that analyses your content quality, policy compliance, technical setup, and Core Web Vitals. AdSense Checker AI performs this check in under 60 seconds and returns a readiness score from 0-100 with specific issues and fixes." },
]

const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "AdSense Checker AI",
      applicationCategory: "WebApplication",
      operatingSystem: "Web Browser",
      description: "AI-powered Google AdSense approval checker. Analyses your website and identifies the exact issues blocking your AdSense application.",
      url: "https://www.adsensechecker.in",
      author: { "@type": "Person", name: "Archit Karmakar", jobTitle: "AdSense Expert", url: "https://www.adsensechecker.in/about" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR", description: "Free site check with optional full report unlock" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "1240", bestRating: "5" },
    },
    {
      "@type": "FAQPage",
      mainEntity: HOMEPAGE_FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />
      <Navbar />

      <main className="flex min-h-screen flex-col overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 mesh-bg opacity-40 dark:opacity-60 pointer-events-none" />
          <div className="absolute inset-0 dot-grid-anim opacity-50 dark:opacity-30 pointer-events-none" />
          
          <div className="container relative z-10 px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <FadeIn className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8">
                  <Sparkles className="h-3.5 w-3.5" /> AdSense Intelligence Platform
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 gradient-text">
                  Stop Guessing. Get Approved.
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Comprehensive <strong>website analysis</strong> and <strong>AdSense eligibility auditing</strong>. 
                  We deep-crawl your entire site to detect <strong>thin content</strong>, <strong>policy violations</strong>, and structural errors before you apply.
                </p>

                <div className="max-w-xl mx-auto lg:mx-0 bg-background/50 dark:bg-background/20 backdrop-blur-md border border-border p-2 rounded-2xl shadow-xl glow">
                  <HeroScanInput />
                </div>
                
                <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free comprehensive audit
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 60-second deep scan
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <InteractiveEstimator />
              </FadeIn>

            </div>
          </div>
        </section>

        {/* LOGO CLOUD / METRICS */}
        <section className="py-10 border-y border-border/50 bg-muted/20">
          <div className="container px-4 mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-3 font-black text-xl text-foreground">
                <SearchCode className="h-6 w-6 text-primary" /> 10M+ Pages Crawled
              </div>
              <div className="flex items-center gap-3 font-black text-xl text-foreground">
                <Crown className="h-6 w-6 text-amber-500" /> 5,000+ Approvals
              </div>
              <div className="flex items-center gap-3 font-black text-xl text-foreground">
                <Zap className="h-6 w-6 text-emerald-500" /> 98% Success Rate
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section className="py-24 relative overflow-hidden bg-background">
          <div className="container px-4 mx-auto relative z-10">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Enterprise-Grade Website Analysis</h2>
              <p className="text-lg text-muted-foreground">
                Our proprietary scanning engine acts exactly like Google's crawlers, analyzing every facet of your website to evaluate compliance.
              </p>
            </FadeIn>

            <StaggerChildren className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Feature 1 - Large */}
              <StaggerItem className="md:col-span-2 glass-panel p-8 rounded-3xl lift group overflow-hidden relative">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                <Brain className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-black mb-3">AI Content Originality Engine</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  We scan every article for <strong>AI-generated patterns</strong>, <strong>thin content</strong>, and <strong>plagiarism</strong>. We verify that your content depth meets AdSense's strict <strong>"Valuable Inventory"</strong> standards.
                </p>
              </StaggerItem>

              {/* Feature 2 */}
              <StaggerItem className="glass-panel p-8 rounded-3xl lift group relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-700" />
                <Shield className="h-12 w-12 text-amber-500 mb-6" />
                <h3 className="text-2xl font-black mb-3">Policy Enforcement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Instant detection of banned keywords, restricted niches, and missing mandatory policies.
                </p>
              </StaggerItem>

              {/* Feature 3 */}
              <StaggerItem className="glass-panel p-8 rounded-3xl lift group relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700" />
                <Activity className="h-12 w-12 text-emerald-500 mb-6" />
                <h3 className="text-2xl font-black mb-3">Deep Structure Crawl</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Verifies broken links, navigation structures, and Ads.txt implementation across your entire sitemap.
                </p>
              </StaggerItem>

              {/* Feature 4 - Large */}
              <StaggerItem className="md:col-span-2 glass-panel p-8 rounded-3xl lift group overflow-hidden relative">
                <div className="absolute top-1/2 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 -translate-y-1/2" />
                <BarChart3 className="h-12 w-12 text-blue-500 mb-6" />
                <h3 className="text-2xl font-black mb-3">Actionable Master Report</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  Get a prioritized, step-by-step roadmap to fix all identified issues. We don't just find problems, we generate the exact fixes needed for approval.
                </p>
              </StaggerItem>

            </StaggerChildren>
          </div>
        </section>

        {/* COMPLIANCE PILLARS */}
        <section className="py-24 bg-muted/20 border-t border-border/50 relative overflow-hidden">
          <div className="container px-4 mx-auto max-w-6xl relative z-10">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Auditing Framework
              </div>
              <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">The 4 Pillars of AdSense Compliance</h2>
              <p className="text-lg text-muted-foreground">
                Our crawler analyzes over 40+ signals across four core dimensions to match the exact evaluation criteria used by Google AdSense quality reviewers.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "1. Content Depth & Value",
                  icon: FileText,
                  desc: "Google rejects sites with thin or non-original articles. We verify writing patterns and density.",
                  checks: [
                    "Average article length > 800 words",
                    "Keyword stuffing & density check",
                    "Semantic heading hierarchy (H1-H4)",
                    "Text-to-HTML code ratio audit"
                  ]
                },
                {
                  title: "2. Site Architecture",
                  icon: Layers,
                  desc: "Reviewers must easily navigate your site. We map sitemap crawlability and link safety.",
                  checks: [
                    "Depth of sitemap internal links",
                    "Detection of 404 & broken links",
                    "Menu layout accessibility check",
                    "Breadcrumbs schema verification"
                  ]
                },
                {
                  title: "3. Trust & Editorial Signals",
                  icon: ShieldCheck,
                  desc: "Google requires indicators of editorial responsibility and standard legal compliance.",
                  checks: [
                    "Required legal pages (Privacy, About)",
                    "Contact email & form accessibility",
                    "Author attribution & E-E-A-T signals",
                    "SSL/TLS secure connection check"
                  ]
                },
                {
                  title: "4. Policy & Monetization",
                  icon: Activity,
                  desc: "We screen content against restricted niches and technical monetization setup rules.",
                  checks: [
                    "Restricted niche keywords scan",
                    "Valuable Inventory error flags",
                    "Ads.txt publisher code check",
                    "Mobile speed & responsiveness"
                  ]
                }
              ].map((p, i) => (
                <FadeIn key={i} delay={i * 0.1} className="bg-background border border-border/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                  <ul className="space-y-2 border-t border-border/40 pt-4">
                    {p.checks.map((c, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-xs font-semibold text-foreground/80">
                        <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* PRE-FLIGHT CHECKLIST */}
        <section className="py-24 bg-background border-t border-border/50">
          <div className="container px-4 mx-auto max-w-5xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                <ListTodo className="h-3.5 w-3.5" /> Self-Audit List
              </div>
              <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">Pre-Flight AdSense Checklist</h2>
              <p className="text-lg text-muted-foreground">
                Before submitting your site to Google, verify that you meet these critical technical and editorial requirements.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <FileCheck2 className="h-5 w-5 text-primary" /> Technical & Structure Check
                </h3>
                {[
                  { title: "XML Sitemap & Robots.txt", desc: "Ensure your sitemap is submitted to Google Search Console and Robots.txt does not block crawlers." },
                  { title: "Mobile Responsive Navigation", desc: "Your site navigation must be easy to use on mobile devices without overlapping elements or broken drop-downs." },
                  { title: "Core Web Vitals Compliance", desc: "LCP (Largest Contentful Paint) under 2.5s and CLS (Cumulative Layout Shift) under 0.1 to pass speed quality checks." },
                  { title: "Clean URL Structures", desc: "Use human-readable slugs (e.g. /how-to-xyz) instead of query parameters (e.g. ?p=123) for all articles." }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-border/60 bg-muted/10 hover:bg-muted/20 transition-all">
                    <h4 className="font-bold text-sm text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Trust & Compliance Check
                </h3>
                {[
                  { title: "Standard Mandatory Pages", desc: "Create working Privacy Policy, Terms of Service, About Us, and Contact Us pages linked in the footer." },
                  { title: "Active SSL/TLS Certificate", desc: "Your site must load securely over HTTPS. Google reviewers will immediately flag insecure sites." },
                  { title: "E-E-A-T & Author Signals", desc: "Include author bios, editorial policies, and visible contact details to establish site legitimacy." },
                  { title: "Cookie Consent & GDPR", desc: "If targeting European traffic, a compliant cookie banner must be active to meet AdSense consent policies." }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-border/60 bg-muted/10 hover:bg-muted/20 transition-all">
                    <h4 className="font-bold text-sm text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EEAT EXPLAINER */}
        <section className="py-24 bg-muted/20 border-t border-border/50 relative overflow-hidden">
          <div className="container px-4 mx-auto max-w-5xl relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <FadeIn className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                  <BookOpen className="h-3.5 w-3.5" /> Editorial Standards
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                  Demystifying "Low Value Content"
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Over 70% of AdSense rejections are due to "Low Value Content." Google does not just count words; their quality evaluators search for original insights, hands-on experience, and editorial trustworthiness.
                </p>
                <div className="space-y-4 pt-2">
                  {[
                    { title: "Original Research", text: "Articles must provide unique perspectives, statistics, or analyses not found on other search results." },
                    { title: "Clear Authority", text: "Demonstrate who wrote the content, their credentials, and why they are qualified to write on the subject." }
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{benefit.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{benefit.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn className="lg:col-span-7 bg-background border border-border/80 p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold text-foreground mb-4">AdSense Content Audit Matrix</h3>
                <div className="space-y-4">
                  {[
                    { status: "Rejected", label: "Thin Content", desc: "Short articles (<500 words), rewrites of Wikipedia, or mass-produced AI content without human curation." },
                    { status: "Flagged", label: "Scraped Content", desc: "Aggregating news RSS feeds, scraping directory pages, or republishing press releases without value addition." },
                    { status: "Approved", label: "High-Value Inventory", desc: "In-depth tutorials, original case studies, and structured guides featuring unique images, code blocks, or data sets." }
                  ].map((row, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border/40 hover:bg-muted/10 transition-colors">
                      <div className="sm:w-28 shrink-0">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          row.status === 'Flagged' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {row.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{row.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* DIAGNOSTIC MATRIX */}
        <section className="py-24 bg-background border-t border-border/50">
          <div className="container px-4 mx-auto max-w-5xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Diagnostic Intelligence
              </div>
              <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">Common Rejections & Fixes</h2>
              <p className="text-lg text-muted-foreground">
                Understand the real reasons behind cryptic AdSense rejection emails and how our platform helps you resolve them.
              </p>
            </FadeIn>

            <div className="border border-border/60 rounded-3xl overflow-hidden shadow-xl bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <caption className="sr-only">Common Google AdSense Rejections, Causes, and AI Auditing Fixes</caption>
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/60 text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <th className="p-4 sm:p-5">Google Rejection Message</th>
                      <th className="p-4 sm:p-5">Real Root Cause</th>
                      <th className="p-4 sm:p-5">How AdSense Checker AI Resolves It</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {[
                      {
                        msg: "Low Value Content",
                        cause: "Articles lack structural depth, contain less than 600 words, or replicate common topics without original research.",
                        fix: "Identifies thin articles below word thresholds and highlights lack of unique entity density to fix editorial depth."
                      },
                      {
                        msg: "Valuable Inventory: Under Construction",
                        cause: "Broken internal links, empty navigation categories, placeholder text, or new/incomplete pages in sitemap.",
                        fix: "Full sitemap crawl flags category pages without content, dead links, and stub categories instantly."
                      },
                      {
                        msg: "Missing Required Policies",
                        cause: "Google cannot verify commercial trust. Missing privacy disclosure, user consent, or ownership pages.",
                        fix: "Scans sitemap metadata to check presence of Privacy Policy, Terms, About, and Contact pages."
                      },
                      {
                        msg: "Site Does Not Comply with Policies",
                        cause: "Content belongs to restricted categories (health claims without medical backing, finance advice, or scraped content).",
                        fix: "AI policy engine screens all site text for forbidden terms and policy violation risks before review submission."
                      }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 sm:p-5 font-bold text-primary align-top min-w-[150px]">
                          {row.msg}
                        </td>
                        <td className="p-4 sm:p-5 text-muted-foreground leading-relaxed align-top">
                          {row.cause}
                        </td>
                        <td className="p-4 sm:p-5 font-semibold text-foreground/90 leading-relaxed align-top">
                          {row.fix}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 relative bg-muted/30 border-t border-border/50">
          <div className="container px-4 mx-auto relative z-10 max-w-5xl">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">From Scan to Approval</h2>
            </FadeIn>

            <StaggerChildren className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: Search, title: 'Deep Scan', desc: 'Enter your URL. Our crawler analyzes your entire sitemap in under 60 seconds.' },
                { step: '02', icon: FileText, title: 'Review Report', desc: 'Get a comprehensive audit of your content depth, policies, and site structure.' },
                { step: '03', icon: DollarSign, title: 'Apply & Earn', desc: 'Fix the highlighted issues using our AI tools and apply with 100% confidence.' }
              ].map((s, i) => (
                <StaggerItem key={i} className="relative">
                  <div className="text-[120px] font-black text-foreground/5 absolute -top-16 -left-4 select-none pointer-events-none">{s.step}</div>
                  <HoverLift className="bg-background border border-border p-8 rounded-3xl relative z-10 h-full shadow-lg">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                    <p className="text-muted-foreground">{s.desc}</p>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* FAQ SECTION (PRESERVED CONTENT) */}
        <section className="py-24 bg-background">
          <div className="container px-4 mx-auto max-w-4xl">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Frequently Asked Questions</h2>
            </FadeIn>
            <div className="grid gap-4">
              {HOMEPAGE_FAQ.map((faq, idx) => (
                <FadeIn key={idx} delay={idx * 0.1} className="bg-muted/30 border border-border p-6 rounded-2xl hover:bg-muted/50 transition-colors">
                  <h3 className="font-bold text-lg mb-2 text-foreground flex gap-3">
                    <span className="text-primary mt-1"><CheckCircle2 className="h-5 w-5" /></span> {faq.q}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed pl-8">{faq.a}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <LandingCTA />
      </main>

      <SiteFooter />
    </>
  )
}

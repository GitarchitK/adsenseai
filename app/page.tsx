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
  Check, ChevronRight, Activity, Zap, SearchCode
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
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 mesh-bg opacity-40 dark:opacity-60 pointer-events-none" />
          <div className="absolute inset-0 dot-grid-anim opacity-50 dark:opacity-30 pointer-events-none" />
          
          <div className="container relative z-10 px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <FadeIn className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8">
                  <Sparkles className="h-3.5 w-3.5" /> AdSense Intelligence Platform
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.1] mb-6">
                  Stop Guessing. <br />
                  <span className="gradient-text">Get Approved.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Comprehensive website analysis and AdSense eligibility auditing. 
                  We deep-crawl your entire site to detect thin content, policy violations, and structural errors before you apply.
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
              <h2 className="text-3xl md:text-5xl font-black mb-6">Enterprise-Grade <br/>Website Analysis</h2>
              <p className="text-lg text-muted-foreground">
                Our proprietary scanning engine acts exactly like Google's crawlers, analyzing every facet of your website to guarantee compliance.
              </p>
            </FadeIn>

            <StaggerChildren className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Feature 1 - Large */}
              <StaggerItem className="md:col-span-2 glass-panel p-8 rounded-3xl lift group overflow-hidden relative">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                <Brain className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-black mb-3">AI Content Originality Engine</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  We scan every article for AI-generated patterns, thin content, and plagiarism. We guarantee your content depth meets AdSense's strict "Valuable Inventory" standards.
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

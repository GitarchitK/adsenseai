import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { AuthorBox } from '@/components/author-box'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BarChart3, Shield, Sparkles, CheckCircle2,
  Brain, Search, FileText, Star,
  TrendingUp, Clock, Lock, ArrowRight,
  AlertCircle, Crown, DollarSign, Wallet,
  Check, ChevronRight, Activity, Zap, SearchCode,
  Layers, ShieldCheck, ListTodo, BookOpen, FileCheck2, Globe, Tag
} from 'lucide-react'
import { FadeIn, StaggerChildren, StaggerItem, HoverLift } from '@/components/landing-animations'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AdSense Approval Guides & Publisher Insights — AdSense Checker AI',
  description: 'Complete guides on Google AdSense approval, fixing "Low Value Content" rejections, high CPC niches, and website monetization strategies.',
  keywords: ['adsense approval blog', 'adsense guides', 'how to fix low value content', 'adsense approval requirements 2026', 'high cpc niches'],
  alternates: { canonical: 'https://www.adsensechecker.in' },
}

const FEATURED_GUIDES = [
  {
    slug: 'adsense-low-value-content-fix',
    title: 'How to Fix "Low Value Content" in AdSense (Step-by-Step)',
    excerpt: 'Low Value Content causes over 70% of AdSense rejections. Learn what Google raters look for and follow our 5-step fix blueprint.',
    category: 'Policy Fix',
    readTime: '12 min read',
    date: 'July 14, 2026',
    featured: true,
  },
  {
    slug: 'adsense-approval-requirements',
    title: 'Google AdSense Approval Requirements 2026: Master Checklist',
    excerpt: 'Complete checklist of technical, content depth, E-E-A-T, and legal page requirements Google evaluates before approving sites.',
    category: 'Checklist',
    readTime: '10 min read',
    date: 'July 14, 2026',
    featured: true,
  },
  {
    slug: 'why-adsense-keeps-rejecting-my-site',
    title: 'Why AdSense Keeps Rejecting Your Site (And Exact Fixes)',
    excerpt: 'Decode vague rejection emails. We break down the top 8 official reasons Google rejects applications with resolution steps.',
    category: 'Troubleshooting',
    readTime: '11 min read',
    date: 'July 14, 2026',
    featured: true,
  },
]

const ALL_ARTICLES = [
  {
    slug: 'adsense-high-cpc-niches-2026',
    title: 'AdSense High CPC Niches 2026: The Ultimate Guide',
    excerpt: 'Discover the most profitable and highest paying AdSense CPC niches for 2026 to maximize your ad revenue with high-value traffic.',
    category: 'Monetization',
    readTime: '8 min read',
  },
  {
    slug: 'fix-adsense-valuable-inventory-under-construction',
    title: 'How to Fix AdSense "Valuable Inventory: Under Construction"',
    excerpt: 'Step-by-step guide on fixing the Under Construction error. Learn what triggers it and how to verify menu navigation.',
    category: 'AdSense Rejections',
    readTime: '6 min read',
  },
  {
    slug: 'adsense-vs-ezoic-vs-mediavine',
    title: 'AdSense vs Ezoic vs Mediavine: Which is Best in 2026?',
    excerpt: 'Comparing Google AdSense, Ezoic, and Mediavine. Discover which ad network is best for your blog traffic level and niche.',
    category: 'Monetization',
    readTime: '7 min read',
  },
  {
    slug: 'how-to-increase-adsense-cpc-rpm',
    title: 'How to Increase AdSense CPC and RPM (Proven Strategies)',
    excerpt: 'Learn proven techniques to increase your Google AdSense Cost Per Click (CPC) and Revenue Per Mille (RPM).',
    category: 'Revenue Optimization',
    readTime: '7 min read',
  },
  {
    slug: 'does-google-adsense-allow-ai-content',
    title: 'Does Google AdSense Allow AI Content? 2026 Guidelines',
    excerpt: 'Can you get AdSense approval with AI-generated content? We explain Google\'s official stance and quality guidelines.',
    category: 'AI Policies',
    readTime: '8 min read',
  },
  {
    slug: 'how-long-to-earn-100-on-adsense',
    title: 'How Long Does It Take to Earn Your First $100 on AdSense?',
    excerpt: 'A realistic timeline and traffic estimation for reaching your first $100 payout on Google AdSense.',
    category: 'Earnings',
    readTime: '5 min read',
  },
  {
    slug: 'adsense-account-disabled-appeal-guide',
    title: 'Google AdSense Account Disabled? How to Appeal Successfully',
    excerpt: 'Has your AdSense account been disabled for invalid activity? Follow this step-by-step guide to write a successful appeal.',
    category: 'Policy & Appeals',
    readTime: '7 min read',
  },
  {
    slug: 'mandatory-pages-for-adsense-approval',
    title: 'Mandatory Pages Required for Google AdSense Approval',
    excerpt: 'Every page Google requires before reviewing your application: Privacy Policy, About, Contact, Terms, and Disclaimers.',
    category: 'Legal & Trust',
    readTime: '6 min read',
  },
  {
    slug: 'minimum-traffic-for-adsense-approval',
    title: 'Minimum Traffic Required for AdSense Approval (2026 Truth)',
    excerpt: 'Does Google require minimum pageviews for AdSense approval? We break down the real traffic numbers and quality signals.',
    category: 'Approval Standards',
    readTime: '6 min read',
  },
]

const HOMEPAGE_FAQ = [
  { q: "How long does Google AdSense approval take in 2026?", a: "Google AdSense approval typically takes 2 to 14 days. If your site satisfies all content quality and legal page requirements, reviews are processed faster." },
  { q: "How many posts do I need for AdSense approval?", a: "Most approved blogs feature at least 25 to 30 quality articles averaging 1,000+ words each. Publishing consistency and original insights are key evaluation criteria." },
  { q: "Why does Google AdSense reject sites for 'Low Value Content'?", a: "Google flags sites for Low Value Content when articles are under 600 words, generic, mass-produced without human curation, or lack author E-E-A-T credentials." },
  { q: "Is a Privacy Policy page mandatory for AdSense?", a: "Yes. Google AdSense strictly requires a clear Privacy Policy page containing DoubleClick cookie disclosures and opt-out instructions." },
]

export default function BlogHomePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background pt-16 pb-20 border-b border-border/50">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                <BookOpen className="h-3.5 w-3.5" /> Publisher Insights & AdSense Blueprint
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-foreground">
                Master <span className="gradient-text">Google AdSense</span> Approval & Site Monetization
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Independent educational guides, policy resolution blueprints, and E-E-A-T publishing strategies written by experienced publisher auditors.
              </p>

              {/* Tag pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-muted-foreground">
                <span className="text-foreground font-bold">Popular Topics:</span>
                {[
                  { label: 'Fix Low Value Content', href: '/blog/adsense-low-value-content-fix' },
                  { label: 'Approval Checklist', href: '/blog/adsense-approval-requirements' },
                  { label: 'High CPC Niches', href: '/blog/adsense-high-cpc-niches-2026' },
                  { label: 'AI Content Rules', href: '/blog/does-google-adsense-allow-ai-content' },
                ].map(tag => (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    className="px-3 py-1 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/60 transition-all"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* FEATURED MASTER GUIDES */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Editor&apos;s Pick</p>
                <h2 className="text-2xl md:text-3xl font-black text-foreground">Featured Master Blueprints</h2>
              </div>
              <Link href="/blog" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View All 30+ Guides <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {FEATURED_GUIDES.map((guide) => (
                <Link key={guide.slug} href={`/blog/${guide.slug}`}>
                  <div className="h-full p-6 rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-xl transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {guide.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        {guide.excerpt}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-primary font-bold">
                      <span>Read Master Guide</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* E-E-A-T AUTHOR & EDITORIAL STANDARDS */}
        <section className="py-16 bg-muted/20 border-y border-border/50">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="p-8 rounded-3xl bg-background border border-border/80 shadow-md">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary via-violet-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0">
                  AK
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">Archit Karmakar</h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Verified Publisher Auditor
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Lead Editorial Director at <strong>Navroll Studio</strong>. Archit has audited over 1,200+ publisher websites for Google AdSense compliance, content quality rating, and monetization architecture.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 100% Original Content</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> E-E-A-T Verified</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Updated for 2026 Policies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ALL RECENT GUIDES */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="mb-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Knowledge Hub</p>
              <h2 className="text-2xl md:text-3xl font-black text-foreground">Explore All Articles & Blueprints</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {ALL_ARTICLES.map((article) => (
                <Link key={article.slug} href={`/blog/${article.slug}`}>
                  <div className="h-full p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded-full">
                          {article.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{article.readTime}</span>
                      </div>
                      <h3 className="font-bold text-base text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        {article.excerpt}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/blog">
                <Button variant="outline" size="lg" className="rounded-xl font-bold gap-2">
                  Browse All 30+ Publisher Guides <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* PRE-FLIGHT CHECKLIST (EDUCATIONAL) */}
        <section className="py-20 bg-muted/20 border-t border-border/50">
          <div className="container px-4 mx-auto max-w-5xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-3">
                <ListTodo className="h-3.5 w-3.5" /> Editorial Checklist
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">Pre-Flight AdSense Review Checklist</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Before submitting your blog for AdSense review, verify these critical technical and trust requirements.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-primary" /> Content & Technical Check
                </h3>
                {[
                  { title: "25–30+ Comprehensive Articles", desc: "Each article should average 1,000+ words with structured headings and images." },
                  { title: "XML Sitemap Submitted to GSC", desc: "Ensure your sitemap.xml is active in Google Search Console and crawlers are not blocked." },
                  { title: "Clean URL & Navigation", desc: "Use human-readable slugs without broken drop-downs or 404 links." }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/60 bg-card">
                    <h4 className="font-bold text-sm text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Trust & E-E-A-T Check
                </h3>
                {[
                  { title: "Mandatory Legal Pages", desc: "Working Privacy Policy (with Google cookie clause), Terms, Disclaimer, and About pages." },
                  { title: "Active SSL/TLS (HTTPS)", desc: "Your website must load securely over HTTPS on all pages." },
                  { title: "Author Credentials & Contact Info", desc: "Visible author bio box and working contact email for editorial inquiries." }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/60 bg-card">
                    <h4 className="font-bold text-sm text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="py-20 bg-background border-t border-border/50">
          <div className="container px-4 mx-auto max-w-4xl">
            <FadeIn className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-foreground">Frequently Asked Questions</h2>
            </FadeIn>
            <div className="grid gap-4">
              {HOMEPAGE_FAQ.map((faq, idx) => (
                <FadeIn key={idx} delay={idx * 0.1} className="bg-muted/20 border border-border/60 p-6 rounded-2xl">
                  <h3 className="font-bold text-base mb-2 text-foreground flex gap-3">
                    <span className="text-primary mt-0.5"><CheckCircle2 className="h-5 w-5" /></span> {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-8">{faq.a}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </>
  )
}

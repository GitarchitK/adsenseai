import { Navbar } from '@/components/navbar'
import { LandingCTA } from '@/components/landing-cta'
import { SiteFooter } from '@/components/site-footer'
import { HeroScanInput } from '@/components/hero-scan-input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  BarChart3, Shield, Sparkles, CheckCircle2,
  Brain, Search, FileText, Star,
  TrendingUp, Clock, Lock, ArrowRight,
  AlertCircle, Crown, DollarSign, Wallet,
  Check, ChevronRight
} from 'lucide-react'
import { CurrencyNote } from '@/components/pricing-display'

export const metadata: Metadata = {
  title: 'Free AdSense Approval Checker — AI Site Audit (2026)',
  description: 'Check if your website is ready for Google AdSense approval in 60 seconds. AI-powered audit finds the exact issues blocking your application. Free to start.',
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

// ── NEW Mock Report Component (AI Coaching Plan focus) ──
function MockReport() {
  return (
    <div className="relative w-full max-w-[500px] mx-auto group perspective-1000">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/30 via-transparent to-violet-500/30 rounded-[2rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative bg-[#0F0F11]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transform transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1">
        {/* Top Bar */}
        <div className="p-3 sm:p-4 border-b border-white/5 flex flex-wrap gap-2 items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-white/50 ml-1 sm:ml-3 tracking-wider hidden xs:inline-block">AI_COACHING.json</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(139,92,246,0.3)]">
            <Sparkles className="h-3 w-3" /> <span className="hidden sm:inline">Zero Hallucinations</span><span className="sm:hidden">Zero Hallucination</span>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
              <Check className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white mb-0.5">Approval Roadmap Ready</h4>
              <p className="text-[12px] text-white/50">Based on 14 analyzed pages and 3 policy violations.</p>
            </div>
          </div>

          {/* AI Roadmap Steps */}
          <div className="space-y-3 relative before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-white/10">
            {/* Step 1 */}
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#0F0F11] border-2 border-red-500 flex items-center justify-center z-10">
                <span className="text-[10px] font-bold text-red-500">1</span>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-bold text-red-100">Fix Thin Content (Priority)</span>
                </div>
                <p className="text-[11px] text-red-200/70 leading-relaxed">
                  Your pages <code className="text-red-300 bg-red-500/20 px-1 rounded">/about-us</code> and <code className="text-red-300 bg-red-500/20 px-1 rounded">/services</code> have under 200 words. Expand both to 600+ words to pass Google's minimum quality threshold.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-8 opacity-80">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#0F0F11] border-2 border-amber-500 flex items-center justify-center z-10">
                <span className="text-[10px] font-bold text-amber-500">2</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-100">Add Missing Policies</span>
                </div>
                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                  Crawler detected a missing Privacy Policy. Generate one and link it in your footer menu to resolve the "Site Navigation" violation.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-8 opacity-50">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#0F0F11] border-2 border-white/20 flex items-center justify-center z-10">
                <span className="text-[10px] font-bold text-white/50">3</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-sm font-bold text-white/50">Apply for AdSense</span>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </div>
            </div>
          </div>

          {/* Revenue Potential Section */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Post-Fix Revenue Potential</p>
              <div className="text-2xl font-black text-white">$450 <span className="text-sm font-medium text-white/40">/month</span></div>
            </div>
            <div className="h-10 w-24 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-lg border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-6 animate-bounce" style={{ animationDuration: '4s' }}>
        <div className="bg-[#0F0F11] text-emerald-400 text-[11px] font-black px-4 py-2.5 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-2 border border-emerald-500/30">
          <Wallet className="h-4 w-4" /> EXACT FIXES INCLUDED
        </div>
      </div>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const features = [
  { icon: Brain,     color: 'text-violet-400',   bg: 'bg-violet-500/10 border-violet-500/20',   title: 'Zero-Hallucination AI',     desc: 'Our AI only cites actual data from your crawl. It names exact URLs, exact word counts, and exact tags. No generic advice.' },
  { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Step-by-Step Roadmaps', desc: 'Stop guessing. Get a prioritized checklist of exactly what to fix this week to guarantee AdSense approval.' },
  { icon: Shield,    color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', title: 'Policy Risk Guard',        desc: 'Identify and fix policy violations (like missing policies or thin content) that lead to dreaded "Low Value Content" rejections.' },
  { icon: BarChart3, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  title: 'Accurate Crawler Data',     desc: 'Our advanced crawler bypasses basic protections, accurately strips boilerplate, and gives you true content analytics.' },
  { icon: FileText,  color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20',   title: 'Automated Post-Scan Alerts',   desc: 'We automatically email you a beautifully formatted report and roadmap the second your site finishes scanning.' },
  { icon: Search,    color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',   title: 'Niche SEO Insights',           desc: 'Find high-CPC keyword gaps in your content and optimize your site structure for maximum ad placement value.' },
]

const steps = [
  { n: '01', title: 'Enter your URL',        desc: 'Paste any website URL. We handle the rest — no setup, no plugins, no CMS access required.' },
  { n: '02', title: 'Advanced Crawl',        desc: 'Our crawler accurately reads your pages, stripping away menus and footers to analyze true content length.' },
  { n: '03', title: 'AI Coaching Plan',      desc: 'GPT-4o generates a highly-specific, zero-hallucination roadmap citing your exact URLs and issues.' },
  { n: '04', title: 'Fix & Profit',          desc: 'Follow the checklist, apply to AdSense, and start turning your traffic into consistent revenue.' },
]

const testimonials = [
  { quote: 'The AI didn\'t just tell me "fix thin content". It literally listed the 4 specific URLs that were too short. I expanded them, applied, and got approved in 48 hours.', author: 'Priya S.', role: 'Lifestyle Blogger', rating: 5 },
  { quote: 'I had been rejected 3 times for "Low Value Content". This tool gave me a step-by-step roadmap that finally broke the cycle of vague Google rejection emails.', author: 'Marcus T.', role: 'Tech Content Creator', rating: 5 },
  { quote: 'The automated email report is gorgeous. It caught a missing privacy policy and a broken H1 structure I had completely overlooked. Easiest money I ever spent.', author: 'Aisha K.', role: 'News Publisher', rating: 5 },
]

const stats = [
  { value: '15,000+', label: 'Sites Audited',    icon: TrendingUp },
  { value: 'Zero',    label: 'Generic Advice',     icon: Brain },
  { value: '96%',     label: 'Approval Success',   icon: CheckCircle2 },
  { value: '100%',    label: 'Accurate Crawls',    icon: Search },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="dark min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 overflow-x-hidden font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        {/* Deep dark animated background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[120px]" />
        </div>

        <div className="relative container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            <div className="text-left z-10">
              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                  <Brain className="h-3.5 w-3.5" /> New AI Coaching Engine
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 96% Approval Rate
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black leading-[1.05] tracking-tight mb-6">
                Stop Guessing.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-violet-400">
                  Guarantee Approval.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-8 font-light">
                Google's rejection emails are vague on purpose. We scan your site, analyze the exact data, and give you a <strong className="text-white font-semibold">zero-hallucination roadmap</strong> telling you exactly what URLs to fix.
              </p>

              <div className="max-w-xl mb-8">
                <HeroScanInput />
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {['P', 'M', 'A', 'R', 'K'].map((l, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-emerald-600 flex items-center justify-center text-xs font-bold text-white ring-4 ring-[#050505]">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-white/50">
                    <span className="font-bold text-white">4.9/5</span> from 15,000+ publishers
                  </p>
                </div>
              </div>
            </div>

            <div className="relative lg:ml-auto w-full max-w-lg z-10">
              <MockReport />
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO BAR ── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-8 overflow-hidden backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-6">
            Analyzing sites across all major platforms
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-8 opacity-40">
            {['WordPress', 'Ghost', 'Webflow', 'Next.js', 'Blogger', 'Custom HTML'].map(name => (
              <span key={name} className="text-xl md:text-2xl font-black tracking-tighter italic">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION (Vague Emails vs Exact Data) ── */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">The "Low Value Content" Trap</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">Google will never tell you exactly which pages caused your rejection. We will.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* The Problem */}
            <div className="rounded-3xl p-1 bg-gradient-to-b from-red-500/20 to-transparent">
              <div className="h-full rounded-[23px] bg-[#0A0A0A] p-8 md:p-10 border border-red-500/10">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Vague Rejections</h3>
                <p className="text-white/50 leading-relaxed mb-6">
                  You wait weeks for a review, only to get an automated email saying "Low Value Content". You have no idea if it's because of 2 short articles, a missing privacy policy, or bad site navigation. You change random things, apply again, and get rejected again.
                </p>
                <div className="space-y-3">
                  {['Months of lost ad revenue.', 'Endless guesswork and frustration.', 'No actionable feedback.'].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-sm text-red-200/60">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* The Solution */}
            <div className="rounded-3xl p-1 bg-gradient-to-b from-emerald-500/30 to-transparent shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <div className="h-full rounded-[23px] bg-[#0A0A0A] p-8 md:p-10 border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Brain className="w-32 h-32" />
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 relative z-10 border border-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 relative z-10">Data-Driven Coaching</h3>
                <p className="text-white/60 leading-relaxed mb-6 relative z-10">
                  Our advanced crawler reads your entire site, counts the exact words, and checks every policy. Our AI then hands you a specific roadmap. It doesn't say "fix content" — it says <strong className="text-white">"Expand /blog/post-1 from 150 words to 600 words."</strong>
                </p>
                <div className="space-y-3 relative z-10">
                  {['Exact URLs cited in every step.', 'Zero AI hallucinations.', 'Guaranteed path to approval.'].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      <span className="text-sm text-emerald-100/80 font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="flex justify-center mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{value}</p>
                <p className="text-sm text-white/40 uppercase tracking-widest font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">An Unfair Advantage</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">Everything you need to bulletproof your AdSense application and unlock your site's monetization potential.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.05] transition-all duration-300 hover:border-white/20">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${bg} mb-6 transition-transform group-hover:scale-110`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="font-bold text-xl text-white mb-3 tracking-tight">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── TESTIMONIALS ── */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Don't take our word for it</h2>
            <p className="text-lg text-white/50">Real results from real publishers who used our roadmap to get approved.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, author, role, rating }) => (
              <div key={author} className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 flex flex-col relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                  <Crown className="w-24 h-24 text-white" />
                </div>
                <div className="flex gap-1 mb-6 relative z-10">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-base text-white/80 leading-relaxed mb-8 flex-1 relative z-10">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/10 relative z-10">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-emerald-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{author}</p>
                    <p className="text-xs text-white/50">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQS ── */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-lg text-white/50">Everything you need to know about getting approved for Google AdSense in 2026.</p>
          </div>
          <div className="space-y-4">
            {HOMEPAGE_FAQ.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
                <h3 className="text-lg font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-white/60 leading-relaxed text-sm md:text-base">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-32 border-t border-white/5 bg-[#0A0A0A]">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <div className="w-[800px] h-[400px] rounded-[100%] bg-violet-600/20 blur-[120px]" />
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Ready to turn your traffic<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">
                into actual revenue?
              </span>
            </h2>
            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-xl mx-auto leading-relaxed font-light">
              Stop waiting for vague rejection emails. Get your personalized, data-driven AI coaching plan right now.
            </p>
            <div className="flex flex-col items-center gap-6">
              <LandingCTA size="xl" />
              <p className="text-sm text-white/30 flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500/70" /> Takes 30 seconds · No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <SiteFooter />
    </div>
  )
}

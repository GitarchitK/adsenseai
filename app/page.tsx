'use client'

import { Navbar } from '@/components/navbar'
import { LandingCTA } from '@/components/landing-cta'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Zap, BarChart3, Shield, Sparkles, CheckCircle2,
  Brain, Search, FileText, Star, Globe,
  TrendingUp, Clock, Lock, ArrowRight,
  MousePointer2, Layout, AlertCircle, Crown,
  Coins, DollarSign, Wallet,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

// ── Hero Scan Input Component ──
function HeroScanInput() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })
    return () => unsub()
  }, [])

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    
    setIsLoading(true)
    const encodedUrl = encodeURIComponent(url.startsWith('http') ? url : `https://${url}`)
    
    if (isLoggedIn) {
      router.push(`/dashboard?scan=${encodedUrl}`)
    } else {
      router.push(`/auth/login?returnUrl=${encodedUrl}`)
    }
  }

  return (
    <form onSubmit={handleScan} className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
      <div className="relative flex flex-col sm:flex-row gap-3 bg-card/50 backdrop-blur-xl p-2 rounded-2xl border border-border/60 shadow-2xl">
        <div className="relative flex-1">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder="Enter your website URL (e.g. yoursite.com)" 
            className="h-14 pl-12 bg-transparent border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/60"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          disabled={isLoading}
          className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
        >
          {isLoading ? (
            <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          ) : (
            <>Analyze Free <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1.5 font-medium">
        <Shield className="h-3 w-3" /> No credit card required · Instant 30-second audit
      </p>
    </form>
  )
}

// ── Mock Report Component ──
function MockReport() {
  return (
    <div className="relative w-full max-w-[500px] mx-auto group">
      {/* Decorative background glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-violet-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
      
      <div className="relative bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500" />
        <div className="p-5 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground ml-2">adsense-audit-report.pdf</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
            <Sparkles className="h-3 w-3" /> AI POWERED
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/10" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={213} strokeDashoffset={213 - (74 / 100) * 213} className="text-emerald-500" />
              </svg>
              <div className="text-center z-10">
                <span className="text-xl font-black text-emerald-500">74</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1 text-foreground">Readiness Score: <span className="text-emerald-500">Moderate</span></h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Your site is showing promise but has 3 critical policy risks and 2 thin content warnings.</p>
            </div>
          </div>

          {/* Revenue Potential Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                <DollarSign className="h-3 w-3" /> Potential CPM
              </div>
              <div className="text-lg font-black text-foreground">$4.20 - $8.50</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                <TrendingUp className="h-3 w-3" /> Niche CPC
              </div>
              <div className="text-lg font-black text-foreground">$1.15 High</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-[11px] font-medium text-foreground truncate">Missing Privacy Policy Page</span>
              </div>
              <span className="text-[10px] font-bold text-red-500 whitespace-nowrap">-$150/mo Risk</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Monetization Roadmap</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 rounded-full ${i === 1 ? 'bg-emerald-500' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Week 1: Fix critical compliance to unlock $200+ monthly potential.</p>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-6 -right-6 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="bg-amber-400 text-black text-[11px] font-black px-4 py-2 rounded-2xl shadow-xl shadow-amber-500/20 rotate-12 flex items-center gap-2 border-2 border-white/20">
          <Wallet className="h-4 w-4" /> UNLOCK REVENUE
        </div>
      </div>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const features = [
  { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Monetization Potential', desc: 'Discover your niche\'s potential CPC and CPM. See exactly how much revenue you are leaving on the table every month.' },
  { icon: Brain,     color: 'text-blue-500',   bg: 'bg-blue-500/10',   title: 'High-Value Content AI',     desc: 'GPT-4 analyzes your articles for "High-Value" signals that AdSense advertisers love, boosting your approval odds.' },
  { icon: Shield,    color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Policy Risk Guard',        desc: 'Identify and fix policy violations that lead to "Low Value Content" rejections and missed revenue opportunities.' },
  { icon: BarChart3, color: 'text-amber-500',  bg: 'bg-amber-500/10',  title: 'Revenue Readiness Score',     desc: 'A comprehensive 0-100 score weighted by AdSense criteria, showing you exactly when your site is ready to print money.' },
  { icon: Search,    color: 'text-pink-500',   bg: 'bg-pink-500/10',   title: 'Niche SEO Insights',           desc: 'Find high-CPC keyword gaps in your content and optimize your site structure for maximum ad placement value.' },
  { icon: FileText,  color: 'text-cyan-500',   bg: 'bg-cyan-500/10',   title: 'Compliance Generator',   desc: 'Generate AdSense-mandatory pages in seconds. Stay compliant and keep your earnings flowing without interruptions.' },
]

const steps = [
  { n: '01', title: 'Enter your URL',        desc: 'Paste any website URL. We handle the rest — no setup, no code, no plugins.' },
  { n: '02', title: 'AI scans your site',    desc: 'Our crawler visits up to 15 pages. GPT-4 analyzes content, policy, SEO, and trust signals.' },
  { n: '03', title: 'Get your score',        desc: 'Receive a 0–100 AdSense readiness score with a category breakdown in under 30 seconds.' },
  { n: '04', title: 'Fix & get approved',    desc: 'Follow the prioritized fix list. Re-scan to track progress. Apply when you hit 80+.' },
]

const testimonials = [
  { quote: 'I\'d been rejected by AdSense 3 times. AdSenseAI showed me exactly what was wrong — missing Privacy Policy and thin content. Fixed both, approved in a week.', author: 'Priya S.', role: 'Lifestyle Blogger', rating: 5 },
  { quote: 'The AI fix suggestions were incredibly specific. Not generic advice — actual page-by-page recommendations. Worth every rupee.', author: 'Marcus T.', role: 'Tech Content Creator', rating: 5 },
  { quote: 'Saved me hours of guesswork. The policy risk checker caught a copyright issue I had no idea about. Game changer.', author: 'Aisha K.', role: 'News Publisher', rating: 5 },
]

const stats = [
  { value: '12,000+', label: 'Sites Audited',    icon: TrendingUp },
  { value: '$450k+',  label: 'Earnings Unlocked',  icon: DollarSign },
  { value: '94%',     label: 'Approval Rate',      icon: CheckCircle2 },
  { value: '< 30s',   label: 'Audit Speed',        icon: Clock },
]

const checks = [
  'Content quality & word count per page',
  'Privacy Policy, Terms & About pages',
  'Meta descriptions & H1 tag structure',
  'Internal linking & site navigation',
  'HTTPS security signals',
  'Spam score & keyword stuffing',
  'Copyright & policy risk detection',
  'Mobile-friendliness indicators',
  'AdSense policy compliance check',
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden mesh-bg">
        {/* Animated dot grid */}
        <div className="absolute inset-0 dot-grid-anim opacity-50" />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb-1 absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/12 blur-[100px]" />
          <div className="hero-orb-2 absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[90px]" />
          <div className="hero-orb-3 absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-indigo-400/8 blur-[80px]" />
        </div>
        <div className="relative container mx-auto px-6 pt-24 pb-36 md:pt-32 md:pb-48">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Trusted by 12,000+ publishers worldwide
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-4 py-1.5 text-[10px] font-bold text-emerald-600 shadow-sm backdrop-blur-sm uppercase tracking-wider">
                  Product of Navroll Studio
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.04] mb-7">
                Free AdSense Checker<br />
                <span className="gradient-text">&amp; Website Audit</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
                The fastest AdSense approval checker online. Our AI audits your site for content quality, policy compliance, and SEO — then tells you exactly what to fix to get approved in under 30 seconds.
              </p>

              <div className="max-w-xl mb-12">
                <HeroScanInput />
              </div>

              {/* Social proof avatars */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {['P', 'M', 'A', 'R', 'K'].map((l, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground ring-2 ring-background">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">4.9/5</span> from 2,400+ reviews
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <MockReport />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── LOGO BAR ── */}
      <section className="border-b border-border/60 py-10 overflow-hidden bg-muted/10">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">
            Helping publishers on every platform
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 grayscale opacity-50 contrast-125">
            {['WordPress', 'Blogger', 'Ghost', 'Medium', 'Custom Sites', 'News Portals'].map(name => (
              <span key={name} className="text-xl md:text-2xl font-black tracking-tighter text-foreground italic">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-0.5">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">The Cost of Rejection</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
                Every day you wait is revenue lost forever
              </h2>
              <div className="space-y-4">
                {[
                  'Average site loses $150 - $400 monthly while waiting for approval.',
                  '"Low Value Content" rejections kill your motivation and income.',
                  'Generic emails leave you stuck in a loop of zero earnings.',
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                    <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <DollarSign className="h-3 w-3 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-300 italic">{t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">The Fast Track</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
                Unlock your site\'s true earning potential
              </h2>
              <div className="space-y-4">
                {[
                  'Identify high-CPC keyword opportunities in your existing content.',
                  'Fix policy risks that block premium advertiser demand.',
                  'Follow a data-driven roadmap to hit $1,000+ monthly revenue.',
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Wallet className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-muted/20 border-y border-border/60">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How Our AdSense Checker Works — 4 Steps</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Run a free AdSense audit on any website. Paste your URL and get your full AdSense approval report in under 30 seconds.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map(({ n, title, desc }) => (
                <div key={n} className="relative">
                  <div className="rounded-2xl border border-border/60 bg-card p-6 h-full lift">
                    <div className="text-4xl font-black text-emerald-500/15 mb-4 leading-none">{n}</div>
                    <h3 className="font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE CHECK ── */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Revenue Safeguards</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Every signal that impacts your earnings</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Our analyzer covers every dimension AdSense reviewers and premium advertisers evaluate before spending money on your site.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              'Niche-specific CPC potential',
              'High-value content density',
              'Policy-compliant ad placement areas',
              'Internal linking for higher RPM',
              'Traffic-to-revenue conversion signals',
              'Brand safety for premium ads',
              'Copyright & originality verification',
              'User engagement & trust signals',
              'Full AdSense policy compliance',
            ].map((c) => (
              <div key={c} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5 lift">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-muted/20 border-y border-border/60">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Features</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything our AdSense audit checks</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Built specifically for publishers who want to pass the AdSense approval check — not a generic SEO tool.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="rounded-2xl border border-border/60 bg-card p-6 lift">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} mb-4`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Pay only for what you need</h2>
            <p className="text-muted-foreground">Start free. Unlock the full AI report for ₹19, or go Pro for unlimited scans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="rounded-2xl border border-border/60 bg-card p-7 flex flex-col hover:border-border transition-colors">
              <div className="mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Free</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-black text-foreground">₹0</span>
                </div>
                <p className="text-sm text-muted-foreground">Test the waters and see your score.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['5 scans per month', 'Basic readiness score', 'Site structure check', 'Missing pages detection', 'Critical issues list'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />{f}
                  </li>
                ))}
                {['Full AI report', 'Fix suggestions', 'Article Analyzer'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/40">
                    <Lock className="h-4 w-4 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full rounded-xl h-11">Start Free</Button>
              </Link>
            </div>

            {/* Report Unlock */}
            <div className="rounded-2xl border-2 border-primary bg-card p-7 flex flex-col relative glow">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</span>
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Report Unlock</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-black text-foreground">₹19</span>
                  <span className="text-muted-foreground text-sm">one-time</span>
                </div>
                <p className="text-sm text-muted-foreground">Perfect for a single-site deep audit.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['Everything in Free', 'Full AI-powered report', 'GPT-4 content analysis', 'Policy risk deep scan', '1-Month Approval Roadmap', 'Trust & UX scoring'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button className="w-full rounded-xl h-11 shadow-lg shadow-primary/25">Unlock Full Report</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-7 flex flex-col hover:border-amber-500/50 transition-colors">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Pro Subscription</p>
                  <Crown className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-black text-foreground">₹199</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">For serious publishers with multiple sites.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['200 scans per month', 'AI report on every scan', 'Article Content Analyzer', 'Content rewriting tool', 'Privacy Policy generator', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full rounded-xl h-11 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                  Go Pro
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            All payments secured by Razorpay · No hidden fees · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-muted/20 border-y border-border/60">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Success Stories</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Publishers who got approved</h2>
              <p className="text-muted-foreground">Real results from real publishers who used AdSenseAI to fix their sites.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(({ quote, author, role, rating }) => (
                <div key={author} className="rounded-2xl border border-border/60 bg-card p-6 lift flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-5 flex-1">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                      {author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{author}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-foreground">Common questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'How is this different from a regular SEO tool?', a: 'AdSenseAI is built specifically for AdSense approval — not general SEO. We check the exact signals Google\'s AdSense review team evaluates: content quality, policy compliance, required pages, and trust signals.' },
              { q: 'Is it worth it to pay ₹199 monthly or ₹19 for a one-time report?', a: 'If you have one site and just want to know why you were rejected, the ₹19 report is perfect. If you are a serious publisher or manage multiple sites, the ₹199 Pro plan is a massive value: it includes 200 scans, the Article Content Analyzer (our most powerful tool for "Low Value Content" issues), and the AI Content Rewriter.' },
              { q: 'Do I need to install anything on my site?', a: 'No. Just paste your URL. We crawl your site externally — no plugins, no code, no access to your CMS required.' },
              { q: 'What does the ₹19 report unlock include?', a: 'The full AI report includes GPT-4 content analysis, policy risk deep scan, prioritized fix suggestions, trust & UX scoring, and a detailed breakdown of every category.' },
              { q: 'How accurate is the score?', a: 'Our scoring formula mirrors the criteria in Google\'s AdSense program policies. Publishers who score 80+ have a 94% approval rate based on our data.' },
              { q: 'Can I scan multiple websites?', a: 'Yes. Each scan is independent. Free users get 5 scans/month. Pro users get 200 scans per month across any number of domains.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/30 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 dot-grid-anim opacity-30" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb-1 absolute top-[-20%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />
          <div className="hero-orb-2 absolute bottom-[-20%] right-[5%] w-[350px] h-[350px] rounded-full bg-violet-500/8 blur-[70px]" />
        </div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-8 shadow-sm">
              <Sparkles className="h-3 w-3" /> Start Your Earning Journey
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-[1.1]">
              Stop Guessing. Start<br />
              <span className="gradient-text">Getting Paid.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
              Join 12,000+ publishers who stopped losing revenue and started scaling their AdSense earnings. Your first audit is on us.
            </p>
            <div className="flex flex-col items-center gap-4">
              <LandingCTA size="xl" />
              <p className="text-xs text-muted-foreground/60 flex items-center gap-2 mt-4">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free audit included · Results in 30 seconds
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

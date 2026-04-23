import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { Zap, Target, Users, Shield, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About AdSenseAI — Free AdSense Checker & Audit Tool',
  description: 'AdSenseAI is a free AdSense checker and website audit tool built by Navroll Studio. We help publishers get Google AdSense approved faster with AI-powered site audits.',
  alternates: { canonical: 'https://adsensechecker.in/about' },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden mesh-bg">
        <div className="absolute inset-0 dot-grid-anim opacity-40" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb-1 absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[90px]" />
        </div>
        <div className="relative container mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
            <Zap className="h-3.5 w-3.5" /> Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Built for publishers who want to <span className="gradient-text">get paid</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AdSenseAI was born out of frustration — vague rejection emails, no actionable feedback, and weeks of guesswork. We built the tool we wished existed.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Mission */}
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="text-3xl font-black text-foreground mb-4">Make AdSense approval predictable</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every day, thousands of publishers get rejected by Google AdSense with nothing but a generic email. They spend weeks guessing what went wrong, making random changes, and reapplying — only to get rejected again.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We built AdSenseAI to change that. Our AI analyzes your site against the exact criteria Google uses — content quality, policy compliance, SEO, trust signals — and tells you precisely what to fix, in what order.
            </p>
            <div className="pt-6 border-t border-border/60">
              <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">The Team</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  TD
                </div>
                <div>
                  <p className="font-bold text-foreground">Tiyasha Dewan</p>
                  <p className="text-xs text-muted-foreground">Founder & Lead Strategy</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
                AdSenseAI is a product of <span className="font-bold text-primary">Navroll Studio</span>, dedicated to building high-impact tools for the digital publishing economy.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { icon: Target,    title: 'Precision over guesswork',   desc: 'Page-by-page analysis, not generic advice.' },
              { icon: TrendingUp, title: '94% approval rate',         desc: 'Publishers who score 80+ get approved 94% of the time.' },
              { icon: Users,     title: '12,000+ publishers helped',  desc: 'From bloggers to news sites across India and beyond.' },
              { icon: Shield,    title: 'Policy-first approach',      desc: 'We check what Google actually checks, not what we think they check.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-2xl border border-border/60 bg-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/20 border-y border-border/60">
        <div className="container mx-auto px-6 py-20 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-foreground mb-3">What we believe</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Transparency first', desc: 'We show you exactly how your score is calculated — no black boxes, no mystery.' },
              { title: 'Actionable always',  desc: 'Every insight comes with a specific action. We never say "improve content quality" without telling you how.' },
              { title: 'Fair pricing',       desc: 'Start free. Pay ₹19 for one report. ₹199/month for unlimited. No tricks, no hidden fees.' },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-2xl border border-border/60 bg-card p-6">
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

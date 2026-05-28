'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Zap, ArrowRight, Target, Activity, Send } from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/hooks/use-currency'

export default function PricingPage() {
  const { currency, loading: geoLoading } = useCurrency()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative mesh-bg">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative container mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
            <Zap className="h-3.5 w-3.5" /> AdSense Coaching Subscription
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Pay exactly for what you need
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Stop guessing why AdSense rejected you. We crawl your site, use AI to estimate exactly how many days it will take to fix, and drip-feed you a daily task.
          </p>
          <div className="flex justify-center gap-4 text-left">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-48">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Step 1</p>
              <p className="text-sm font-semibold">Free Scan</p>
              <p className="text-xs text-muted-foreground mt-1">We analyze up to 150 pages of your site.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-48">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Step 2</p>
              <p className="text-sm font-semibold">AI Estimate</p>
              <p className="text-xs text-muted-foreground mt-1">AI tells you exactly how many days of work you need.</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm w-48 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full" />
              <p className="text-xs font-bold text-primary uppercase mb-1">Step 3</p>
              <p className="text-sm font-bold text-primary">₹5 / Day</p>
              <p className="text-xs text-primary/80 mt-1">Pay only for the estimated days. Complete your daily tasks.</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl font-black mb-12">What's included in the Coaching Subscription?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-left space-y-4">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Personalized Roadmap</h3>
            <p className="text-sm text-muted-foreground">Get a structured daily checklist of EXACTLY what to fix based on your site's specific AI analysis.</p>
          </div>
          <div className="text-left space-y-4">
            <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-emerald-600">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Daily Email Prompts</h3>
            <p className="text-sm text-muted-foreground">Every day at 8 AM, we'll email you your specific task for the day. No overwhelm, just action.</p>
          </div>
          <div className="text-left space-y-4">
            <div className="bg-amber-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-amber-600">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Adaptive Re-crawls</h3>
            <p className="text-sm text-muted-foreground">Every 5 days, our bots re-crawl your site to verify your progress and adjust the remaining roadmap automatically.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/20 border-y border-border/60 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-black mb-10">How it works</h2>
          <div className="max-w-xl mx-auto bg-card rounded-2xl border border-border p-8 text-left shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Example</span>
            </div>
            <p className="text-lg font-medium mb-4">"Your site needs <span className="font-bold text-primary">24 days</span> of targeted improvements."</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Total cost: <span className="font-bold text-foreground">₹120</span> (24 days × ₹5)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You pay once. Over the next 24 days, we guide you step-by-step. If you fix things faster during a 5-day re-crawl, your timeline shortens.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black text-foreground mb-4">Ready to fix your site?</h2>
        <p className="text-muted-foreground mb-8">Run your free scan to get your personalized estimate.</p>
        <Link href="/">
          <Button size="lg" className="gap-2 h-13 px-10 text-base shadow-lg shadow-primary/25" style={{ height: '52px' }}>
            Start Free Analysis <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  )
}

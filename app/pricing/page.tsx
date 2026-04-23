'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lock, Zap, Crown, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'
const freeFeatures = [
  '5 free site scans / month',
  'AdSense readiness score (0–100)',
  'Site structure analysis',
  'Missing pages detection',
  'Critical issues list',
]
const freeLocked = ['Full AI report', 'Fix suggestions', 'Policy deep analysis']

const reportFeatures = [
  'Everything in Free',
  'Full GPT-4 content analysis',
  'Policy risk deep scan',
  'Prioritized fix suggestions',
  'Trust & UX scoring',
  'Detailed category breakdown',
]

const proFeatures = [
  '200 scans per month',
  'AI report on every scan',
  'Content rewriting tool',
  'Privacy Policy generator',
  'SEO optimization suggestions',
  'AI Tools dashboard',
  'Priority support',
]

const faqs = [
  { q: 'What does the ₹19 report unlock?', a: 'A one-time payment unlocks the full AI-powered report for that specific scan — GPT-4 content analysis, policy risk detection, prioritized fix suggestions, and trust/UX scoring.' },
  { q: 'Does the ₹19 unlock expire?', a: 'No. Once you unlock a report, it\'s saved permanently in your account and accessible anytime.' },
  { q: 'What\'s included in the Pro plan?', a: 'Pro gives you 200 scans per month with AI reports automatically included on every scan, plus content rewriting, Privacy Policy generator, and SEO suggestions.' },
  { q: 'Can I cancel Pro anytime?', a: 'Yes. You can cancel your Pro subscription at any time. You\'ll retain Pro access until the end of your billing period.' },
  { q: 'Is payment secure?', a: 'All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We never store your card details.' },
]

export default function PricingPage() {
  const { profile, token, isPro, getToken } = useProfile()
  const { openCheckout } = useRazorpay()
  const [loading, setLoading] = useState(false)

  const handleProUpgrade = async () => {
    if (!token) { window.location.href = '/auth/signup'; return }
    setLoading(true)
    try {
      const t = await getToken()
      const res = await fetch('/api/razorpay/order', { method: 'POST', headers: { Authorization: `Bearer ${t}` } })
      const order = await res.json()
      if (!order.orderId) return

      await openCheckout({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: 'AdSenseAI', description: 'Pro Plan — ₹199/month', order_id: order.orderId,
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
            body: JSON.stringify({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature, plan: 'pro' }),
          })
          window.location.href = '/dashboard?upgraded=1'
        },
        prefill: { email: profile?.email ?? '' },
        theme: { color: '#7c3aed' },
      })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative mesh-bg">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative container mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
            <Zap className="h-3.5 w-3.5" /> Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Pay only for what you need
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free. Unlock a full AI report for ₹19, or go Pro for 200 scans and AI on every analysis.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Pricing cards */}
      <section className="container mx-auto px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 -mt-8">

          {/* Free */}
          <div className="rounded-2xl border border-border/60 bg-card p-7 flex flex-col">
            <div className="mb-6">
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-3">Free</p>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-5xl font-black text-foreground">₹0</span>
              </div>
              <p className="text-sm text-muted-foreground">5 scans per month to see your score and basic issues.</p>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />{f}
                </li>
              ))}
              {freeLocked.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/40">
                  <Lock className="h-4 w-4 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full rounded-xl font-semibold">
                Start Free
              </Button>
            </Link>
          </div>

          {/* Report Unlock — most popular */}
          <div className="rounded-2xl border-2 border-primary bg-card p-7 flex flex-col relative glow">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-3">Report Unlock</p>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-5xl font-black text-foreground">₹19</span>
                <span className="text-muted-foreground text-sm font-medium">one-time</span>
              </div>
              <p className="text-sm text-muted-foreground">Unlock the full AI report for one scan. Pay once, keep forever.</p>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {reportFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup">
              <Button className="w-full rounded-xl font-semibold shadow-lg shadow-primary/25">
                Get Full Report
              </Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground mt-3">Unlock after running your free scan</p>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-border/60 bg-card p-7 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="mb-6 relative">
              <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" /> Pro
              </p>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-5xl font-black text-foreground">₹199</span>
                <span className="text-muted-foreground text-sm font-medium">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">For serious publishers managing multiple sites.</p>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="w-full text-center rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 py-2.5 text-sm font-semibold">
                ✓ Current Plan
              </div>
            ) : (
              <Button
                onClick={handleProUpgrade}
                disabled={loading}
                className="w-full rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25"
              >
                {loading ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><Crown className="h-4 w-4" /> Start Pro</>}
              </Button>
            )}
            <p className="text-center text-xs text-muted-foreground mt-3">Cancel anytime · No hidden fees</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="max-w-5xl mx-auto mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {['🔒 Secured by Razorpay', '✓ PCI-DSS Compliant', '↩ Cancel anytime', '🇮🇳 Made for Indian publishers'].map(t => (
            <span key={t}>{t}</span>
          ))}
          <span className="font-bold text-primary flex items-center gap-1.5">
            <Zap className="h-3 w-3" /> A Product of Navroll Studio
          </span>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-muted/20 border-y border-border/60">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-foreground text-center mb-10">Full comparison</h2>
            <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left px-6 py-4 font-semibold text-foreground">Feature</th>
                    <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Free</th>
                    <th className="text-center px-4 py-4 font-semibold text-primary">₹19 Unlock</th>
                    <th className="text-center px-4 py-4 font-semibold text-amber-600 dark:text-amber-400">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Scans per month', '1', '1', '200'],
                    ['Basic score (0–100)', '✓', '✓', '✓'],
                    ['Site structure check', '✓', '✓', '✓'],
                    ['Missing pages detection', '✓', '✓', '✓'],
                    ['Critical issues list', '✓', '✓', '✓'],
                    ['Full AI content analysis', '—', '✓', '✓'],
                    ['Policy risk deep scan', '—', '✓', '✓'],
                    ['Prioritized fix suggestions', '—', '✓', '✓'],
                    ['Trust & UX scoring', '—', '✓', '✓'],
                    ['Content rewriting tool', '—', '—', '✓'],
                    ['Privacy Policy generator', '—', '—', '✓'],
                    ['SEO optimization suggestions', '—', '—', '✓'],
                  ].map(([feature, free, unlock, pro]) => (
                    <tr key={feature} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3.5 text-foreground font-medium">{feature}</td>
                      <td className="px-4 py-3.5 text-center text-muted-foreground">{free}</td>
                      <td className="px-4 py-3.5 text-center text-primary font-medium">{unlock}</td>
                      <td className="px-4 py-3.5 text-center text-amber-600 dark:text-amber-400 font-medium">{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-foreground text-center mb-10">What publishers say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { q: 'The ₹19 report was the best ₹19 I ever spent. Got approved in 5 days.', a: 'Rahul M.', r: 'Blogger' },
              { q: 'Pro plan pays for itself with one AdSense approval. Absolutely worth it.', a: 'Sneha K.', r: 'Publisher' },
              { q: 'Free scan showed me the score. ₹19 unlock showed me exactly what to fix.', a: 'Arjun P.', r: 'Content Creator' },
            ].map(({ q, a, r }) => (
              <div key={a} className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-foreground mb-4">&ldquo;{q}&rdquo;</p>
                <div>
                  <p className="text-xs font-semibold text-foreground">{a}</p>
                  <p className="text-xs text-muted-foreground">{r}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/20 border-t border-border/60">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-foreground text-center mb-10">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="rounded-2xl border border-border/60 bg-card p-5">
                  <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black text-foreground mb-4">Ready to get AdSense approved?</h2>
        <p className="text-muted-foreground mb-8">Start free. No credit card required.</p>
        <Link href="/auth/signup">
          <Button size="lg" className="gap-2 h-13 px-10 text-base shadow-lg shadow-primary/25" style={{ height: '52px' }}>
            Start Free Analysis <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  )
}

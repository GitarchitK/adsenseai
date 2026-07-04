'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Lock, Zap, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Target, Clock, Globe } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'
import { MasterReport } from '@/lib/firebase-types'

export default function ResultsPage() {
  const { isPro, getToken } = useProfile()
  const { openCheckout } = useRazorpay()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [planError, setPlanError] = useState('')

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('lastCrawlData')
      if (s) {
        setData(JSON.parse(s))
      } else {
        setError('No scan data found. Please run a scan first.')
      }
    } catch { setError('Failed to load results.') }
    finally { setLoading(false) }
  }, [])

  const handleUnlock = async () => {
    setPlanError('')
    setIsUnlocking(true)
    try {
      const t = await getToken()
      if (!t) { setPlanError('Please sign in again.'); setIsUnlocking(false); return }
      
      const orderRes = await fetch('/api/razorpay/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ action: 'create_order', scanId: data?.scan_id, url: data?.domain }),
      })
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        setPlanError(err.error ?? 'Server error.')
        setIsUnlocking(false)
        return
      }
      
      const order = await orderRes.json()
      await openCheckout({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: 'AdSense Checker AI', description: 'Full Report Unlock — ₹19', order_id: order.orderId,
        handler: async (r: any) => {
          try {
            const verifyRes = await fetch('/api/razorpay/unlock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
              body: JSON.stringify({
                action: 'verify',
                orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id,
                signature: r.razorpay_signature, scanId: data?.scan_id, url: data?.domain
              }),
            })
            if (verifyRes.ok) {
              window.location.href = `/dashboard/scans/${data?.scan_id}`
            } else {
              setPlanError('Payment verified but failed to unlock report.')
            }
          } catch (err) {
            setPlanError('Payment succeeded but unlock failed. Contact support.')
          } finally {
            setIsUnlocking(false)
          }
        },
        prefill: {}, theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setIsUnlocking(false) },
      })
    } catch (err: any) {
      if (err?.message !== 'dismissed') setPlanError('Something went wrong. Please try again.')
      setIsUnlocking(false)
    }
  }

  // Update title dynamically
  useEffect(() => {
    if (data) {
      const ai = data.ai_report || {}
      const seo = data.seo_hook || {}
      const overallScore = ai.readinessScore ?? data.scores?.final_score ?? 0
      document.title = seo.metaTitle || `AdSense Readiness Report for ${data.domain} — Score: ${overallScore}/100`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc && seo.metaDescription) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      if (metaDesc && seo.metaDescription) {
        metaDesc.setAttribute('content', seo.metaDescription);
      }
    }
  }, [data]);

  if (loading) return <div className="p-8 text-center">Loading results...</div>
  if (error || !data) return <div className="p-8 text-center text-red-500">{error}</div>

  const isUnlocked = data.isAiUnlocked
  // If unlocked, redirect immediately to the full report view
  if (isUnlocked) {
    if (typeof window !== 'undefined') window.location.href = `/dashboard/scans/${data.scan_id}`
    return <div className="p-8 text-center">Redirecting to full report...</div>
  }

  const ai = data.ai_report || {}
  const seo = data.seo_hook || {}
  const rawReadiness = typeof ai.readinessScore === 'object' && ai.readinessScore !== null && 'score' in ai.readinessScore ? (ai.readinessScore as any).score : ai.readinessScore;
  const overallScore = rawReadiness ?? data.scores?.final_score ?? 0
  const readiness = ai.approvalChance ?? data.statusLabel ?? 'Unknown'
  
  const scoreColor = overallScore >= 70 ? 'text-emerald-500' : overallScore >= 50 ? 'text-amber-500' : 'text-red-500'

  const resultsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: seo.metaTitle || `AdSense Readiness Report: ${data.domain}`,
        description: seo.metaDescription || `AdSense readiness score ${overallScore}/100 for ${data.domain}. Niche: ${ai.detectedNiche}. Approval chance: ${ai.approvalChancePercent}%.`,
        url: `https://www.adsensechecker.in/dashboard/results`,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.adsensechecker.in" },
            { "@type": "ListItem", position: 2, name: `Report for ${data.domain}` },
          ],
        },
      }
    ],
  }
  
  const faqSchemaString = seo.faqSchema ? seo.faqSchema : JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ai.top3Issues?.map((issue: any) => ({
      "@type": "Question",
      name: `How to fix: ${issue.title} on ${data.domain}?`,
      acceptedAnswer: { "@type": "Answer", text: issue.basicDetail }
    })) || []
  })

  return (
    <div className="min-h-screen bg-background pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(resultsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchemaString }} />
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block"><ArrowLeft className="h-4 w-4 inline mr-1" /> Back to Dashboard</Link>
            <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" /> {data.domain}
            </h1>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-muted/50 text-xs font-bold border border-border/60">Free Preview</span>
            {planError && <p className="text-xs text-red-500 mt-2">{planError}</p>}
          </div>
        </div>

        <Card className="p-6 md:p-8 bg-gradient-to-br from-background to-muted/20 border-white/5 rounded-3xl shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Overall Score</p>
              <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                <span className={`text-6xl font-black tabular-nums ${scoreColor}`}>{overallScore}</span>
                <span className="text-xl text-muted-foreground font-bold">/ 100</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{readiness}</p>
            </div>
            
            <div className="space-y-4 bg-muted/30 p-5 rounded-2xl border border-border/50">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Detected Niche</p>
                <p className="text-sm font-medium">{ai.detectedNiche || 'Analyzing...'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Approval Chance</p>
                <p className="text-lg font-black text-primary">{ai.approvalChancePercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl border-emerald-500/20 bg-emerald-500/5">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Top Strengths</p>
            <ul className="space-y-3">
              {ai.strengths?.map((s: any, i: number) => (
                <li key={i} className="text-sm font-medium"><span className="text-emerald-500 font-bold">{s.title}:</span> {s.detail}</li>
              )) || <p className="text-sm">Calculating...</p>}
            </ul>
          </Card>
          <Card className="p-6 rounded-2xl border-red-500/20 bg-red-500/5">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Main Risks</p>
            <ul className="space-y-3">
              {ai.risks?.map((r: any, i: number) => (
                <li key={i} className="text-sm font-medium"><span className="text-red-500 font-bold">{r.title}:</span> {r.detail}</li>
              )) || <p className="text-sm">Calculating...</p>}
            </ul>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-black mb-4">Top Issues Found</h2>
          <div className="space-y-4">
            {ai.top3Issues?.map((issue: any, i: number) => (
              <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0 mt-1">
                  {issue.priorityLabel === 'Critical' ? <AlertTriangle className="h-6 w-6 text-red-500" /> : <AlertTriangle className="h-6 w-6 text-amber-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-base font-bold text-foreground">{issue.title}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted">{issue.priorityLabel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{issue.basicDetail}</p>
                  
                  <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30 relative overflow-hidden group cursor-pointer" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                     <div className="filter blur-[4px] opacity-70 pointer-events-none select-none">
                       <p className="text-xs font-bold uppercase mb-1">How to fix:</p>
                       <p className="text-sm">Step 1: Navigate to your site settings. Step 2: Implement the specific code changes required to resolve this AdSense violation...</p>
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold bg-background shadow-sm px-3 py-1 rounded-full border border-border/50">
                          Unlock ₹19 plan to see exact fix steps
                        </span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Paywall Section */}
        <div className="relative mt-12 rounded-3xl overflow-hidden border border-border/50 bg-card">
          <div className="p-8 space-y-6 filter blur-md opacity-50 pointer-events-none select-none">
            <h2 className="text-2xl font-black">Full Action Plan</h2>
            <div className="h-24 bg-muted rounded-xl w-full" />
            <div className="h-24 bg-muted rounded-xl w-full" />
            <div className="h-24 bg-muted rounded-xl w-3/4" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] z-10 p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2">Unlock Full Report — ₹19</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              Get the exact step-by-step action plan, policy deep-dive, technical health checks, and a custom AdSense readiness checklist.
            </p>
            <Button onClick={handleUnlock} disabled={isUnlocking} className="rounded-xl h-12 px-8 text-sm font-bold shadow-xl shadow-primary/20">
              {isUnlocking ? 'Unlocking...' : 'Unlock Full Report →'}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-4 font-medium uppercase tracking-widest">One-time payment. Yours forever.</p>
          </div>
        </div>

      </div>
    </div>
  )
}

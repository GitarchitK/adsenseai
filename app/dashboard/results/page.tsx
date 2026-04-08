'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowLeft, AlertCircle, CheckCircle2, AlertTriangle,
  ShieldCheck, ShieldAlert, Brain, Search, Sparkles,
  UserCheck, FileText, Lightbulb, Globe, Lock, Crown, Zap, Calendar, TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'
import type { CrawlResponse } from '@/types'
import type { ScoreBreakdown } from '@/lib/scores'
import type { AIReport, FixSuggestion } from '@/services/ai-report'

interface CrawlResult extends CrawlResponse {
  scores?: ScoreBreakdown
  ai_report?: AIReport
  scan_id?: string
  plan?: string
  crawl_data?: CrawlResponse | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const sc  = (s: number) => s >= 80 ? 'text-emerald-600 dark:text-emerald-400' : s >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
const bc  = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500'
const sBg = (st: string) => st === 'high' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' : st === 'moderate' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
const sTx = (st: string) => st === 'high' ? 'text-emerald-700 dark:text-emerald-300' : st === 'moderate' ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300'
const imp = (i: FixSuggestion['impact']) => i === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : i === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-muted text-muted-foreground'
const catI = (c: FixSuggestion['category']) => { const cls = 'h-4 w-4'; switch(c) { case 'Content': return <FileText className={cls} />; case 'Policy': return <ShieldCheck className={cls} />; case 'SEO': return <Search className={cls} />; case 'UX': return <UserCheck className={cls} />; case 'Trust': return <CheckCircle2 className={cls} /> } }

function ScoreRing({ score, status }: { score: number; status: string }) {
  const r = 52, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ
  const stroke = status === 'high' ? '#10b981' : status === 'moderate' ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/25" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="text-center z-10">
        <span className={`text-4xl font-bold tabular-nums ${sc(score)}`}>{score}</span>
        <span className="block text-[11px] text-muted-foreground font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

function WeightBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 flex-shrink-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{weight}</p>
      </div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bc(score)}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold font-mono w-8 text-right tabular-nums ${sc(score)}`}>{score}</span>
    </div>
  )
}

function CatCard({ icon, title, score, desc, items = [], type = 'neutral' }: {
  icon: React.ReactNode; title: string; score: number; desc: string
  items?: string[]; type?: 'issue' | 'warning' | 'good' | 'neutral'
}) {
  const dot = type === 'issue' ? <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
    : type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
    : type === 'good' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
    : <div className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
  return (
    <Card className="p-5 border-border/60 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">{icon}</div>
          <div><p className="font-semibold text-sm text-foreground">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-2xl font-bold tabular-nums ${sc(score)}`}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bc(score)}`} style={{ width: `${score}%` }} />
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5 border-t border-border/60 pt-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">{dot}<span>{item}</span></li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// ── Paywall overlay ───────────────────────────────────────────────────────────
function AiPaywall({ onUnlock, onUpgrade, isUnlocking, isPro, error }: {
  onUnlock: () => void; onUpgrade: () => void; isUnlocking: boolean; isPro: boolean; error?: string
}) {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5 overflow-hidden">
      {/* Blurred preview */}
      <div className="p-6 space-y-3 blur-sm pointer-events-none select-none" aria-hidden>
        {[85, 72, 91, 68, 78].map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-32 h-3 rounded bg-muted" />
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${bc(s)}`} style={{ width: `${s}%` }} />
            </div>
            <span className="text-sm font-mono w-8 text-right text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 bg-background/60 backdrop-blur-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-bold text-foreground text-lg">
            {isPro ? 'AI Report Needs Generation' : 'Full AI Report Locked'}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {isPro 
              ? 'This scan was completed without AI analysis. Click below to generate your detailed report for free.'
              : 'Unlock deep AI analysis: E-E-A-T score, policy risk, monetization potential (CPC/CPM), and exact fix suggestions.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          {/* One-time unlock (Hide if Pro) */}
          {!isPro && (
            <Button
              className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25"
              onClick={onUnlock}
              disabled={isUnlocking}
            >
              {isUnlocking
                ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <Zap className="h-4 w-4" />}
              Unlock for ₹19
            </Button>
          )}

          {/* Pro action: Generate or Upgrade */}
          {isPro ? (
            <Button
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white border-0 shadow-lg shadow-primary/25"
              onClick={onUnlock}
              disabled={isUnlocking}
            >
              {isUnlocking
                ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <Sparkles className="h-4 w-4" />}
              Generate Report (Pro Free)
            </Button>
          ) : (
            <Button variant="outline" className="flex-1 gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={onUpgrade}>
              <Crown className="h-4 w-4" /> Pro ₹199/mo
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {isPro ? 'Included in your Pro subscription' : 'Pro includes 200 scans/month + AI on every scan'}
        </p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { token, isPro, getToken } = useProfile()
  const { openCheckout } = useRazorpay()
  const [data, setData] = useState<CrawlResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [aiReport, setAiReport] = useState<AIReport | null>(null)
  const [showAllPages, setShowAllPages] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'plan' | 'pages'>('overview')

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('lastCrawlData')
      if (s) {
        const parsed = JSON.parse(s) as CrawlResult
        setData(parsed)
        if (parsed.ai_report) setAiReport(parsed.ai_report)
      } else {
        setError('No scan data found. Please run a scan first.')
      }
    } catch { setError('Failed to load results.') }
    finally { setLoading(false) }
  }, [])

  const handleUnlock = async () => {
    setUnlockError('')
    setIsUnlocking(true)

    try {
      const t = await getToken()
      if (!t) {
        setUnlockError('Please sign in again to continue.')
        setIsUnlocking(false)
        return
      }

      const scanId = data?.scan_id ?? 'temp_' + Date.now()

      if (isPro) {
        const res = await fetch('/api/razorpay/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
          body: JSON.stringify({
            action: 'pro_unlock',
            scanId,
            crawlData: data?.crawl_data ?? data,
          }),
        })
        if (res.ok) {
          const result = await res.json()
          if (result.ai_report) {
            setAiReport(result.ai_report)
            sessionStorage.setItem('lastCrawlData', JSON.stringify({ ...data, ai_report: result.ai_report }))
          }
        } else {
          const err = await res.json().catch(() => ({}))
          setUnlockError(err.error ?? 'Failed to generate report. Please try again.')
        }
        setIsUnlocking(false)
        return
      }

      const orderRes = await fetch('/api/razorpay/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({
          action: 'create_order_direct',
          scanId,
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        setUnlockError(err.error ?? `Server error (${orderRes.status}). Please try again.`)
        setIsUnlocking(false)
        return
      }

      const order = await orderRes.json()
      if (!order.orderId) {
        setUnlockError('Could not create payment order. Please try again.')
        setIsUnlocking(false)
        return
      }

      await openCheckout({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        'AdSenseAI',
        description: 'Full AI Report — One-time ₹19',
        order_id:    order.orderId,
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch('/api/razorpay/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
            body: JSON.stringify({
              action:    'verify',
              scanId:    data?.scan_id ?? scanId,
              orderId:   r.razorpay_order_id,
              paymentId: r.razorpay_payment_id,
              signature: r.razorpay_signature,
              crawlData: data?.crawl_data ?? data,
            }),
          })
          if (verifyRes.ok) {
            const result = await verifyRes.json()
            if (result.ai_report) {
              setAiReport(result.ai_report)
              sessionStorage.setItem('lastCrawlData', JSON.stringify({ ...data, ai_report: result.ai_report }))
            }
          } else {
            setUnlockError('Payment verified but report generation failed. Contact support.')
          }
        },
        prefill: {},
        theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setIsUnlocking(false) },
      })
    } catch (err) {
      console.error('[Unlock]', err)
      setUnlockError('Something went wrong. Please try again.')
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleUpgrade = async () => {
    const t = await getToken()
    if (!t) return
    const res = await fetch('/api/razorpay/order', { method: 'POST', headers: { Authorization: `Bearer ${t}` } })
    const order = await res.json()
    if (!order.orderId) return
    await openCheckout({
      key: order.keyId, amount: order.amount, currency: order.currency,
      name: 'AdSenseAI', description: 'Pro Plan — ₹199/month', order_id: order.orderId,
      handler: async () => { window.location.href = '/dashboard?upgraded=1' },
      prefill: {},
      theme: { color: '#7c3aed' },
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading results...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <Link href="/dashboard"><Button variant="ghost" className="gap-2 mb-4"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <Card className="p-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/30">
        <div className="flex gap-3"><AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-red-800 dark:text-red-300">{error}</p></div>
      </Card>
    </div>
  )

  const det = data.scores
  const ai  = aiReport

  const finalScore   = ai?.final_score   ?? det?.final_score   ?? 0
  const status       = ai?.status        ?? det?.status        ?? 'low'
  const statusLabel  = ai?.status_label  ?? det?.status_label  ?? 'Low'
  const qualityScore = ai?.quality_score ?? det?.quality_score ?? 0
  const policyScore  = ai?.policy_score  ?? det?.policy_score  ?? 0
  const seoScore     = ai?.seo_score     ?? det?.seo_score     ?? 0
  const uxScore      = ai?.ux_score      ?? det?.ux_score      ?? 0
  const trustScore   = ai?.trust_score   ?? det?.trust_score   ?? 0

  const issues          = det?.issues          ?? []
  const warnings        = det?.warnings        ?? []
  const recommendations = det?.recommendations ?? []
  const missingPages    = det?.missing_pages   ?? []
  const topIssues       = ai?.top_issues       ?? []
  const fixSuggestions  = ai?.fix_suggestions  ?? []
  const isAiUnlocked    = !!ai

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
              <Globe className="h-7 w-7 text-primary" />
              {data.domain}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" /> 
              Analyzed on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            {isAiUnlocked ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-black uppercase tracking-widest border border-violet-200 dark:border-violet-800/50">
                <Sparkles className="h-4 w-4" /> AI Report Unlocked
              </div>
            ) : (
              <Button onClick={handleUnlock} disabled={isUnlocking} className="w-full md:w-auto gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 rounded-xl px-6">
                {isUnlocking ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Lock className="h-4 w-4" />}
                Unlock Full AI Report — ₹19
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-2xl border border-border/40 w-full overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'issues',   label: 'Fix List',  icon: AlertCircle },
            { id: 'plan',     label: 'Action Plan', icon: Calendar },
            { id: 'pages',    label: 'Pages',     icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Score Overview Card */}
            <Card className="p-8 border-border/60 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              
              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ScoreRing score={finalScore} status={status} />
                  <div className="text-center md:text-left space-y-2">
                    <p className={`text-sm font-black uppercase tracking-[0.2em] ${sc(finalScore)}`}>
                      Overall Readiness
                    </p>
                    <h2 className="text-3xl font-black text-foreground">{statusLabel}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                      {finalScore >= 80 
                        ? "Your site is in excellent shape! You're ready to apply for AdSense with a high chance of approval."
                        : finalScore >= 60
                        ? "Site shows potential but needs key fixes before applying. Follow the Action Plan to improve."
                        : "Significant issues detected. AdSense will likely reject your site in its current state."}
                    </p>
                  </div>
                </div>

                <div className="space-y-5 bg-muted/20 p-6 rounded-2xl border border-border/40">
                  <WeightBar label="Content Quality" score={qualityScore} weight="35% Weight" />
                  <WeightBar label="Policy Compliance" score={policyScore} weight="30% Weight" />
                  <WeightBar label="SEO Performance" score={seoScore} weight="15% Weight" />
                  <WeightBar label="User Experience" score={uxScore} weight="10% Weight" />
                  <WeightBar label="Trust Signals" score={trustScore} weight="10% Weight" />
                </div>
              </div>
            </Card>

            {/* AI Insights & Verdict */}
            {isAiUnlocked && ai && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card className={`p-6 md:col-span-2 rounded-2xl border-2 ${
                  ai.adsense_ready ? 'border-emerald-300 bg-emerald-50/50' : 'border-amber-300 bg-amber-50/50'
                }`}>
                  <div className="flex items-start gap-4">
                    {ai.adsense_ready 
                      ? <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                      : <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />}
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-1">AI Verdict: {ai.adsense_ready ? 'AdSense Ready' : 'Fix Recommended'}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Our analysis suggests you should <span className="font-bold text-foreground underline">{ai.application_timeline}</span>.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 rounded-2xl border-border/60 bg-primary/5 group cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setActiveTab('plan')}>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">Action Plan</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">View your custom day-by-day roadmap to approval.</p>
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2">
                    View Plan <ArrowRight className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
            )}

            {/* Missing pages */}
            {missingPages.length > 0 && (
              <Card className="p-5 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm uppercase tracking-widest">Missing Required Pages</h3>
                    <p className="text-xs text-muted-foreground mb-3">Google AdSense requires these pages to verify your business identity and policy compliance:</p>
                    <div className="flex flex-wrap gap-2">
                      {missingPages.map(page => (
                        <span key={page} className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                          <AlertCircle className="h-3 w-3" /> {page}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Top Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CatCard icon={<FileText className="h-5 w-5" />} title="Content Quality" score={qualityScore} desc="Word count, readability, originality" 
                items={isAiUnlocked && ai ? [
                  `Quality: ${ai.content.overall_quality_score}/100`,
                  `Originality: ${ai.content.originality_score}%`,
                  `Readability: ${ai.content.readability_score}%`
                ] : ['Analysis of articles', 'Spam & word count check']}
                type={qualityScore >= 80 ? 'good' : qualityScore >= 60 ? 'warning' : 'issue'}
              />
              <CatCard icon={<ShieldCheck className="h-5 w-5" />} title="Policy Guard" score={policyScore} desc="Prohibited content, copyright risks" 
                items={isAiUnlocked && ai ? [
                  ai.policy.adult_content ? 'Adult content detected' : 'No adult content found',
                  ai.policy.copyright_risk ? 'Copyright risk identified' : 'Low copyright risk',
                  `${ai.policy.violations.length} violations found`
                ] : ['Compliance scan', 'Adult content check']}
                type={policyScore >= 80 ? 'good' : policyScore >= 60 ? 'warning' : 'issue'}
              />
              <CatCard icon={<Search className="h-5 w-5" />} title="SEO & Authority" score={seoScore} desc="Structure, meta data, authority" 
                items={isAiUnlocked && ai ? [
                  `Topical Authority: ${ai.seo_authority.topical_authority_score}/100`,
                  `${ai.seo_authority.content_density} density`,
                  `Technical Health: ${ai.technical_health.structural_integrity}/100`
                ] : ['Site structure check', 'Sitemap discovery']}
                type={seoScore >= 80 ? 'good' : seoScore >= 60 ? 'warning' : 'issue'}
              />
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">Required Fixes</h2>
              <div className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 uppercase tracking-widest">
                {isAiUnlocked && ai ? `${ai.fix_suggestions.length} Tasks` : 'Action Required'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAiUnlocked && ai ? (
                ai.fix_suggestions.map((fix, i) => (
                  <Card key={i} className="p-5 border-border/60 rounded-2xl flex items-start gap-4 group hover:border-primary/40 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {catI(fix.category)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-foreground">{fix.title}</h4>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${imp(fix.impact)}`}>
                          {fix.impact} Impact
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{fix.description}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 py-24 text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">Detailed Fixes are Locked</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">Unlock the AI report to see specific, prioritized fixes tailored to your website's content and structure.</p>
                  <Button onClick={handleUnlock} className="gap-2 px-8">
                    <Lock className="h-4 w-4" /> Unlock AI Fixes
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {isAiUnlocked && ai ? (
              <>
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-foreground">AI Action Plan</h2>
                    <p className="text-sm text-muted-foreground mt-1">Your customized roadmap to AdSense approval.</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold text-sm">
                    <Zap className="h-4 w-4" /> Recommendation: {ai.application_timeline}
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {ai.approval_workflow.map((step, i) => (
                      <Card key={i} className="p-6 border-border/60 rounded-2xl relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                        <div className="flex items-start gap-5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm shrink-0">
                            {i + 1}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                                {step.timeframe}
                              </span>
                              <h4 className="font-bold text-foreground">{step.task}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.details}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <Card className="p-6 border-border/60 rounded-2xl bg-muted/20">
                      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" /> Strategic Roadmap
                      </h3>
                      <ul className="space-y-4">
                        {ai.strategic_roadmap.map((tip, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                    
                    <Card className="p-6 border-violet-200 bg-violet-50/50 rounded-2xl text-center">
                      <TrendingUp className="h-8 w-8 text-violet-600 mx-auto mb-3" />
                      <h4 className="font-bold text-violet-900 mb-1">Estimated Potential</h4>
                      <p className="text-2xl font-black text-violet-700">$450 - $1,200 / mo</p>
                      <p className="text-[10px] text-violet-600 uppercase font-bold tracking-widest mt-1">Based on niche & authority</p>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 text-center space-y-6 max-w-md mx-auto">
                <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-foreground">Unlock Your Action Plan</h3>
                  <p className="text-sm text-muted-foreground">The AI needs to analyze your full site data to build a custom day-by-day roadmap for you.</p>
                </div>
                <Button onClick={handleUnlock} className="w-full gap-2 shadow-xl shadow-primary/20 h-12 rounded-xl text-base font-bold">
                  <Lock className="h-4 w-4" /> Unlock Plan — ₹19
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-foreground">Pages Analyzed <span className="text-muted-foreground font-normal text-sm">({data.total_pages})</span></h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-[10px] font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap">
                  <TrendingUp className="h-3 w-3" /> LATEST-FIRST
                </div>
              </div>
              {data.total_pages > 8 && (
                <Link href={`/dashboard/articles?scanId=${data.scan_id || ''}`}>
                  <Button variant="ghost" size="sm" className="text-xs text-primary font-bold hover:text-primary hover:bg-primary/5">
                    View All Articles <ArrowRight className="h-3 w-3 ml-1.5" />
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.pages.slice(0, 8).map((page, i) => (
                <Card key={i} className="p-4 border-border/60 rounded-xl hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">{page.title || 'No Title'}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-mono">{page.url}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{page.word_count} words</span>
                        {page.headings.h1.length === 0 && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Missing H1</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <Link href={`/dashboard/articles?scanId=${data.scan_id || ''}`} className="block">
              <Card className="p-4 border-dashed border-border/60 rounded-xl text-center hover:bg-muted/30 transition-colors">
                <p className="text-sm text-muted-foreground">
                  The AI analyzed the latest 50 articles. <span className="font-bold text-primary">View Deep Content Analysis →</span>
                </p>
              </Card>
            </Link>
          </div>
        )}

        {/* Next steps banner */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-black text-foreground italic">"One final scan away from revenue."</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Once you've completed the tasks in your Action Plan, run a final scan to verify your readiness score is 80+ before applying.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">Run Final Scan</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
